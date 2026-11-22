import type { TransactionType } from '../api.ts'

export const CARD_ACCOUNT = 'Tarjeta crédito'

export const CASH_ACCOUNTS = ['Efectivo', 'Nequi', 'Nu', 'Daviplata'] as const

export const ACCOUNTS = [...CASH_ACCOUNTS, CARD_ACCOUNT] as const

export const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Hogar',
  'Tecnología',
  'Educación',
  'Deporte',
  'Ropa',
  'Entretenimiento',
  'Suscripciones',
  'Otros',
] as const

export const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Barberia', 'Otros ingresos'] as const

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function withCurrent(options: readonly string[], current: string) {
  if (!current || options.includes(current)) return options
  return [current, ...options]
}

export function isKnownAccount(value: string) {
  return (ACCOUNTS as readonly string[]).includes(value)
}

export function isCashAccount(value: string) {
  return (CASH_ACCOUNTS as readonly string[]).includes(value)
}
