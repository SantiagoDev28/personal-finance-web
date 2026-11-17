import { MovementTable } from '../components/organisms/MovementTable.tsx'
import type { FinanceState } from '../hooks/useFinance.ts'

export function MovimientosPage({ transactions, loading, error, updateTransaction, deleteTransaction }: FinanceState) {
  const newestFirst = [...transactions].sort((left, right) => {
    const byDate = right.date.localeCompare(left.date)
    return byDate || right.id.localeCompare(left.id)
  })

  return (
    <div className="page">
      <header className="page-head">
        <h1>Movimientos</h1>
      </header>
      <MovementTable
        transactions={newestFirst}
        loading={loading}
        error={error}
        onUpdate={updateTransaction}
        onDelete={deleteTransaction}
      />
    </div>
  )
}
