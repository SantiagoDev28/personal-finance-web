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

export function monthBounds(offset = 0, now = new Date()) {
  const current = bogotaYearMonth(now)
  const anchor = new Date(Date.UTC(current.year, current.month - 1 + offset, 1))
  const year = anchor.getUTCFullYear()
  const month = anchor.getUTCMonth()
  const start = new Date(Date.UTC(year, month, 1))
  const end = new Date(Date.UTC(year, month + 1, 0))
  return { startDate: isoUtcDate(start), endDate: isoUtcDate(end) }
}

export function todayIso(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

function isoUtcDate(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
