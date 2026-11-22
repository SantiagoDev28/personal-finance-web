import { MovementTable } from '../components/organisms/MovementTable.tsx'
import type { FinanceState } from '../hooks/useFinance.ts'

export function MovimientosPage({
  entries,
  account,
  loading,
  listLoading,
  error,
  listError,
  setAccount,
  updateTransaction,
  deleteTransaction,
  createPayment,
  updatePayment,
  deletePayment,
}: FinanceState) {
  const listProblem = listError ?? (entries.length === 0 ? error : null)

  return (
    <div className="page page--fill">
      <header className="page-head">
        <h1>Movimientos</h1>
      </header>
      {error && entries.length > 0 ? <p className="banner">{error}</p> : null}
      <MovementTable
        entries={entries}
        account={account}
        loading={loading || listLoading}
        error={listProblem}
        onAccount={setAccount}
        onCreatePayment={createPayment}
        onUpdateTransaction={updateTransaction}
        onDeleteTransaction={deleteTransaction}
        onUpdatePayment={updatePayment}
        onDeletePayment={deletePayment}
      />
    </div>
  )
}
