import type { AccountMovement, CardPayment, Transaction } from '../api.ts'

export type LedgerKind = 'income' | 'expense' | 'card_payment'

export type LedgerEntry = {
  id: string
  kind: LedgerKind
  amount: number
  description: string
  category: string | null
  account: string
  date: string
}

export function calendarDate(value: string) {
  return value.slice(0, 10)
}

export function fromTransaction(transaction: Transaction): LedgerEntry {
  return {
    id: transaction.id,
    kind: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    account: transaction.account,
    date: calendarDate(transaction.date),
  }
}

export function fromPayment(payment: CardPayment): LedgerEntry {
  return {
    id: payment.id,
    kind: 'card_payment',
    amount: payment.amount,
    description: payment.description,
    category: null,
    account: payment.sourceAccount,
    date: calendarDate(payment.date),
  }
}

export function fromMovement(movement: AccountMovement): LedgerEntry {
  return {
    id: movement.id,
    kind: movement.kind,
    amount: movement.amount,
    description: movement.description,
    category: movement.category ?? null,
    account: movement.account,
    date: calendarDate(movement.date),
  }
}

export function mergeLedger(transactions: Transaction[], payments: CardPayment[]) {
  return sortNewest([...transactions.map(fromTransaction), ...payments.map(fromPayment)])
}

export function sortNewest<T extends { date: string; id: string }>(entries: T[]) {
  return [...entries].sort((left, right) => {
    const byDate = right.date.localeCompare(left.date)
    return byDate || right.id.localeCompare(left.id)
  })
}
