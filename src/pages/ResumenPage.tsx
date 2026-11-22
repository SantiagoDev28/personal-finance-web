import { CategoryPie } from '../components/organisms/CategoryPie.tsx'
import { FlowChart } from '../components/organisms/FlowChart.tsx'
import { Amount } from '../components/atoms/Amount.tsx'
import { Label } from '../components/atoms/Label.tsx'
import type { FinanceState } from '../hooks/useFinance.ts'
import { currentMonthTitle, formatPercent } from '../lib/format.ts'
import { balanceDelta, categoryExpenses } from '../lib/series.ts'

export function ResumenPage({ transactions, resume, previousResume, error, loading }: FinanceState) {
  const delta =
    !loading && resume && previousResume ? balanceDelta(resume.balance, previousResume.balance) : null
  const shown = !loading && resume !== null
  const rows = shown && resume
    ? [
        { label: 'Ingresos', value: resume.income, tone: 'income' as const },
        { label: 'Gastos de caja', value: resume.cashExpense, tone: 'expense' as const },
        { label: 'Gastos de tarjeta', value: resume.cardExpense, tone: 'expense' as const },
        { label: 'Abonos', value: resume.cardPayments, tone: 'payment' as const },
      ]
    : []

  return (
    <div className="page">
      <header className="page-head">
        <div className="page-head-copy">
          <Label>Resumen</Label>
          <h1>{currentMonthTitle()}</h1>
          {delta ? (
            <p className="page-head-note">{formatPercent(delta.percent)} respecto al saldo de caja del mes anterior</p>
          ) : null}
        </div>
      </header>

      {error ? <p className="banner">{error}</p> : null}

      <div className="summary-cards">
        <article className="card summary-card">
          <Label>Saldo de caja</Label>
          <Amount value={shown ? resume.balance : undefined} tone={resume && resume.balance < 0 ? 'expense' : 'neutral'} />
        </article>
        <article className="card summary-card">
          <Label>Ingresos</Label>
          <Amount value={shown ? resume.income : undefined} tone="income" />
        </article>
        <article className="card summary-card">
          <Label>Gastos de caja</Label>
          <Amount value={shown ? resume.cashExpense : undefined} tone="expense" />
        </article>
        <article className="card summary-card">
          <Label>Gastos de tarjeta</Label>
          <Amount value={shown ? resume.cardExpense : undefined} tone="expense" />
        </article>
        <article className="card summary-card">
          <Label>Abonos</Label>
          <Amount value={shown ? resume.cardPayments : undefined} tone="expense" />
        </article>
        <article className="card summary-card">
          <Label>Pendiente de tarjeta</Label>
          <Amount
            value={shown ? resume.cardOutstanding : undefined}
            tone={resume && resume.cardOutstanding > 0 ? 'expense' : 'neutral'}
          />
          {shown ? <p className="summary-note">Historia hasta el fin del mes</p> : null}
        </article>
      </div>

      <div className="page-board">
        <CategoryPie
          slices={shown ? categoryExpenses(transactions) : []}
          loading={loading}
          error={shown ? null : error}
        />
        <FlowChart rows={rows} loading={loading} error={shown ? null : error} />
      </div>
    </div>
  )
}
