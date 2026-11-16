import { Amount } from '../atoms/Amount.tsx'
import { Label } from '../atoms/Label.tsx'

export function FlowChart({
  income,
  expense,
  loading,
  error,
}: {
  income?: number
  expense?: number
  loading: boolean
  error: string | null
}) {
  const max = Math.max(income ?? 0, expense ?? 0, 0)

  return (
    <section className="card chart" aria-label="Ingresos y gastos del mes">
      <div className="chart-head">
        <div>
          <h2>Ingresos y gastos</h2>
          <p>Mes actual</p>
        </div>
      </div>

      {loading ? (
        <p className="ledger-empty">Cargando el mes.</p>
      ) : error ? (
        <p className="ledger-empty">No se pudo mostrar el mes.</p>
      ) : max === 0 ? (
        <p className="ledger-empty">Todavía no hay movimientos en este mes.</p>
      ) : (
        <div className="compare">
          <CompareRow label="Ingresos" value={income ?? 0} max={max} tone="income" />
          <CompareRow label="Gastos" value={expense ?? 0} max={max} tone="expense" />
        </div>
      )}
    </section>
  )
}

function CompareRow({
  label,
  value,
  max,
  tone,
}: {
  label: string
  value: number
  max: number
  tone: 'income' | 'expense'
}) {
  const width = value <= 0 || max <= 0 ? 0 : Math.max(4, Math.round((value / max) * 100))

  return (
    <div className="compare-row">
      <div className="compare-label">
        <i className={`swatch swatch--${tone}`} aria-hidden="true" />
        <Label>{label}</Label>
      </div>
      <div className="compare-track" aria-hidden="true">
        <div className={`compare-fill compare-fill--${tone}`} style={{ width: `${width}%` }} />
      </div>
      <Amount value={value} tone={tone} size="row" />
    </div>
  )
}
