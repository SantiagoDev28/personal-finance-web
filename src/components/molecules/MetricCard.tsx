import { Amount } from '../atoms/Amount.tsx'
import { Icon, type IconName } from '../atoms/Icon.tsx'
import { Label } from '../atoms/Label.tsx'

export function MetricCard({
  label,
  icon,
  tone,
  value,
  detail,
  detailValue,
}: {
  label: string
  icon: IconName
  tone: 'income' | 'expense'
  value?: number
  detail: string
  detailValue: string
}) {
  return (
    <article className={`card metric metric--${tone}`}>
      <div className="metric-top">
        <span className="metric-name">
          <Icon name={icon} />
          <Label>{label}</Label>
        </span>
        <Label>Acumulado</Label>
      </div>
      <Amount value={value} tone={tone} />
      <div className="metric-foot">
        <span>{detail}</span>
        <strong>{detailValue}</strong>
      </div>
    </article>
  )
}
