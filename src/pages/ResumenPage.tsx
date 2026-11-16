import { BalanceHero } from '../components/organisms/BalanceHero.tsx'
import { FlowChart } from '../components/organisms/FlowChart.tsx'
import { MovementTable } from '../components/organisms/MovementTable.tsx'
import { MetricCard } from '../components/molecules/MetricCard.tsx'
import { Label } from '../components/atoms/Label.tsx'
import type { FinanceState } from '../hooks/useFinance.ts'
import { exerciseLabel, formatPercent, formatShare } from '../lib/format.ts'
import { balanceDelta, seriesFrom } from '../lib/series.ts'

export function ResumenPage({ transactions, resume, error, loading }: FinanceState) {
  const incomeCount = transactions.filter((transaction) => transaction.type === 'income').length
  const delta = balanceDelta(transactions)
  const newestFirst = [...transactions].reverse()

  return (
    <div className="page">
      <header className="page-head" id="resumen">
        <h1>Resumen</h1>
        <Label>{exerciseLabel()}</Label>
      </header>

      {error ? <p className="banner">{error}</p> : null}

      <BalanceHero
        balance={resume?.balance}
        note={delta ? `${formatPercent(delta.percent)} respecto al saldo del mes anterior` : null}
      />

      <div className="metric-grid">
        <MetricCard
          label="Ingresos"
          icon="up"
          tone="income"
          value={resume?.income}
          detail="Movimientos"
          detailValue={loading ? '—' : String(incomeCount)}
        />
        <MetricCard
          label="Gastos"
          icon="down"
          tone="expense"
          value={resume?.expense}
          detail="Sobre los ingresos"
          detailValue={resume ? formatShare(resume.expense, resume.income) : '—'}
        />
      </div>

      <FlowChart points={seriesFrom(transactions)} loading={loading} />
      <MovementTable transactions={newestFirst} loading={loading} error={error} />
    </div>
  )
}
