import { apiFetch } from '../lib/apiClient'
import type { TransactionResponse } from './userService'

export type { TransactionResponse }

export type IssueBookPayload = {
  userId: string
  copyId: string
}

export const getTransactions = (token: string) =>
  apiFetch<TransactionResponse[]>('/v1/transactions', {}, token)

export const issueBook = (payload: IssueBookPayload, token: string) =>
  apiFetch<TransactionResponse>(
    '/v1/transactions',
    {
      method: 'POST',
      body: JSON.stringify({ userId: payload.userId, copyId: payload.copyId }),
    },
    token
  )

export const returnBook = (transactionId: string, token: string) =>
  apiFetch<TransactionResponse>(
    `/v1/transactions/${transactionId}`,
    { method: 'PATCH', body: JSON.stringify({ status: 'returned' }) },
    token
  )
