import { Amount } from '../atoms/Amount.tsx'
import { Label } from '../atoms/Label.tsx'

export type FlowTone = 'income' | 'expense' | 'payment'

export function FlowChart({
  rows,
  loading,
  error,
}: {
  rows: { label: string; value: number; tone: FlowTone }[]
  loading: boolean
  error: string | null
}) {
  const max = Math.max(...rows.map((row) => row.value), 0)
  const empty = rows.every((row) => row.value === 0)

  return (
    <section className="card chart" aria-label="Ingresos, gastos y abonos del mes">
      <div className="chart-head">
        <div>
          <h2>Ingresos, gastos y abonos</h2>
          <p>Mes actual</p>
        </div>
      </div>

      {loading ? (
        <p className="ledger-empty">Cargando el mes.</p>
      ) : error ? (
        <p className="ledger-empty">No se pudo mostrar el mes.</p>
      ) : empty ? (
        <p className="ledger-empty">Todavía no hay movimientos en este mes.</p>
      ) : (
        <div className="compare">
          {rows.map((row) => (
            <CompareRow key={row.label} label={row.label} value={row.value} max={max} tone={row.tone} />
          ))}
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
  tone: FlowTone
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
      <Amount value={value} tone={tone === 'payment' ? 'expense' : tone} size="row" />
    </div>
  )
}
