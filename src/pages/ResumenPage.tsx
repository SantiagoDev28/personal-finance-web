import { CategoryPie } from '../components/organisms/CategoryPie.tsx'
import { FlowChart } from '../components/organisms/FlowChart.tsx'
import { Amount } from '../components/atoms/Amount.tsx'
import { Label } from '../components/atoms/Label.tsx'
import type { FinanceState } from '../hooks/useFinance.ts'
import { currentMonthTitle, formatPercent } from '../lib/format.ts'
import { balanceDelta, categoryExpenses, monthTotals } from '../lib/series.ts'

export function ResumenPage({ transactions, error, loading }: FinanceState) {
  const ready = !loading && !error
  const month = ready ? monthTotals(transactions) : undefined
  const delta = ready ? balanceDelta(transactions) : null

  return (
    <div className="page">
      <header className="page-head">
        <div className="page-head-copy">
          <Label>Resumen</Label>
          <h1>{currentMonthTitle()}</h1>
          {delta ? (
            <p className="page-head-note">{formatPercent(delta.percent)} respecto al saldo del mes anterior</p>
          ) : null}
        </div>
      </header>

      {error ? <p className="banner">{error}</p> : null}

      <div className="summary-cards">
        <article className="card summary-card">
          <Label>Saldo</Label>
          <Amount value={month?.balance} tone={month && month.balance < 0 ? 'expense' : 'neutral'} />
        </article>
        <article className="card summary-card">
          <Label>Ingresos</Label>
          <Amount value={month?.income} tone="income" />
        </article>
        <article className="card summary-card">
          <Label>Gastos</Label>
          <Amount value={month?.expense} tone="expense" />
        </article>
      </div>

      <div className="page-board">
        <CategoryPie slices={ready ? categoryExpenses(transactions) : []} loading={loading} error={error} />
        <FlowChart income={month?.income} expense={month?.expense} loading={loading} error={error} />
      </div>
    </div>
  )
}
