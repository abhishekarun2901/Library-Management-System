import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { StatCard } from '../components/composite'
import { memberSidebarItems as sidebarItems } from '../config/sidebarConfig'
import { Calendar, Check, Mail, Pencil, User, X } from 'lucide-react'
import styles from '../styles/responsive.module.css'
import {
  getUserHistory,
  getUserFines,
  getCurrentUser,
  updateUser,
} from '../services/userService'
import {
  getNotifications,
  markNotificationRead,
  type NotificationResponse,
} from '../services/notificationService'
import {
  getTransactions,
  type TransactionResponse,
} from '../services/transactionService'

// ── Sub-components ─────────────────────────────────────────────────────────────

type FieldRowProps = { icon: ReactNode; label: string; value: string }

const FieldRow = ({ icon, label, value }: FieldRowProps) => (
  <div className="flex items-start gap-3 py-3.5">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  </div>
)

type EditFieldProps = {
  icon: ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}

const EditField = ({
  icon,
  label,
  value,
  onChange,
  type = 'text',
}: EditFieldProps) => (
  <div className="flex items-start gap-3 py-3">
    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-9 text-sm"
      />
    </div>
  </div>
)

// ── Page ───────────────────────────────────────────────────────────────────────

export const MemberDashboard = () => {
  const { fullName, token, memberSince } = useAuthStore()
  const storedName = fullName ?? 'User'
  let storedEmail = 'member@booking.com'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      storedEmail = payload.sub ?? storedEmail
    }
  } catch {
    /* ignore */
  }

  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: storedName,
    email: storedEmail,
  })
  const [draft, setDraft] = useState(profile)
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Stats state
  const [totalBorrowed, setTotalBorrowed] = useState<number | null>(null)
  const [activeLoans, setActiveLoans] = useState<number | null>(null)
  const [outstandingFines, setOutstandingFines] = useState<number | null>(null)
  const [notifications, setNotifications] = useState<NotificationResponse[]>([])
  const [overdueLoans, setOverdueLoans] = useState<TransactionResponse[]>([])

  useEffect(() => {
    if (!token) return
    Promise.all([
      getUserHistory(token),
      getUserFines(token),
      getNotifications(token),
      getTransactions(token),
      getCurrentUser(token),
    ])
      .then(([history, fines, notifs, txs, me]) => {
        setUserId(me.userId)
        setTotalBorrowed(history.length)
        const active = txs.filter(
          (t) => t.status === 'issued' || t.status === 'overdue'
        )
        setActiveLoans(active.length)
        const overdue = txs.filter((t) => t.status === 'overdue')
        setOverdueLoans(overdue)
        const unpaid = fines
          .filter((f) => !f.paid)
          .reduce((s, f) => s + (f.amount ?? 0), 0)
        setOutstandingFines(unpaid)
        setNotifications(notifs.filter((n) => !n.isRead))
      })
      .catch(console.error)
  }, [token])

  const handleEdit = () => {
    setDraft(profile)
    setIsEditing(true)
  }
  const handleSave = async () => {
    if (!token || !userId) {
      setProfile(draft)
      setIsEditing(false)
      return
    }
    setSaving(true)
    try {
      await updateUser(userId, { fullName: draft.name }, token)
      setProfile(draft)
      setIsEditing(false)
    } catch (e: unknown) {
      console.error('Profile save failed:', e)
      setProfile(draft)
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }
  const handleCancel = () => {
    setDraft(profile)
    setIsEditing(false)
  }

  const handleMarkRead = async (id: string) => {
    if (!token) return
    try {
      await markNotificationRead(id, token)
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id))
    } catch {
      // silently ignore
    }
  }

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Dashboard">
      <div className={`w-full space-y-6 p-6 pb-12 ${styles.pageContent}`}>
        {/* 1 ── Welcome */}
        <PageHeader
          title={`Welcome back, ${profile.name.split(' ')[0]}`}
          description="Here's an overview of your library account"
        />

        {/* 2 ── Profile Card (full width) */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Gradient hero */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-7">
            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="absolute right-5 top-5 z-10 flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/25"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </button>
            )}
            <div className="relative flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-2 ring-white/30">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <p className="mt-0.5 text-sm text-indigo-200">
                  {profile.email}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-400/30 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Active Member
                </span>
              </div>
            </div>
          </div>

          {/* Info / Edit fields — 3-col on md+ for good use of full width */}
          <div className="grid grid-cols-1 divide-y divide-gray-100 px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
            {isEditing ? (
              <>
                <div className="md:pr-6">
                  <EditField
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={draft.name}
                    onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                  />
                </div>
                <div className="md:px-6">
                  <EditField
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={draft.email}
                    onChange={(v) => setDraft((d) => ({ ...d, email: v }))}
                    type="email"
                  />
                </div>
                <div className="md:pl-6">
                  <FieldRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Member Since"
                    value={memberSince ?? '—'}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="md:pr-6">
                  <FieldRow
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={profile.name}
                  />
                </div>
                <div className="md:px-6">
                  <FieldRow
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={profile.email}
                  />
                </div>
                <div className="md:pl-6">
                  <FieldRow
                    icon={<Calendar className="h-4 w-4" />}
                    label="Member Since"
                    value={memberSince ?? '—'}
                  />
                </div>
              </>
            )}
          </div>

          {/* Save / Cancel footer */}
          {isEditing && (
            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />{' '}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* 3 ── Stats */}
        <div
          className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${styles.statsGrid}`}
        >
          <StatCard
            label="Books Borrowed"
            value={totalBorrowed !== null ? String(totalBorrowed) : '—'}
          />
          <StatCard
            label="Active Loans"
            value={activeLoans !== null ? String(activeLoans) : '—'}
          />
          <StatCard
            label="Outstanding Fines"
            value={
              outstandingFines !== null
                ? `$${outstandingFines.toFixed(2)}`
                : '—'
            }
          />
        </div>

        {/* 4 ── Notifications & Alerts */}
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-700">
            Notifications &amp; Alerts
          </p>
          {overdueLoans.length === 0 && notifications.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
              ✓ No outstanding alerts — your account is in good standing.
            </div>
          ) : (
            <div className="space-y-3">
              {overdueLoans.map((loan) => (
                <div
                  key={loan.transactionId}
                  className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-4">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <p className="text-sm font-semibold text-red-800">
                      Overdue Book
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {loan.bookTitle ?? 'Unknown'}
                    </p>
                    {loan.due_date && (
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-xs">
                        <span className="text-red-600">
                          Due{' '}
                          {new Date(loan.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {loan.estimatedFine != null &&
                          loan.estimatedFine > 0 && (
                            <span className="font-semibold text-red-700">
                              ${Number(loan.estimatedFine).toFixed(2)} fine
                            </span>
                          )}
                      </div>
                    )}
                    <Link to="/member/activity">
                      <Button
                        variant="secondary"
                        className="mt-3 w-full text-xs"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {notifications.map((n) => (
                <div
                  key={n.notificationId}
                  className="overflow-hidden rounded-2xl border border-indigo-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleMarkRead(n.notificationId)}
                  role="button"
                  title="Click to mark as read"
                >
                  <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50 px-5 py-4">
                    <p className="text-sm font-semibold text-indigo-800 capitalize">
                      {n.type}
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-900">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
