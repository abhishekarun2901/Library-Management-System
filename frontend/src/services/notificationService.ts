import { apiFetch } from '../lib/apiClient'

export type NotificationResponse = {
  notificationId: string
  message: string
  type: string | null
  isRead: boolean
  createdAt: string
}

export const getNotifications = (token: string) =>
  apiFetch<NotificationResponse[]>('/v1/notifications', {}, token)

export const markNotificationRead = (notificationId: string, token: string) =>
  apiFetch<void>(
    `/v1/notifications/${notificationId}/mark-read`,
    { method: 'POST' },
    token
  )
