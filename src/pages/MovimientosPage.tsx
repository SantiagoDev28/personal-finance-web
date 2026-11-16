import { MovementTable } from '../components/organisms/MovementTable.tsx'
import type { FinanceState } from '../hooks/useFinance.ts'

export function MovimientosPage({ transactions, loading, error }: FinanceState) {
  const newestFirst = [...transactions].reverse()

  return (
    <div className="page">
      <header className="page-head">
        <h1>Movimientos</h1>
      </header>
      <MovementTable transactions={newestFirst} loading={loading} error={error} />
    </div>
  )
}
