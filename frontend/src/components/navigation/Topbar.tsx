import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Calendar,
  LogOut,
  Mail,
  Menu,
  Pencil,
  Shield,
  User,
  X,
} from 'lucide-react'
import styles from '../../styles/responsive.module.css'
import { useAuthStore } from '../../store/authStore'
import {
  getNotifications,
  markNotificationRead,
  type NotificationResponse,
} from '../../services/notificationService'
import {
  getCurrentUser,
  updateUser,
  type UserResponse,
} from '../../services/userService'

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
  const { logout, token, setAuth, role, memberSince } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // ── Profile popup ──────────────────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [me, setMe] = useState<UserResponse | null>(null)

  // ── Edit profile modal ─────────────────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const openEdit = () => {
    setEditName(me?.fullName ?? userName)
    setEditEmail(me?.email ?? email)
    setEditError(null)
    setProfileOpen(false)
    setEditOpen(true)
  }

  const handleSave = async () => {
    if (!token || !me) return
    setSaving(true)
    setEditError(null)
    try {
      const updated = await updateUser(
        me.userId,
        {
          fullName: editName.trim() || undefined,
          email: editEmail.trim() || undefined,
        },
        token
      )
      setMe(updated)
      // Keep auth store in sync so topbar initials/name update immediately
      setAuth({
        token,
        role,
        fullName: updated.fullName,
        memberSince: memberSince ?? null,
      })
      setEditOpen(false)
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!token) return
    getCurrentUser(token).then(setMe).catch(console.error)
  }, [token])

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

  let email = 'N/A'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      email = payload.sub ?? 'N/A'
    }
  } catch {
    /* ignore */
  }

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
                <div className="border-t border-gray-100 px-4 py-2 space-y-1">
                  <button
                    type="button"
                    onClick={openEdit}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-indigo-700 transition hover:bg-indigo-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                  </button>
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
        </div>
      </header>

      {/* ── Edit Profile Modal (rendered outside header so it overlays correctly) ── */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditOpen(false)
          }}
        >
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
              <h2 className="font-semibold text-white">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Body */}
            <div className="space-y-4 px-5 py-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              {editError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {editError}
                </p>
              )}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
