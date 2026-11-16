import type { Transaction } from '../../api.ts'
import { formatLedgerDate } from '../../lib/format.ts'
import { Amount } from '../atoms/Amount.tsx'

export function MovementTable({
  transactions,
  loading,
  error,
}: {
  transactions: Transaction[]
  loading: boolean
  error: string | null
}) {
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
        <div className="ledger-scroll">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Cuenta</th>
                <th className="num">Importe</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Cargando movimientos.</td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const title = movementTitle(transaction)
                  return (
                    <tr key={transaction.id}>
                      <td className="ledger-date">{formatLedgerDate(transaction.date)}</td>
                      <td>
                        <div className="ledger-title">{title}</div>
                        {title !== transaction.category ? <span className="chip">{transaction.category}</span> : null}
                      </td>
                      <td className="ledger-account">{transaction.account}</td>
                      <td className="num">
                        <Amount value={transaction.amount} tone={transaction.type} size="row" signed />
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
          <span>
            {transactions.length} {transactions.length === 1 ? 'movimiento' : 'movimientos'}
          </span>
        </div>
      ) : null}
    </section>
  )
}

function movementTitle(transaction: Transaction) {
  const description = transaction.description.trim()
  return description && description !== transaction.category ? description : transaction.category
}
