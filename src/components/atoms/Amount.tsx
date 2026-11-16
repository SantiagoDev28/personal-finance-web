import { formatMoney, formatSignedMoney } from '../../lib/format.ts'

type Tone = 'neutral' | 'income' | 'expense'
type Size = 'display' | 'metric' | 'row'

export function Amount({
  value,
  tone = 'neutral',
  size = 'metric',
  signed = false,
}: {
  value?: number
  tone?: Tone
  size?: Size
  signed?: boolean
}) {
  const text =
    value === undefined ? '—' : signed && tone !== 'neutral' ? formatSignedMoney(value, tone) : formatMoney(value)

  return <span className={`amount amount--${size} amount--${tone}`}>{text}</span>
}
