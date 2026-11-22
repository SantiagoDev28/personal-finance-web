import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react'
import type { NewCardPayment, TransactionType, UpdateCardPayment, UpdateTransaction } from '../../api.ts'
import { ACCOUNTS, CASH_ACCOUNTS, categoriesFor, isCashAccount, isKnownAccount, withCurrent } from '../../lib/catalog.ts'
import { formatLedgerDate, formatSignedMoney, todayIso } from '../../lib/format.ts'
import type { LedgerEntry } from '../../lib/ledger.ts'
import { Amount } from '../atoms/Amount.tsx'
import { Button } from '../atoms/Button.tsx'
import { Icon } from '../atoms/Icon.tsx'

const pageSize = 8

export function MovementTable({
  entries,
  account,
  loading,
  error,
  onAccount,
  onCreatePayment,
  onUpdateTransaction,
  onDeleteTransaction,
  onUpdatePayment,
  onDeletePayment,
}: {
  entries: LedgerEntry[]
  account: string
  loading: boolean
  error: string | null
  onAccount: (account: string) => void
  onCreatePayment: (payment: NewCardPayment) => Promise<void>
  onUpdateTransaction: (id: string, transaction: UpdateTransaction) => Promise<void>
  onDeleteTransaction: (id: string) => Promise<void>
  onUpdatePayment: (id: string, payment: UpdateCardPayment) => Promise<void>
  onDeletePayment: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState<LedgerEntry | null>(null)
  const [deleting, setDeleting] = useState<LedgerEntry | null>(null)
  const [creating, setCreating] = useState(false)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [pageAccount, setPageAccount] = useState(account)
  const mounted = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  if (pageAccount !== account) {
    setPageAccount(account)
    setPage(0)
  }
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const start = currentPage * pageSize
  const visible = entries.slice(start, start + pageSize)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [account])

  async function saveTransaction(transaction: UpdateTransaction) {
    if (!editing || editing.kind === 'card_payment') return
    setPending(true)
    setActionError(null)
    try {
      await onUpdateTransaction(editing.id, transaction)
      if (mounted.current) setEditing(null)
    } catch (cause) {
      if (mounted.current) setActionError(messageFrom(cause, 'No se pudo guardar el movimiento.'))
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  async function savePayment(payment: UpdateCardPayment) {
    if (!editing || editing.kind !== 'card_payment') return
    setPending(true)
    setActionError(null)
    try {
      await onUpdatePayment(editing.id, payment)
      if (mounted.current) setEditing(null)
    } catch (cause) {
      if (mounted.current) setActionError(messageFrom(cause, 'No se pudo guardar el abono.'))
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  async function createPayment(payment: NewCardPayment) {
    setPending(true)
    setActionError(null)
    try {
      await onCreatePayment(payment)
      if (mounted.current) setCreating(false)
    } catch (cause) {
      if (mounted.current) setActionError(messageFrom(cause, 'No se pudo registrar el abono.'))
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  async function remove() {
    if (!deleting) return
    setPending(true)
    setActionError(null)
    try {
      if (deleting.kind === 'card_payment') await onDeletePayment(deleting.id)
      else await onDeleteTransaction(deleting.id)
      if (mounted.current) setDeleting(null)
    } catch (cause) {
      if (mounted.current) {
        setActionError(messageFrom(cause, deleting.kind === 'card_payment' ? 'No se pudo eliminar el abono.' : 'No se pudo eliminar el movimiento.'))
      }
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  const locked = pending || editing !== null || deleting !== null || creating

  function openEditor(entry: LedgerEntry) {
    setActionError(null)
    setDeleting(null)
    setCreating(false)
    setEditing(entry)
  }

  function openDelete(entry: LedgerEntry) {
    setActionError(null)
    setEditing(null)
    setCreating(false)
    setDeleting(entry)
  }

  function openCreate() {
    setActionError(null)
    setEditing(null)
    setDeleting(null)
    setCreating(true)
  }

  function showPage(next: number) {
    setPage(Math.min(Math.max(next, 0), pageCount - 1))
    scrollRef.current?.scrollTo({ top: 0 })
  }

  return (
    <section className="card ledger" aria-label="Movimientos">
      <div className="ledger-head">
        <div>
          <h2>Últimos movimientos</h2>
          <p>{loading ? 'Cargando la lista' : `${entries.length} en la lista`}</p>
        </div>
        <div className="ledger-tools">
          <select
            className="ledger-filter"
            aria-label="Filtrar por cuenta"
            value={account}
            disabled={locked || loading}
            onChange={(event) => onAccount(event.target.value)}
          >
            <option value="">Todas las cuentas</option>
            {ACCOUNTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <Button type="button" tone="primary" disabled={locked || loading} onClick={openCreate}>
            Registrar abono
          </Button>
        </div>
      </div>

      {error || (!loading && entries.length === 0) ? (
        <p className="ledger-empty">
          {error ? 'No se pudo mostrar la lista.' : account ? 'Esta cuenta no tiene movimientos.' : 'Todavía no hay movimientos en la lista.'}
        </p>
      ) : (
        <div className="ledger-scroll" ref={scrollRef}>
          <table>
            <thead>
              <tr>
                <th className="ledger-col-date" scope="col">
                  Fecha
                </th>
                <th className="ledger-col-detail" scope="col">
                  Descripción
                </th>
                <th className="ledger-col-account" scope="col">
                  Cuenta
                </th>
                <th className="num ledger-col-amount" scope="col">
                  Importe
                </th>
                <th className="ledger-actions" scope="col">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Cargando movimientos.</td>
                </tr>
              ) : (
                visible.map((entry) => {
                  const title = movementTitle(entry)
                  const chip = entry.kind === 'card_payment' ? 'Abono' : entry.category
                  const tone = entry.kind === 'income' ? 'income' : 'expense'
                  return (
                    <tr key={`${entry.kind}-${entry.id}`}>
                      <td className="ledger-date ledger-col-date">{formatLedgerDate(entry.date)}</td>
                      <td className="ledger-col-detail">
                        <div className="ledger-main">
                          <span className="ledger-title">{title}</span>
                          {chip && chip !== title ? <span className="chip">{chip}</span> : null}
                        </div>
                      </td>
                      <td className="ledger-account ledger-col-account">{entry.account}</td>
                      <td className="num ledger-col-amount">
                        <Amount value={entry.amount} tone={tone} size="row" signed />
                      </td>
                      <td className="ledger-actions">
                        <Button type="button" disabled={locked} onClick={() => openEditor(entry)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          className="button--danger"
                          disabled={locked}
                          onClick={() => openDelete(entry)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && entries.length > 0 ? (
        <div className="ledger-foot">
          <p className="ledger-range">
            {start + 1}–{start + visible.length} de {entries.length}{' '}
            {entries.length === 1 ? 'movimiento' : 'movimientos'}
          </p>
          <nav className="pager" aria-label="Paginación">
            <button
              type="button"
              className="pager-button"
              aria-label="Página anterior"
              disabled={currentPage === 0}
              onClick={() => showPage(currentPage - 1)}
            >
              <Icon name="left" />
            </button>
            {pageNumbers(currentPage, pageCount).map((index) => (
              <button
                key={index}
                type="button"
                className={index === currentPage ? 'pager-button pager-button--current' : 'pager-button'}
                aria-label={`Página ${index + 1}`}
                aria-current={index === currentPage ? 'page' : undefined}
                onClick={() => showPage(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="pager-button"
              aria-label="Página siguiente"
              disabled={currentPage >= pageCount - 1}
              onClick={() => showPage(currentPage + 1)}
            >
              <Icon name="right" />
            </button>
          </nav>
        </div>
      ) : null}

      {editing && editing.kind !== 'card_payment' ? (
        <EditDialog
          key={editing.id}
          entry={editing}
          pending={pending}
          error={actionError}
          onClose={() => {
            if (pending) return
            setActionError(null)
            setEditing(null)
          }}
          onSave={saveTransaction}
        />
      ) : null}

      {editing && editing.kind === 'card_payment' ? (
        <PaymentDialog
          key={editing.id}
          entry={editing}
          pending={pending}
          error={actionError}
          onClose={() => {
            if (pending) return
            setActionError(null)
            setEditing(null)
          }}
          onCreate={createPayment}
          onSave={savePayment}
        />
      ) : null}

      {creating ? (
        <PaymentDialog
          entry={null}
          pending={pending}
          error={actionError}
          onClose={() => {
            if (pending) return
            setActionError(null)
            setCreating(false)
          }}
          onCreate={createPayment}
          onSave={savePayment}
        />
      ) : null}

      {deleting ? (
        <DeleteDialog
          entry={deleting}
          pending={pending}
          error={actionError}
          onClose={() => {
            if (pending) return
            setActionError(null)
            setDeleting(null)
          }}
          onConfirm={remove}
        />
      ) : null}
    </section>
  )
}

function EditDialog({
  entry,
  pending,
  error,
  onClose,
  onSave,
}: {
  entry: LedgerEntry
  pending: boolean
  error: string | null
  onClose: () => void
  onSave: (transaction: UpdateTransaction) => void
}) {
  const [draft, setDraft] = useState(() => draftFrom(entry))
  const [localError, setLocalError] = useState<string | null>(null)
  const formError = localError ?? error

  function changeType(type: TransactionType) {
    setDraft((current) => {
      const categories = categoriesFor(type)
      const category = categories.includes(current.category) ? current.category : (categories[0] ?? current.category)
      return { ...current, type, category }
    })
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = parseDraft(draft, entry)
    if (typeof parsed === 'string') {
      setLocalError(parsed)
      return
    }
    setLocalError(null)
    if (Object.keys(parsed).length === 0) {
      onClose()
      return
    }
    onSave(parsed)
  }

  const categories = withCurrent(categoriesFor(draft.type), draft.category)
  const accounts = withCurrent(ACCOUNTS, draft.account)

  return (
    <Modal title="Editar movimiento" pending={pending} onClose={onClose}>
      <form className="dialog-form" onSubmit={submit}>
        <div className="field-grid">
          <Field label="Tipo">
            <select
              value={draft.type}
              disabled={pending}
              onChange={(event) => changeType(event.target.value as TransactionType)}
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </Field>
          <Field label="Importe">
            <input
              inputMode="numeric"
              value={draft.amount}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
            />
          </Field>
          <Field label="Categoría">
            <select
              value={draft.category}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Cuenta">
            <select
              value={draft.account}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, account: event.target.value })}
            >
              {accounts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha">
            <input
              type="date"
              value={draft.date}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </Field>
          <Field label="Descripción" wide>
            <input
              value={draft.description}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </Field>
        </div>
        {formError ? <p className="dialog-error">{formError}</p> : null}
        <div className="dialog-actions">
          <Button type="button" disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="primary" disabled={pending}>
            {pending ? 'Guardando' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function PaymentDialog({
  entry,
  pending,
  error,
  onClose,
  onCreate,
  onSave,
}: {
  entry: LedgerEntry | null
  pending: boolean
  error: string | null
  onClose: () => void
  onCreate: (payment: NewCardPayment) => void
  onSave: (payment: UpdateCardPayment) => void
}) {
  const [draft, setDraft] = useState(() => paymentDraftFrom(entry))
  const [localError, setLocalError] = useState<string | null>(null)
  const formError = localError ?? error
  const accounts = withCurrent(CASH_ACCOUNTS, draft.sourceAccount)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!entry) {
      const parsed = parseNewPayment(draft)
      if (typeof parsed === 'string') {
        setLocalError(parsed)
        return
      }
      setLocalError(null)
      onCreate(parsed)
      return
    }
    const parsed = parsePaymentChanges(draft, entry)
    if (typeof parsed === 'string') {
      setLocalError(parsed)
      return
    }
    setLocalError(null)
    if (Object.keys(parsed).length === 0) {
      onClose()
      return
    }
    onSave(parsed)
  }

  return (
    <Modal title={entry ? 'Editar abono' : 'Registrar abono'} pending={pending} onClose={onClose}>
      <p className="dialog-copy">Sale de la cuenta de origen y baja el pendiente de la tarjeta.</p>
      <form className="dialog-form" onSubmit={submit}>
        <div className="field-grid">
          <Field label="Importe">
            <input
              inputMode="numeric"
              value={draft.amount}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
            />
          </Field>
          <Field label="Cuenta de origen">
            <select
              value={draft.sourceAccount}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, sourceAccount: event.target.value })}
            >
              {accounts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha">
            <input
              type="date"
              value={draft.date}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, date: event.target.value })}
            />
          </Field>
          <Field label="Descripción">
            <input
              value={draft.description}
              placeholder={entry ? undefined : 'Opcional'}
              disabled={pending}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </Field>
        </div>
        {formError ? <p className="dialog-error">{formError}</p> : null}
        <div className="dialog-actions">
          <Button type="button" disabled={pending} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" tone="primary" disabled={pending}>
            {pending ? 'Guardando' : entry ? 'Guardar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function DeleteDialog({
  entry,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  entry: LedgerEntry
  pending: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  const title = movementTitle(entry)
  const tone = entry.kind === 'income' ? 'income' : 'expense'

  return (
    <Modal title={entry.kind === 'card_payment' ? 'Eliminar abono' : 'Eliminar movimiento'} pending={pending} onClose={onClose}>
      <p className="dialog-copy">
        Se va a quitar {title} ({formatSignedMoney(entry.amount, tone)}) de la lista.
      </p>
      {error ? <p className="dialog-error">{error}</p> : null}
      <div className="dialog-actions">
        <Button type="button" disabled={pending} onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" className="button--danger" disabled={pending} onClick={onConfirm}>
          {pending ? 'Eliminando' : 'Eliminar'}
        </Button>
      </div>
    </Modal>
  )
}

function Modal({
  title,
  pending,
  onClose,
  children,
}: {
  title: string
  pending: boolean
  onClose: () => void
  children: ReactNode
}) {
  const titleId = useId()
  const setDialog = useCallback((node: HTMLDialogElement | null) => {
    if (node && !node.open) node.showModal()
  }, [])

  return (
    <dialog
      ref={setDialog}
      className="dialog"
      aria-labelledby={titleId}
      aria-busy={pending}
      onCancel={(event) => {
        event.preventDefault()
        if (!pending) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onClose()
      }}
    >
      <div className="dialog-body">
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </dialog>
  )
}

function Field({
  label,
  wide = false,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactElement<{ id?: string }>
}) {
  const id = useId()
  return (
    <div className={wide ? 'field field--wide' : 'field'}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {isValidElement(children) ? cloneElement(children, { id }) : children}
    </div>
  )
}

type Draft = {
  description: string
  category: string
  account: string
  type: TransactionType
  amount: string
  date: string
}

type PaymentDraft = {
  amount: string
  sourceAccount: string
  date: string
  description: string
}

function draftFrom(entry: LedgerEntry): Draft {
  return {
    description: entry.description,
    category: entry.category ?? '',
    account: entry.account,
    type: entry.kind === 'income' ? 'income' : 'expense',
    amount: String(entry.amount),
    date: entry.date.slice(0, 10),
  }
}

function paymentDraftFrom(entry: LedgerEntry | null): PaymentDraft {
  return {
    amount: entry ? String(entry.amount) : '',
    sourceAccount: entry?.account || CASH_ACCOUNTS[0],
    date: entry?.date.slice(0, 10) || todayIso(),
    description: entry?.description ?? '',
  }
}

function parseDraft(draft: Draft, original: LedgerEntry): UpdateTransaction | string {
  const description = draft.description.trim()
  const category = draft.category.trim()
  const account = draft.account.trim()
  const amount = Number(draft.amount)
  if (!category || !account) return 'Elige categoría y cuenta.'
  if (!Number.isInteger(amount) || amount <= 0) return 'El importe tiene que ser un entero mayor que cero.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return 'Elige una fecha válida.'
  if (!categoriesFor(draft.type).includes(category)) return 'La categoría no corresponde a este tipo.'
  if (!isKnownAccount(account)) return 'La cuenta no es válida.'

  const changes: UpdateTransaction = {}
  if (amount !== Number(original.amount)) changes.amount = amount
  if (description !== original.description.trim()) changes.description = description
  if (category !== original.category || draft.type !== original.kind) changes.category = category
  if (account !== original.account) changes.account = account
  if (draft.type !== original.kind) changes.type = draft.type
  if (draft.date !== original.date.slice(0, 10)) changes.date = draft.date
  return changes
}

function parseNewPayment(draft: PaymentDraft): NewCardPayment | string {
  const parsed = readPayment(draft)
  if (typeof parsed === 'string') return parsed
  const payment: NewCardPayment = {
    amount: parsed.amount,
    sourceAccount: parsed.sourceAccount,
    date: parsed.date,
  }
  if (parsed.description) payment.description = parsed.description
  return payment
}

function parsePaymentChanges(draft: PaymentDraft, original: LedgerEntry): UpdateCardPayment | string {
  const parsed = readPayment(draft)
  if (typeof parsed === 'string') return parsed
  if (!parsed.description) return 'La descripción no puede quedar vacía.'
  const changes: UpdateCardPayment = {}
  if (parsed.amount !== Number(original.amount)) changes.amount = parsed.amount
  if (parsed.sourceAccount !== original.account) changes.sourceAccount = parsed.sourceAccount
  if (parsed.description !== original.description.trim()) changes.description = parsed.description
  if (parsed.date !== original.date.slice(0, 10)) changes.date = parsed.date
  return changes
}

function readPayment(draft: PaymentDraft) {
  const sourceAccount = draft.sourceAccount.trim()
  const description = draft.description.trim()
  const amount = Number(draft.amount)
  if (!isCashAccount(sourceAccount)) return 'La cuenta de origen tiene que ser efectivo, Nequi, Nu o Daviplata.'
  if (!Number.isInteger(amount) || amount <= 0) return 'El importe tiene que ser un entero mayor que cero.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) return 'Elige una fecha válida.'
  return { amount, sourceAccount, date: draft.date, description }
}

function pageNumbers(current: number, count: number) {
  const width = 5
  if (count <= width) return Array.from({ length: count }, (_, index) => index)
  const start = Math.min(Math.max(current - 2, 0), count - width)
  return Array.from({ length: width }, (_, index) => start + index)
}

function movementTitle(entry: LedgerEntry) {
  const description = entry.description.trim()
  if (entry.kind === 'card_payment') return description || 'Abono'
  return description && description !== entry.category ? description : (entry.category ?? 'Movimiento')
}

function messageFrom(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback
}
