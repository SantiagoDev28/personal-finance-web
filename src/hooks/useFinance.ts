import { useEffect, useState } from 'react'
import {
  deleteTransaction as deleteTransactionRequest,
  getResume,
  listTransactions,
  updateTransaction as updateTransactionRequest,
  type Resume,
  type Transaction,
  type UpdateTransaction,
} from '../api.ts'

export function useFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [resume, setResume] = useState<Resume | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([listTransactions(), getResume()])
      .then(([list, totals]) => {
        if (!active) return
        setTransactions(list)
        setResume(totals)
      })
      .catch(() => {
        if (active) setError('No se pudo leer la API. Revisa que el servidor esté en el puerto 3000.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function updateTransaction(id: string, transaction: UpdateTransaction) {
    const saved = await updateTransactionRequest(id, transaction)
    setTransactions((current) =>
      current.map((item) => (item.id === id ? { ...item, ...transaction, ...saved, id: item.id } : item)),
    )
    await refreshResume(setResume)
  }

  async function deleteTransaction(id: string) {
    await deleteTransactionRequest(id)
    setTransactions((current) => current.filter((item) => item.id !== id))
    await refreshResume(setResume)
  }

  return { transactions, resume, error, loading, updateTransaction, deleteTransaction }
}

async function refreshResume(setResume: (resume: Resume | null) => void) {
  try {
    setResume(await getResume())
  } catch {
    setResume(null)
  }
}

export type FinanceState = ReturnType<typeof useFinance>
