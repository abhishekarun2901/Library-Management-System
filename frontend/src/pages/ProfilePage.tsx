import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AppLayout, PageHeader } from '../components/layout'
import { StatCard, SearchCard } from '../components/composite'
import { memberSidebarItems } from '../config/sidebarConfig'
import { Bell, Calendar, Lock, Mail, Shield, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getUserHistory, getUserFines } from '../services/userService'
import { getTransactions } from '../services/transactionService'
import { getReservations } from '../services/reservationService'

// ── Helper sub-components ──────────────────────────────────────────────────────

type InfoRowProps = { icon: ReactNode; label: string; value: string }

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="truncate text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
)

type SettingRowProps = { icon: ReactNode; label: string; description: string }

const SettingRow = ({ icon, label, description }: SettingRowProps) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
)

// ── Page ───────────────────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const { fullName, token, memberSince } = useAuthStore()
  const name = fullName ?? 'User'
  // Derive email from JWT payload (sub claim)
  let email = 'N/A'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      email = payload.sub ?? 'N/A'
    }
  } catch {
    /* ignore */
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const [totalBorrowed, setTotalBorrowed] = useState<string>('—')
  const [activeLoans, setActiveLoans] = useState<string>('—')
  const [reservationCount, setReservationCount] = useState<string>('—')

  useEffect(() => {
    if (!token) return
    Promise.all([
      getUserHistory(token),
      getUserFines(token),
      getTransactions(token),
      getReservations(token),
    ])
      .then(([history, _fines, txs, reservations]) => {
        setTotalBorrowed(String(history.length))
        const active = txs.filter(
          (t) => t.status === 'issued' || t.status === 'overdue'
        )
        setActiveLoans(String(active.length))
        const activeRes = reservations.filter((r) => r.status === 'active')
        setReservationCount(String(activeRes.length))
      })
      .catch(console.error)
  }, [token])

  return (
    <AppLayout sidebarItems={memberSidebarItems} topbarTitle="My Profile">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="My Profile"
          description="Manage your personal information and account settings"
        />

        {/* Profile hero card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          {/* Decorative blobs */}
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-purple-400/20" />

          <div className="relative flex items-center gap-5">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-2 ring-white/30">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-indigo-200 text-sm">{email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/30 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Active Member
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Books Borrowed" value={totalBorrowed} />
          <StatCard label="Active Loans" value={activeLoans} />
          <StatCard label="Reservations" value={reservationCount} />
          <StatCard label="Member Since" value={memberSince ?? '—'} />
        </div>

        {/* Info sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Personal Information */}
          <SearchCard
            title="Personal Information"
            description="Your account details on file"
          >
            <div className="divide-y divide-gray-100">
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={name}
              />
              <InfoRow
                icon={<Mail className="h-4 w-4" />}
                label="Email Address"
                value={email}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Member Since"
                value={memberSince ?? '—'}
              />
            </div>
          </SearchCard>

          {/* Account Settings */}
          <SearchCard
            title="Account Settings"
            description="Notification and privacy preferences"
          >
            <div className="divide-y divide-gray-100">
              <SettingRow
                icon={<Bell className="h-4 w-4" />}
                label="Email Notifications"
                description="Receive reminders for due dates and updates"
              />
              <SettingRow
                icon={<Bell className="h-4 w-4" />}
                label="Overdue Alerts"
                description="Get notified when a book is past its due date"
              />
              <SettingRow
                icon={<Lock className="h-4 w-4" />}
                label="Password"
                description="Last changed 3 months ago"
              />
              <SettingRow
                icon={<Shield className="h-4 w-4" />}
                label="Privacy"
                description="Control visibility of your reading history"
              />
            </div>
          </SearchCard>
        </div>
      </div>
    </AppLayout>
  )
}
