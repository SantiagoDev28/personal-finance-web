import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState, type FormEvent, type ReactElement, type ReactNode } from 'react'
import type { Transaction, TransactionType, UpdateTransaction } from '../../api.ts'
import { ACCOUNTS, categoriesFor, isKnownAccount, withCurrent } from '../../lib/catalog.ts'
import { formatLedgerDate, formatSignedMoney } from '../../lib/format.ts'
import { Amount } from '../atoms/Amount.tsx'
import { Button } from '../atoms/Button.tsx'
import { Icon } from '../atoms/Icon.tsx'

const pageSize = 8

export function MovementTable({
  transactions,
  loading,
  error,
  onUpdate,
  onDelete,
}: {
  transactions: Transaction[]
  loading: boolean
  error: string | null
  onUpdate: (id: string, transaction: UpdateTransaction) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const [pending, setPending] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const mounted = useRef(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.max(1, Math.ceil(transactions.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const start = currentPage * pageSize
  const visible = transactions.slice(start, start + pageSize)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  async function save(transaction: UpdateTransaction) {
    if (!editing) return
    setPending(true)
    setActionError(null)
    try {
      await onUpdate(editing.id, transaction)
      if (mounted.current) setEditing(null)
    } catch (cause) {
      if (mounted.current) setActionError(messageFrom(cause, 'No se pudo guardar el movimiento.'))
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  async function remove() {
    if (!deleting) return
    setPending(true)
    setActionError(null)
    try {
      await onDelete(deleting.id)
      if (mounted.current) setDeleting(null)
    } catch (cause) {
      if (mounted.current) setActionError(messageFrom(cause, 'No se pudo eliminar el movimiento.'))
    } finally {
      if (mounted.current) setPending(false)
    }
  }

  const locked = pending || editing !== null || deleting !== null

  function openEditor(transaction: Transaction) {
    setActionError(null)
    setDeleting(null)
    setEditing(transaction)
  }

  function openDelete(transaction: Transaction) {
    setActionError(null)
    setEditing(null)
    setDeleting(transaction)
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
          <p>{loading ? 'Cargando la lista' : `${transactions.length} en la lista`}</p>
        </div>
      </div>

      {error || (!loading && transactions.length === 0) ? (
        <p className="ledger-empty">
          {error ? 'No se pudo mostrar la lista.' : 'Todavía no hay movimientos en la lista.'}
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
                visible.map((transaction) => {
                  const title = movementTitle(transaction)
                  return (
                    <tr key={transaction.id}>
                      <td className="ledger-date ledger-col-date">{formatLedgerDate(transaction.date)}</td>
                      <td className="ledger-col-detail">
                        <div className="ledger-main">
                          <span className="ledger-title">{title}</span>
                          {title !== transaction.category ? <span className="chip">{transaction.category}</span> : null}
                        </div>
                      </td>
                      <td className="ledger-account ledger-col-account">{transaction.account}</td>
                      <td className="num ledger-col-amount">
                        <Amount value={transaction.amount} tone={transaction.type} size="row" signed />
                      </td>
                      <td className="ledger-actions">
                        <Button type="button" disabled={locked} onClick={() => openEditor(transaction)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          className="button--danger"
                          disabled={locked}
                          onClick={() => openDelete(transaction)}
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

      {!loading && transactions.length > 0 ? (
        <div className="ledger-foot">
          <p className="ledger-range">
            {start + 1}–{start + visible.length} de {transactions.length}{' '}
            {transactions.length === 1 ? 'movimiento' : 'movimientos'}
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

      {editing ? (
        <EditDialog
          key={editing.id}
          transaction={editing}
          pending={pending}
          error={actionError}
          onClose={() => {
            if (pending) return
            setActionError(null)
            setEditing(null)
          }}
          onSave={save}
        />
      ) : null}

      {deleting ? (
        <DeleteDialog
          transaction={deleting}
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
  transaction,
  pending,
  error,
  onClose,
  onSave,
}: {
  transaction: Transaction
  pending: boolean
  error: string | null
  onClose: () => void
  onSave: (transaction: UpdateTransaction) => void
}) {
  const [draft, setDraft] = useState(() => draftFrom(transaction))
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
    const parsed = parseDraft(draft, transaction)
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
              {accounts.map((account) => (
                <option key={account} value={account}>
                  {account}
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

function DeleteDialog({
  transaction,
  pending,
  error,
  onClose,
  onConfirm,
}: {
  transaction: Transaction
  pending: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  const title = movementTitle(transaction)

  return (
    <Modal title="Eliminar movimiento" pending={pending} onClose={onClose}>
      <p className="dialog-copy">
        Se va a quitar {title} ({formatSignedMoney(transaction.amount, transaction.type)}) de la lista.
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

function Field({ label, children }: { label: string; children: ReactElement<{ id?: string }> }) {
  const id = useId()
  return (
    <div className="field">
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

function draftFrom(transaction: Transaction): Draft {
  return {
    description: transaction.description,
    category: transaction.category,
    account: transaction.account,
    type: transaction.type,
    amount: String(transaction.amount),
    date: transaction.date.slice(0, 10),
  }
}

function parseDraft(draft: Draft, original: Transaction): UpdateTransaction | string {
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
  if (category !== original.category || draft.type !== original.type) changes.category = category
  if (account !== original.account) changes.account = account
  if (draft.type !== original.type) changes.type = draft.type
  if (draft.date !== original.date.slice(0, 10)) changes.date = draft.date
  return changes
}

function pageNumbers(current: number, count: number) {
  const width = 5
  if (count <= width) return Array.from({ length: count }, (_, index) => index)
  const start = Math.min(Math.max(current - 2, 0), count - width)
  return Array.from({ length: width }, (_, index) => start + index)
}

function movementTitle(transaction: Transaction) {
  const description = transaction.description.trim()
  return description && description !== transaction.category ? description : transaction.category
}

function messageFrom(cause: unknown, fallback: string) {
  return cause instanceof Error && cause.message ? cause.message : fallback
}
