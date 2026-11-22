import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createCardPayment,
  deleteCardPayment,
  deleteTransaction as deleteTransactionRequest,
  getResume,
  listAccountMovements,
  listCardPayments,
  listTransactions,
  updateCardPayment,
  updateTransaction as updateTransactionRequest,
  type NewCardPayment,
  type Resume,
  type Transaction,
  type UpdateCardPayment,
  type UpdateTransaction,
} from '../api.ts'
import { monthBounds } from '../lib/format.ts'
import { fromMovement, mergeLedger, sortNewest, type LedgerEntry } from '../lib/ledger.ts'

const savedMessage = 'El cambio se guardó, pero no se pudieron actualizar los datos.'

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [resume, setResume] = useState<Resume | null>(null)
  const [previousResume, setPreviousResume] = useState<Resume | null>(null)
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [account, setAccountState] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [listLoading, setListLoading] = useState(false)
  const accountRef = useRef('')
  const requestRef = useRef(0)

  const reload = useCallback(async (request = ++requestRef.current) => {
    const selected = accountRef.current
    try {
      const [listed, payments, totals, previousTotals] = await Promise.all([
        listTransactions(),
        listCardPayments(),
        getResume(monthBounds(0)),
        getResume(monthBounds(-1)),
      ])
      if (requestRef.current !== request) return
      setTransactions(listed)
      setResume(totals)
      setPreviousResume(previousTotals)

      const nextEntries = selected
        ? sortNewest((await listAccountMovements({ account: selected })).map(fromMovement))
        : mergeLedger(listed, payments)
      if (requestRef.current !== request) return
      setEntries(nextEntries)
      setError(null)
      setListError(null)
    } finally {
      if (requestRef.current === request) setListLoading(false)
    }
  }, [])

  useEffect(() => {
    const request = ++requestRef.current
    reload(request)
      .catch(() => {
        if (requestRef.current === request) {
          setError('No se pudo leer la API. Revisa que el servidor esté en el puerto 3000.')
        }
      })
      .finally(() => {
        if (requestRef.current === request) setLoading(false)
      })
    return () => {
      requestRef.current += 1
    }
  }, [reload])

  function setAccount(next: string) {
    if (next === accountRef.current) return
    accountRef.current = next
    setAccountState(next)
    setListError(null)
    setListLoading(true)
    const request = ++requestRef.current
    reload(request).catch(() => {
      if (requestRef.current !== request) return
      setEntries([])
      setListError('No se pudieron leer los movimientos de esa cuenta.')
    })
  }

  async function refreshAfterWrite() {
    try {
      await reload()
    } catch {
      setError(savedMessage)
    }
  }

  async function updateTransaction(id: string, transaction: UpdateTransaction) {
    await updateTransactionRequest(id, transaction)
    await refreshAfterWrite()
  }

  async function deleteTransaction(id: string) {
    await deleteTransactionRequest(id)
    await refreshAfterWrite()
  }

  async function createPayment(payment: NewCardPayment) {
    await createCardPayment(payment)
    if (accountRef.current && accountRef.current !== payment.sourceAccount) {
      accountRef.current = payment.sourceAccount
      setAccountState(payment.sourceAccount)
    }
    await refreshAfterWrite()
  }

  async function updatePayment(id: string, payment: UpdateCardPayment) {
    await updateCardPayment(id, payment)
    if (payment.sourceAccount && accountRef.current && accountRef.current !== payment.sourceAccount) {
      accountRef.current = payment.sourceAccount
      setAccountState(payment.sourceAccount)
    }
    await refreshAfterWrite()
  }

  async function deletePayment(id: string) {
    await deleteCardPayment(id)
    await refreshAfterWrite()
  }

  return {
    transactions,
    resume,
    previousResume,
    entries,
    account,
    error,
    listError,
    loading,
    listLoading,
    setAccount,
    updateTransaction,
    deleteTransaction,
    createPayment,
    updatePayment,
    deletePayment,
  }
}

export type FinanceState = ReturnType<typeof useFinance>
