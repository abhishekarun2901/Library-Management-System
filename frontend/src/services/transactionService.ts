import { apiFetch } from '../lib/apiClient'
import type { TransactionResponse } from './userService'

export type { TransactionResponse }

export type IssueBookPayload = {
  userId: string
  copyId: string
}

export const getTransactions = () =>
  apiFetch<TransactionResponse[]>('/v1/transactions')

export const issueBook = (payload: IssueBookPayload) =>
  apiFetch<TransactionResponse>('/v1/transactions', {
    method: 'POST',
    body: JSON.stringify({ userId: payload.userId, copyId: payload.copyId }),
  })

export const returnBook = (transactionId: string) =>
  apiFetch<TransactionResponse>(`/v1/transactions/${transactionId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'returned' }),
  })
