import { apiFetch } from '../lib/apiClient'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BookResponse = {
  bookId: string
  title: string
  description: string | null
  publishDate: string | null
  createdAt: string
  categories: string[] | null
  publisher: string | null
  authors: string[] | null
  isActive: boolean
  trueAvailableStock: number
  // isbn is not returned by the backend — omitted
}

export type BookPage = {
  content: BookResponse[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type CopyResponse = {
  copyId: string
  bookId: string
  status: string // AVAILABLE | ISSUED | LOST
}

export type CreateBookPayload = {
  title: string
  authorNames?: string[] // backend field name
  isbn?: string
  description?: string
  publishDate?: string
  categories?: string[]
  numberOfCopies?: number
  publisherName?: string // backend field name
  // convenience aliases used in forms (mapped before sending)
  author?: string
  publisher?: string
  category?: string
}

export type UpdateBookPayload = {
  title?: string
  isbn?: string
  description?: string
  publishDate?: string
  categories?: string[]
  publisherName?: string
  authorNames?: string[]
  isActive?: boolean
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const getBooks = (
  params: {
    title?: string
    author?: string
    isbn?: string
    category?: string
    page?: number
    size?: number
    sortBy?: string
  },
  token?: string
) => {
  const q = new URLSearchParams()
  if (params.title) q.set('title', params.title)
  if (params.author) q.set('author', params.author)
  if (params.isbn) q.set('isbn', params.isbn)
  if (params.category) q.set('category', params.category)
  q.set('page', String(params.page ?? 0))
  q.set('size', String(params.size ?? 12))
  if (params.sortBy) q.set('sortBy', params.sortBy)
  return apiFetch<BookPage>(`/v1/books?${q}`, {}, token)
}

export const createBook = (payload: CreateBookPayload, token: string) =>
  apiFetch<BookResponse>(
    '/v1/books',
    { method: 'POST', body: JSON.stringify(payload) },
    token
  )

export const updateBook = (
  id: string,
  payload: UpdateBookPayload,
  token: string
) =>
  apiFetch<BookResponse>(
    `/v1/books/${id}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
    token
  )

export const deleteBook = (id: string, token: string) =>
  apiFetch<void>(`/v1/books/${id}`, { method: 'DELETE' }, token)

export const getCopies = (bookId: string, token: string) =>
  apiFetch<CopyResponse[]>(`/v1/copies?book_id=${bookId}`, {}, token)

export const createCopy = (bookId: string, token: string) =>
  apiFetch<CopyResponse>(
    `/v1/copies?book_id=${bookId}`,
    { method: 'POST', body: JSON.stringify({ status: 'AVAILABLE' }) },
    token
  )

export const updateCopyStatus = (
  copyId: string,
  status: 'AVAILABLE' | 'LOST',
  token: string
) =>
  apiFetch<CopyResponse>(
    `/v1/copies/${copyId}`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
    token
  )
