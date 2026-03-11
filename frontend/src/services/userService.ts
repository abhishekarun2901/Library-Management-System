import { apiFetch } from '../lib/apiClient'

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserResponse = {
  userId: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  blacklistReason: string | null
  createdAt: string
}

export type UserPage = {
  content: UserResponse[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type TransactionResponse = {
  transactionId: string
  user_id: string
  copy_id: string
  bookTitle: string | null
  memberName: string | null
  checkout_date: string | null
  due_date: string | null
  return_date: string | null
  status: string // issued | returned | overdue | lost
  estimatedFine: number | null
}

export type FineResponse = {
  fineId: string
  transactionId: string
  bookTitle: string | null
  memberName: string | null
  amount: number
  reason: string | null
  issuedAt: string
  paid: boolean
}

export type UpdateUserPayload = {
  fullName?: string
  email?: string
  password?: string
  isActive?: boolean
  blacklistReason?: string | null
}

export type CreateUserPayload = {
  email: string
  password: string
  fullName?: string
  role: string
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const getUsers = (params: {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  search?: string
}) => {
  const q = new URLSearchParams()
  q.set('page', String(params.page ?? 0))
  q.set('size', String(params.size ?? 50))
  if (params.sortBy) q.set('sortBy', params.sortBy)
  if (params.sortDir) q.set('sortDir', params.sortDir)
  if (params.search) q.set('search', params.search)
  return apiFetch<UserPage>(`/v1/users?${q}`)
}

export const getCurrentUser = () => apiFetch<UserResponse>('/v1/users?scope=me')

export const getUserHistory = (userId?: string) => {
  const q = userId ? `&userId=${userId}` : ''
  return apiFetch<TransactionResponse[]>(`/v1/users?scope=history${q}`)
}

export const getUserFines = (userId?: string) => {
  const q = userId ? `&userId=${userId}` : ''
  return apiFetch<FineResponse[]>(`/v1/users?scope=fines${q}`)
}

export const updateUser = (id: string, payload: UpdateUserPayload) =>
  apiFetch<UserResponse>(`/v1/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const deleteUser = (id: string) =>
  apiFetch<void>(`/v1/users/${id}`, { method: 'DELETE' })

export const registerUser = (payload: CreateUserPayload) =>
  apiFetch<UserResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
