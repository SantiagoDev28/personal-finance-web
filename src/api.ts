export type TransactionType = 'income' | 'expense'

export type Transaction = {
  id: string
  amount: number
  description: string
  category: string
  account: string
  type: TransactionType
  date: string
}

export type Resume = {
  income: number
  expense: number
  balance: number
}

export type UpdateTransaction = {
  amount?: number
  description?: string
  category?: string
  account?: string
  type?: TransactionType
  date?: string
}

export async function listTransactions(): Promise<Transaction[]> {
  return readJson<Transaction[]>('/transactions')
}

export async function getResume(): Promise<Resume> {
  return readJson<Resume>('/transactions/resume')
}

export async function updateTransaction(id: string, transaction: UpdateTransaction): Promise<Transaction> {
  return sendJson<Transaction>(transactionPath(id), 'PATCH', transaction, 'No se pudo guardar el movimiento.')
}

export async function deleteTransaction(id: string): Promise<{ message: string }> {
  return sendJson<{ message: string }>(transactionPath(id), 'DELETE', undefined, 'No se pudo eliminar el movimiento.')
}

function transactionPath(id: string) {
  return `/transactions/${encodeURIComponent(id)}`
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error('La API no respondió')
  }
  return response.json() as Promise<T>
}

async function sendJson<T>(path: string, method: 'PATCH' | 'DELETE', body: unknown, fallback: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error(fallback)
  }

  if (!response.ok) {
    throw new Error(await readError(response, fallback))
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new Error(fallback)
  }
}

async function readError(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { message?: string | string[] }
    const message = Array.isArray(payload.message) ? payload.message.join(' ') : payload.message
    if (message) return translateApiMessage(message, fallback)
  } catch {
    return fallback
  }
  return fallback
}

function translateApiMessage(message: string, fallback: string) {
  const known: Record<string, string> = {
    'category is not valid for this type': 'La categoría no corresponde a este tipo.',
    'Category is not valid for this type': 'La categoría no corresponde a este tipo.',
    'Account is not valid': 'La cuenta no es válida.',
    'date must be yyyy-MM-dd': 'La fecha tiene que usar el formato aaaa-mm-dd.',
    'Amount must be greater than 0': 'El importe tiene que ser mayor que cero.',
    'Amount must be an integer': 'El importe tiene que ser un número entero.',
    'Date must be a valid date': 'La fecha no es válida.',
    'Type must be a valid type': 'El tipo no es válido.',
  }
  if (known[message]) return known[message]
  if (/not found/i.test(message)) return 'Ese movimiento ya no está en la lista.'
  if (/integer/i.test(message)) return 'El importe tiene que ser un número entero.'
  if (/positive|greater than 0/i.test(message)) return 'El importe tiene que ser mayor que cero.'
  if (/category/i.test(message)) return 'La categoría no corresponde a este tipo.'
  if (/one of the following values/i.test(message)) return 'Elige una cuenta y un tipo de la lista.'
  if (/date/i.test(message)) return 'La fecha tiene que usar el formato aaaa-mm-dd.'
  return fallback
}
