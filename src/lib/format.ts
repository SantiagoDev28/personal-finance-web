const pesos = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const percent = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
})

const share = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 1,
})

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function bogotaYearMonth(now = new Date()) {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
  }).format(now)
  const [year, month] = formatted.split('-')
  return { year: Number(year), month: Number(month) }
}

export function currentMonthTitle(now = new Date()) {
  const label = new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota',
    month: 'long',
    year: 'numeric',
  }).format(now)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatMoney(value: number) {
  return pesos.format(value)
}

export function formatSignedMoney(value: number, tone: 'income' | 'expense') {
  const body = formatMoney(Math.abs(value))
  return tone === 'expense' ? `− ${body}` : `+ ${body}`
}

export function formatPercent(value: number) {
  return `${percent.format(value)}%`
}

export function formatShare(part: number, total: number) {
  if (total <= 0) return '—'
  return `${share.format((part / total) * 100)}%`
}

export function formatLedgerDate(iso: string) {
  const day = iso.slice(8, 10)
  const month = MONTHS[Number(iso.slice(5, 7)) - 1] ?? ''
  return `${day} ${month}`
}

export function monthLabel(key: string) {
  return MONTHS[Number(key.slice(5, 7)) - 1] ?? key
}
