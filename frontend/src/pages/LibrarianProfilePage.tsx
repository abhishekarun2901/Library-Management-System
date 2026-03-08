import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AppLayout, PageHeader } from '../components/layout'
import { librarianSidebarItems } from '../config/sidebarConfig'
import { Calendar, Mail, Shield, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { getCurrentUser, type UserResponse } from '../services/userService'

type InfoRowProps = { icon: ReactNode; label: string; value: string }
const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="truncate text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
)

export const LibrarianProfilePage = () => {
  const { token } = useAuthStore()
  const [me, setMe] = useState<UserResponse | null>(null)

  // Derive email from JWT
  let email = 'N/A'
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      email = payload.sub ?? 'N/A'
    }
  } catch {
    /* ignore */
  }

  useEffect(() => {
    if (!token) return
    getCurrentUser(token).then(setMe).catch(console.error)
  }, [token])

  const name = me?.fullName ?? 'Librarian'
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const joinedAt = me?.createdAt
    ? new Date(me.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  return (
    <AppLayout sidebarItems={librarianSidebarItems} topbarTitle="My Profile">
      <div className="w-full space-y-6 p-6 pb-12 max-w-2xl">
        <PageHeader title="My Profile" description="Your account information" />

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-7">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-2 ring-white/30 text-white">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{name}</h2>
                <p className="mt-0.5 text-sm text-indigo-200">{email}</p>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-400/30 px-2.5 py-0.5 text-xs font-medium text-amber-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Librarian
                </span>
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-6 py-2">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Full Name"
              value={name}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={email}
            />
            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label="Role"
              value="Librarian / Admin"
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Account Created"
              value={joinedAt}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
