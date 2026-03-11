import { apiFetch } from '../lib/apiClient'
import type { FineResponse } from './userService'

export type { FineResponse }

/** Admin: returns ALL fines. */
export const getAllFines = () => apiFetch<FineResponse[]>('/v1/fines')

/**
 * Pay a fine.
 * NOTE: The backend's PATCH /v1/fines/{id} endpoint internally resolves
 * the fine by transactionId — pass the transactionId from FineResponse.
 */
export const payFine = (transactionId: string) =>
  apiFetch<void>(`/v1/fines/${transactionId}`, { method: 'PATCH' })
