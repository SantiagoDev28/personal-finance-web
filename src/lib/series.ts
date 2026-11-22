import type { Transaction } from '../api.ts'
import { bogotaYearMonth, monthLabel } from './format.ts'

export type MonthPoint = {
  key: string
  label: string
  income: number
  expense: number
  current: boolean
}

export function lastMonths(count: number, now = new Date()) {
  const current = bogotaYearMonth(now)
  let year = current.year
  let month = current.month
  const keys: string[] = []

  for (let index = 0; index < count; index += 1) {
    keys.unshift(`${year}-${String(month).padStart(2, '0')}`)
    month -= 1
    if (month === 0) {
      month = 12
      year -= 1
    }
  }

  return keys
}

export function seriesFrom(transactions: Transaction[], now = new Date()): MonthPoint[] {
  const keys = lastMonths(6, now)
  const totals = new Map(keys.map((key) => [key, { income: 0, expense: 0 }]))

  for (const transaction of transactions) {
    const bucket = totals.get(transaction.date.slice(0, 7))
    if (!bucket) continue
    if (transaction.type === 'income') bucket.income += transaction.amount
    else bucket.expense += transaction.amount
  }

  const currentKey = keys[keys.length - 1]
  return keys.map((key) => {
    const bucket = totals.get(key) ?? { income: 0, expense: 0 }
    return {
      key,
      label: monthLabel(key),
      income: bucket.income,
      expense: bucket.expense,
      current: key === currentKey,
    }
  })
}

export type CategorySpend = {
  category: string
  amount: number
}

export function categoryExpenses(transactions: Transaction[], now = new Date()): CategorySpend[] {
  const current = bogotaYearMonth(now)
  const key = `${current.year}-${String(current.month).padStart(2, '0')}`
  const totals = new Map<string, number>()

  for (const transaction of transactions) {
    if (transaction.type !== 'expense' || transaction.date.slice(0, 7) !== key) continue
    const category = transaction.category.trim() || 'Sin categoría'
    totals.set(category, (totals.get(category) ?? 0) + transaction.amount)
  }

  return [...totals.entries()]
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category, 'es'))
}

export function balanceDelta(current: number, previous: number) {
  if (previous === 0) return null
  return { percent: ((current - previous) / Math.abs(previous)) * 100 }
}
