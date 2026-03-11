import { apiFetch } from '../lib/apiClient'

export type NotificationResponse = {
  notificationId: string
  message: string
  type: string | null
  isRead: boolean
  createdAt: string
}

export const getNotifications = () =>
  apiFetch<NotificationResponse[]>('/v1/notifications')

export const markNotificationRead = (notificationId: string) =>
  apiFetch<void>(`/v1/notifications/${notificationId}/mark-read`, {
    method: 'POST',
  })
