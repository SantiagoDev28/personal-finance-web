import { formatMoney, formatShare } from '../../lib/format.ts'
import type { CategorySpend } from '../../lib/series.ts'
import { Amount } from '../atoms/Amount.tsx'
import { Label } from '../atoms/Label.tsx'

const SLICE_COUNT = 5
const RADIUS = 32
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function CategoryPie({
  slices,
  loading,
  error,
}: {
  slices: CategorySpend[]
  loading: boolean
  error: string | null
}) {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0)
  const arcs = dashArcs(slices, total)

  return (
    <section className="card chart" aria-label="Gastos por categoría del mes">
      <div className="chart-head">
        <div>
          <h2>Gastos por categoría</h2>
          <p>{loading || error || slices.length === 0 ? 'Mes actual' : leadLabel(slices)}</p>
        </div>
      </div>

      {loading ? (
        <p className="ledger-empty">Cargando el mes.</p>
      ) : error ? (
        <p className="ledger-empty">No se pudo mostrar el gasto del mes.</p>
      ) : slices.length === 0 ? (
        <p className="ledger-empty">Todavía no hay gastos en este mes.</p>
      ) : (
        <div className="donut-block">
          <div className="donut">
            <svg className="donut-svg" viewBox="0 0 100 100" aria-hidden="true">
              <circle className="donut-ring" cx="50" cy="50" r={RADIUS} />
              {arcs.map((arc) => (
                <circle
                  key={arc.category}
                  className={`donut-slice donut-slice--${arc.color}`}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
                  strokeDashoffset={-arc.offset}
                >
                  <title>{`${arc.category} ${formatMoney(arc.amount)}`}</title>
                </circle>
              ))}
            </svg>
            <div className="donut-center">
              <Label>Gastado</Label>
              <span className="donut-total">{formatMoney(total)}</span>
            </div>
          </div>
          <ul className="pie-list">
            {slices.map((slice, index) => (
              <li key={slice.category} className="pie-row">
                <i className={`swatch swatch--${(index % SLICE_COUNT) + 1}`} aria-hidden="true" />
                <span className="pie-name">{slice.category}</span>
                <span className="pie-share">{formatShare(slice.amount, total)}</span>
                <Amount value={slice.amount} size="row" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function leadLabel(slices: CategorySpend[]) {
  const top = slices[0]
  const tied = slices.filter((slice) => slice.amount === top.amount).map((slice) => slice.category)
  const names = new Intl.ListFormat('es-CO', { type: 'conjunction' }).format(tied)
  return tied.length === 1 ? `${names} es el mayor gasto` : `${names} empatan como mayor gasto`
}

function dashArcs(slices: CategorySpend[], total: number) {
  const gap = slices.length > 1 ? 3 : 0
  let offset = 0
  return slices.map((slice, index) => {
    const share = total > 0 ? slice.amount / total : 0
    const length = Math.max(0, share * CIRCUMFERENCE - gap)
    const arc = {
      ...slice,
      color: (index % SLICE_COUNT) + 1,
      length,
      offset,
    }
    offset += share * CIRCUMFERENCE
    return arc
  })
}
