import { apiFetch } from '../lib/apiClient'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReservationResponse = {
  reservationId: string
  userId: string
  memberName: string | null
  bookId: string
  bookTitle: string
  reservedAt: string
  expiresAt: string | null
  /** ISO date string (YYYY-MM-DD), present only for scheduled reservations. */
  pickupDate: string | null
  status: string // active | expired | fulfilled | cancelled
  /** 1-based position in the active reservation queue for this book. */
  queuePosition: number | null
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const getReservations = (token: string, userId?: string) => {
  const q = userId ? `?userId=${userId}` : ''
  return apiFetch<ReservationResponse[]>(`/v1/reservations${q}`, {}, token)
}

/**
 * Create a reservation for a book with at least one AVAILABLE copy.
 * The hold expires at midnight of the following day.
 */
export const createReservation = (
  userId: string,
  bookId: string,
  token: string
) =>
  apiFetch<ReservationResponse>(
    '/v1/reservations',
    {
      method: 'POST',
      body: JSON.stringify({
        userId,
        bookId,
      }),
    },
    token
  )

export const updateReservationStatus = (
  reservationId: string,
  status: string,
  token: string
) =>
  apiFetch<ReservationResponse>(
    `/v1/reservations/${reservationId}?status=${status}`,
    { method: 'PATCH' },
    token
  )

export const cancelReservation = (reservationId: string, token: string) =>
  apiFetch<void>(
    `/v1/reservations/${reservationId}`,
    { method: 'DELETE' },
    token
  )
