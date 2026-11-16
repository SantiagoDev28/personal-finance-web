import { formatMoney } from '../../lib/format.ts'
import type { MonthPoint } from '../../lib/series.ts'
import { Label } from '../atoms/Label.tsx'

export function FlowChart({ points, loading }: { points: MonthPoint[]; loading: boolean }) {
  const max = Math.max(...points.flatMap((point) => [point.income, point.expense]), 0)
  const income = points.reduce((sum, point) => sum + point.income, 0)
  const expense = points.reduce((sum, point) => sum + point.expense, 0)

  return (
    <section className="card chart" aria-label="Ingresos y gastos por mes">
      <div className="chart-head">
        <div>
          <h2>Ingresos y gastos</h2>
          <p>Últimos 6 meses</p>
        </div>
        <div className="legend">
          <span>
            <i className="swatch swatch--income" aria-hidden="true" />
            <Label>Ingresos</Label>
          </span>
          <span>
            <i className="swatch swatch--expense" aria-hidden="true" />
            <Label>Gastos</Label>
          </span>
        </div>
      </div>

      {loading ? (
        <p className="ledger-empty">Cargando el periodo.</p>
      ) : max === 0 ? (
        <p className="ledger-empty">Todavía no hay movimientos en este periodo.</p>
      ) : (
        <div className="chart-plot">
          {points.map((point) => (
            <div key={point.key} className={point.current ? 'chart-col chart-col--current' : 'chart-col'}>
              <div className="chart-bars">
                <div
                  className="chart-bar chart-bar--income"
                  style={{ height: `${barHeight(point.income, max)}%` }}
                  title={`Ingresos ${formatMoney(point.income)}`}
                />
                <div
                  className="chart-bar chart-bar--expense"
                  style={{ height: `${barHeight(point.expense, max)}%` }}
                  title={`Gastos ${formatMoney(point.expense)}`}
                />
              </div>
              <Label>{point.label}</Label>
            </div>
          ))}
        </div>
      )}

      {!loading && max > 0 ? (
        <div className="chart-foot">
          <span>Ingresos del periodo {formatMoney(income)}</span>
          <span>Gastos del periodo {formatMoney(expense)}</span>
        </div>
      ) : null}
    </section>
  )
}

function barHeight(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0
  return Math.max(4, Math.round((value / max) * 100))
}
