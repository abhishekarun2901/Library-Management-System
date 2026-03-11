import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { StatCard, SearchCard, QuickActionTile } from '../components/composite'
import { librarianSidebarItems as sidebarItems } from '../config/sidebarConfig'
import { getReports, type ReportResponse } from '../services/reportService'
import {
  getTransactions,
  type TransactionResponse,
} from '../services/transactionService'
import { Mail, Pencil, Shield, User, Calendar } from 'lucide-react'
import { ProfileEditModal } from '../components/overlay'
import { getCurrentUser } from '../services/userService'
import type { ReactNode } from 'react'

// ── Sub-components ────────────────────────────────────────────────────────────────

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

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

export const LibrarianDashboard = () => {
  const { fullName, isAuthenticated, memberSince } = useAuthStore()
  const firstName = fullName?.split(' ')[0] ?? 'Librarian'

  const [dashEmail, setDashEmail] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)

  useEffect(() => {
    getCurrentUser()
      .then((me) => setDashEmail(me.email))
      .catch(console.error)
  }, [isAuthenticated])

  const initials = (fullName ?? 'LB')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const [report, setReport] = useState<ReportResponse | null>(null)
  const [recentTx, setRecentTx] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([getReports(), getTransactions()])
      .then(([r, txs]) => {
        setReport(r)
        setRecentTx(
          [...txs]
            .sort((a, b) =>
              (b.checkout_date ?? '').localeCompare(a.checkout_date ?? '')
            )
            .slice(0, 5)
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const statusColor: Record<string, string> = {
    issued: 'text-indigo-600',
    overdue: 'text-red-600',
    returned: 'text-emerald-600',
    lost: 'text-gray-500',
  }

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Librarian Dashboard">
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title={`Welcome back, ${firstName}`}
          description="Here's your library management overview"
        />

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Gradient hero */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-2 ring-white/30">
                  {initials}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {fullName ?? 'Librarian'}
                  </h2>
                  <p className="mt-0.5 text-sm text-indigo-200">{dashEmail}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-400/30 px-2.5 py-0.5 text-xs font-medium text-amber-100">
                    <Shield className="h-3 w-3" />
                    Librarian / Admin
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/25 sm:w-auto sm:justify-start"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Read-only info row — 3-col on md+ */}
          <div className="grid grid-cols-1 divide-y divide-gray-100 px-6 md:grid-cols-3 md:divide-x md:divide-y-0">
            <div className="md:pr-6">
              <FieldRow
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={fullName ?? '—'}
              />
            </div>
            <div className="md:px-6">
              <FieldRow
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={dashEmail || '—'}
              />
            </div>
            <div className="md:pl-6">
              <FieldRow
                icon={<Calendar className="h-4 w-4" />}
                label="Account Created"
                value={memberSince ?? '—'}
              />
            </div>
          </div>
        </div>

        {/* Profile edit modal */}
        <ProfileEditModal
          open={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          onProfileUpdate={(name, email) => {
            setDashEmail(email)
            // fullName in store is updated by modal via setAuth
            void name
          }}
        />

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading dashboard…
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Copies"
                value={report ? String(report.totalInventory) : '—'}
                className="border-gray-200 bg-white shadow-sm"
              />
              <StatCard
                label="Overdue Returns"
                value={report ? String(report.overdueCount) : '—'}
                className="border-gray-200 bg-white shadow-sm"
              />
              <StatCard
                label="Outstanding Fines"
                value={
                  report
                    ? `$${Number(report.totalOutstandingFines).toFixed(2)}`
                    : '—'
                }
                className="border-gray-200 bg-white shadow-sm"
              />
              <StatCard
                label="Lost Books"
                value={report ? String(report.lostCount) : '—'}
                className="border-gray-200 bg-white shadow-sm"
              />
            </div>

            <SearchCard
              title="Quick Actions"
              className="border-gray-200 bg-white shadow-sm"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <QuickActionTile
                  title="Issue Book"
                  description="Issue a book to a member"
                  href="/librarian/books"
                />
                <QuickActionTile
                  title="Browse Catalog"
                  description="Search the book catalog"
                  href="/librarian/books"
                />
                <QuickActionTile
                  title="Add Book"
                  description="Add a new book to the library"
                  href="/librarian/books"
                />
                <QuickActionTile
                  title="Register Member"
                  description="Register a new library member"
                  href="/librarian/members"
                />
                <QuickActionTile
                  title="Reservations"
                  description="Manage book reservations"
                  href="/librarian/reservations"
                />
              </div>
            </SearchCard>

            <Card className="border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h2>
              </CardHeader>
              <CardContent>
                {recentTx.length === 0 ? (
                  <p className="text-sm text-gray-500">No transactions yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Book
                          </th>
                          <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Member
                          </th>
                          <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Checked Out
                          </th>
                          <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Due Date
                          </th>
                          <th className="pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {recentTx.map((tx) => (
                          <tr
                            key={tx.transactionId}
                            className="hover:bg-gray-50/60"
                          >
                            <td
                              className="max-w-[200px] truncate py-3 pr-4 font-medium text-gray-900"
                              title={tx.bookTitle ?? ''}
                            >
                              {tx.bookTitle ?? 'Unknown Book'}
                            </td>
                            <td
                              className="max-w-[160px] truncate py-3 pr-4 text-gray-700"
                              title={tx.memberName ?? ''}
                            >
                              {tx.memberName ?? '—'}
                            </td>
                            <td className="whitespace-nowrap py-3 pr-4 text-gray-600">
                              {fmtDate(tx.checkout_date)}
                            </td>
                            <td className="whitespace-nowrap py-3 pr-4 text-gray-600">
                              {tx.due_date ? fmtDate(tx.due_date) : '—'}
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-xs font-semibold capitalize ${statusColor[tx.status] ?? 'text-gray-500'}`}
                              >
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Link to="/librarian/reports#transactions" className="w-full">
                  <Button variant="secondary" className="w-full">
                    View All Transactions
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
