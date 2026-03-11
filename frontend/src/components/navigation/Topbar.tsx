import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Calendar,
  LogOut,
  Mail,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react'
import styles from '../../styles/responsive.module.css'
import { useAuthStore } from '../../store/authStore'
import { logoutUser } from '../../services/authService'
import {
  getNotifications,
  markNotificationRead,
  type NotificationResponse,
} from '../../services/notificationService'
import { getCurrentUser, type UserResponse } from '../../services/userService'

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
  const { logout, isAuthenticated } = useAuthStore()

  const handleLogout = async () => {
    await logoutUser()
    logout()
    navigate('/login', { replace: true })
  }

  // ── Profile popup ──────────────────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [me, setMe] = useState<UserResponse | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    getCurrentUser().then(setMe).catch(console.error)
  }, [isAuthenticated])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const email = me?.email ?? 'N/A'

  const joinedAt = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  const roleLabel =
    me?.role === 'admin'
      ? 'Librarian / Admin'
      : me?.role === 'member'
        ? 'Member'
        : (me?.role ?? '—')

  // ── Notification bell ──────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [bellOpen, setBellOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const fetchNotifsRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!isAuthenticated) return
    const fetchNotifs = () => {
      setNotifLoading(true)
      getNotifications()
        .then((all) =>
          setNotifications(
            [...all]
              .filter((n) => !n.isRead)
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          )
        )
        .catch(console.error)
        .finally(() => setNotifLoading(false))
    }
    fetchNotifsRef.current = fetchNotifs
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [isAuthenticated])

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
    try {
      await markNotificationRead(n.notificationId)
      setNotifications((prev) =>
        prev.filter((x) => x.notificationId !== n.notificationId)
      )
    } catch {
      /* silently ignore */
    }
  }

  const unreadCount = notifications.length

  const notifStyle = (type: string | null) => {
    switch (type) {
      case 'OVERDUE':
        return {
          dot: 'bg-red-500',
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: 'Overdue',
        }
      case 'FINE_PAID':
        return {
          dot: 'bg-emerald-500',
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          label: 'Fine Paid',
        }
      case 'BOOK_ISSUED':
        return {
          dot: 'bg-indigo-500',
          bg: 'bg-indigo-100',
          text: 'text-indigo-700',
          label: 'Book Issued',
        }
      case 'BOOK_RETURNED':
        return {
          dot: 'bg-emerald-500',
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          label: 'Book Returned',
        }
      case 'BOOK_LOST':
        return {
          dot: 'bg-red-500',
          bg: 'bg-red-100',
          text: 'text-red-700',
          label: 'Book Lost',
        }
      case 'RESERVATION_CONFIRMED':
        return {
          dot: 'bg-blue-500',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          label: 'Reserved',
        }
      case 'RESERVATION_READY':
        return {
          dot: 'bg-emerald-500',
          bg: 'bg-emerald-100',
          text: 'text-emerald-700',
          label: 'Ready to Collect',
        }
      default:
        return {
          dot: 'bg-gray-400',
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          label: type?.replace(/_/g, ' ') ?? 'Info',
        }
    }
  }

  return (
    <>
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
          {/* Notification Bell */}
          <div ref={bellRef} className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                const opening = !bellOpen
                setBellOpen((prev) => !prev)
                if (opening) fetchNotifsRef.current()
              }}
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
                      {notifications.map((n) => {
                        const style = notifStyle(n.type)
                        return (
                          <li
                            key={n.notificationId}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                          >
                            <div
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="mb-1 flex items-center gap-2 flex-wrap">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style.bg} ${style.text}`}
                                >
                                  {style.label}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(n.createdAt).toLocaleDateString(
                                    'en-US',
                                    { month: 'short', day: 'numeric' }
                                  )}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">
                                {n.message}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMarkRead(n)}
                              className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700"
                            >
                              ✓
                            </button>
                          </li>
                        )
                      })}
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

          {/* Profile popup */}
          <div ref={profileRef} className="relative">
            <button
              type="button"
              aria-label="Profile"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white ring-2 ring-white/30 transition hover:bg-white/30"
            >
              {initials}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {/* Gradient header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-sm font-bold text-white ring-2 ring-white/30">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-indigo-200">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Info rows */}
                <div className="divide-y divide-gray-100 px-4 py-1">
                  <div className="flex items-center gap-3 py-2.5">
                    <Mail className="h-4 w-4 shrink-0 text-indigo-500" />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Email
                      </p>
                      <p className="truncate text-sm font-medium text-gray-900">
                        {email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2.5">
                    <Shield className="h-4 w-4 shrink-0 text-indigo-500" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Role
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {roleLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2.5">
                    <Calendar className="h-4 w-4 shrink-0 text-indigo-500" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Member Since
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {joinedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-2.5">
                    <User className="h-4 w-4 shrink-0 text-indigo-500" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-gray-400">
                        Status
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {me?.isActive ? (
                          <span className="text-emerald-600">Active</span>
                        ) : (
                          <span className="text-red-500">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Footer actions */}
                <div className="border-t border-gray-100 px-4 py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      handleLogout()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
