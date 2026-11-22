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

export type DateRange = {
  startDate?: string
  endDate?: string
}

export type Resume = {
  income: number
  cashExpense: number
  cardExpense: number
  cardPayments: number
  balance: number
  cardOutstanding: number
}

export type UpdateTransaction = {
  amount?: number
  description?: string
  category?: string
  account?: string
  type?: TransactionType
  date?: string
}

export type CardPayment = {
  id: string
  amount: number
  sourceAccount: string
  cardAccount: string
  description: string
  date: string
}

export type NewCardPayment = {
  amount: number
  sourceAccount: string
  date: string
  description?: string
}

export type UpdateCardPayment = {
  amount?: number
  sourceAccount?: string
  description?: string
  date?: string
}

export type AccountMovement = {
  kind: 'income' | 'expense' | 'card_payment'
  id: string
  amount: number
  account: string
  date: string
  description: string
  category?: string
}

export async function listTransactions(): Promise<Transaction[]> {
  return readJson<Transaction[]>('/transactions')
}

export async function getResume(range: DateRange = {}): Promise<Resume> {
  return readJson<Resume>(withQuery('/transactions/resume', range))
}

export async function updateTransaction(id: string, transaction: UpdateTransaction): Promise<Transaction> {
  return sendJson<Transaction>(transactionPath(id), 'PATCH', transaction, 'No se pudo guardar el movimiento.')
}

export async function deleteTransaction(id: string): Promise<{ message: string }> {
  return sendJson<{ message: string }>(transactionPath(id), 'DELETE', undefined, 'No se pudo eliminar el movimiento.')
}

export async function listCardPayments(range: DateRange = {}): Promise<CardPayment[]> {
  return readJson<CardPayment[]>(withQuery('/card-payments', range))
}

export async function createCardPayment(payment: NewCardPayment): Promise<CardPayment> {
  return sendJson<CardPayment>('/card-payments', 'POST', payment, 'No se pudo registrar el abono.')
}

export async function updateCardPayment(id: string, payment: UpdateCardPayment): Promise<CardPayment> {
  return sendJson<CardPayment>(cardPaymentPath(id), 'PATCH', payment, 'No se pudo guardar el abono.')
}

export async function deleteCardPayment(id: string): Promise<{ message: string }> {
  return sendJson<{ message: string }>(cardPaymentPath(id), 'DELETE', undefined, 'No se pudo eliminar el abono.')
}

export async function listAccountMovements(query: { account: string } & DateRange): Promise<AccountMovement[]> {
  return readJson<AccountMovement[]>(withQuery('/accounts/movements', query))
}

function transactionPath(id: string) {
  return `/transactions/${encodeURIComponent(id)}`
}

function cardPaymentPath(id: string) {
  return `/card-payments/${encodeURIComponent(id)}`
}

function withQuery(path: string, query: Record<string, string | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value)
  }
  const text = params.toString()
  return text ? `${path}?${text}` : path
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error('La API no respondió')
  }
  return response.json() as Promise<T>
}

async function sendJson<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body: unknown,
  fallback: string,
): Promise<T> {
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
    'Source account must be a cash account': 'La cuenta de origen tiene que ser efectivo, Nequi, Nu o Daviplata.',
    'Card account is not valid': 'La cuenta de la tarjeta no es válida.',
    'Card payment exceeds the outstanding balance': 'El abono supera el pendiente de la tarjeta.',
    'Card outstanding would be below zero': 'El pendiente de la tarjeta quedaría por debajo de cero.',
    'Id and description are required': 'La descripción no puede quedar vacía.',
  }
  if (known[message]) return known[message]
  if (/card payment/i.test(message) && /not found/i.test(message)) return 'Ese abono ya no está en la lista.'
  if (/not found/i.test(message)) return 'Ese movimiento ya no está en la lista.'
  if (/integer/i.test(message)) return 'El importe tiene que ser un número entero.'
  if (/positive|greater than 0/i.test(message)) return 'El importe tiene que ser mayor que cero.'
  if (/category/i.test(message)) return 'La categoría no corresponde a este tipo.'
  if (/source account|sourceAccount/i.test(message)) {
    return 'La cuenta de origen tiene que ser efectivo, Nequi, Nu o Daviplata.'
  }
  if (/one of the following values/i.test(message)) return 'Elige una cuenta y un tipo de la lista.'
  if (/date/i.test(message)) return 'La fecha tiene que usar el formato aaaa-mm-dd.'
  return fallback
}
