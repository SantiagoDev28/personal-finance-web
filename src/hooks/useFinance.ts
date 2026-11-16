import { useEffect, useState } from 'react'
import { getResume, listTransactions, type Resume, type Transaction } from '../api.ts'

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

  return { transactions, resume, error, loading }
}

export type FinanceState = ReturnType<typeof useFinance>
