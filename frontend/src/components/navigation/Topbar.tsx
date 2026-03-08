import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, Menu, X } from 'lucide-react'
import { Avatar } from '../ui'
import styles from '../../styles/responsive.module.css'
import { useAuthStore } from '../../store/authStore'
import {
  getNotifications,
  markNotificationRead,
  type NotificationResponse,
} from '../../services/notificationService'

export type TopbarProps = {
  title?: ReactNode
  userName?: string
  onMenuToggle?: () => void
}

export const Topbar = ({
  title = 'Librarian Dashboard',
  userName = 'User',
  onMenuToggle,
}: TopbarProps) => {
  const navigate = useNavigate()
  const { logout, token } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // ── Notification bell ──────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return
    const fetchNotifs = () => {
      getNotifications(token)
        .then((all) => setNotifications(all.filter((n) => !n.isRead)))
        .catch(console.error)
    }
    fetchNotifs()
    const id = setInterval(fetchNotifs, 60_000)
    return () => clearInterval(id)
  }, [token])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleMarkRead = async (n: NotificationResponse) => {
    if (!token) return
    try {
      await markNotificationRead(n.notificationId, token)
      setNotifications((prev) =>
        prev.filter((x) => x.notificationId !== n.notificationId)
      )
    } catch {
      /* silently ignore */
    }
  }

  const unreadCount = notifications.length

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle sidebar"
          className={styles.menuBtn}
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-indigo-200">{userName}</span>
        <Avatar />

        {/* Notification Bell */}
        <div ref={bellRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setBellOpen((prev) => !prev)}
            className="relative flex items-center justify-center rounded-lg p-1.5 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-indigo-600">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 origin-top-right rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">
                  Notifications
                </p>
                <button
                  type="button"
                  onClick={() => setBellOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close notifications"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-500">
                    No unread notifications
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {notifications.map((n) => (
                      <li
                        key={n.notificationId}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                      >
                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 flex items-center gap-2">
                            {n.type && (
                              <span className="inline-flex rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                {n.type.replace(/_/g, ' ')}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              {new Date(n.createdAt).toLocaleDateString(
                                'en-US',
                                { month: 'short', day: 'numeric' }
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{n.message}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n)}
                          className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700"
                        >
                          Mark read
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    type="button"
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                    onClick={() => {
                      notifications.forEach((n) => handleMarkRead(n))
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  )
}
