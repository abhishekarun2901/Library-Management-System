import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { Banner } from '../components/composite'
import { librarianSidebarItems as sidebarItems } from '../config/sidebarConfig'
import { getReports, type ReportResponse } from '../services/reportService'
import {
  BarChart2,
  BookOpen,
  AlertTriangle,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'

const fmt = (n: number | undefined) =>
  n === undefined ? '—' : n.toLocaleString()

const fmtCurrency = (n: number | undefined) =>
  n === undefined ? '—' : `$${n.toFixed(2)}`

export const ReportsPage = () => {
  const { token } = useAuthStore()

  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    getReports(token)
      .then(setReport)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load report.')
      )
      .finally(() => setLoading(false))
  }, [token])

  const stats = report
    ? [
        {
          label: 'Total Inventory',
          value: fmt(report.totalInventory),
          icon: <Package className="h-5 w-5" />,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
        },
        {
          label: 'Overdue Books',
          value: fmt(report.overdueCount),
          icon: <AlertTriangle className="h-5 w-5" />,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
        {
          label: 'Lost Books',
          value: fmt(report.lostCount),
          icon: <BookOpen className="h-5 w-5" />,
          color: 'text-red-600',
          bg: 'bg-red-50',
        },
        {
          label: 'Outstanding Fines',
          value: fmtCurrency(report.totalOutstandingFines),
          icon: <DollarSign className="h-5 w-5" />,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
        },
        {
          label: 'Fine Revenue',
          value: fmtCurrency(report.totalFineRevenue),
          icon: <TrendingUp className="h-5 w-5" />,
          color: 'text-green-600',
          bg: 'bg-green-50',
        },
      ]
    : []

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Reports">
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title="Library Reports"
          description="Inventory overview, circulation statistics, and financial summaries"
          action={
            <Link to="/librarian">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          }
        />

        {error && (
          <Banner
            title={error}
            variant="warning"
            onClose={() => setError(null)}
          />
        )}

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            <BarChart2 className="mx-auto mb-3 h-8 w-8 animate-pulse text-gray-300" />
            Loading report data…
          </div>
        ) : report ? (
          <>
            {report.totalInventory === 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                ℹ️ No transactions recorded yet. The report will become richer
                as library activity grows.
              </div>
            )}
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map(({ label, value, icon, color, bg }) => (
                <div
                  key={label}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${bg} ${color}`}
                  >
                    {icon}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {label}
                  </p>
                  <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>

            {/* Top borrowed + Most active users */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Borrowed Books */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Top Borrowed Books
                  </h3>
                </div>
                {report.topBorrowedBooks.length === 0 ? (
                  <p className="p-6 text-sm text-gray-500">
                    No borrowing data available.
                  </p>
                ) : (
                  <ol className="divide-y divide-gray-100">
                    {report.topBorrowedBooks.map((book, idx) => (
                      <li
                        key={book.title}
                        className="flex items-center gap-4 px-6 py-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                          {book.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                          {book.borrowCount}×
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Most Active Users */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                  <Users className="h-5 w-5 text-purple-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Most Active Members
                  </h3>
                </div>
                {report.mostActiveUsers.length === 0 ? (
                  <p className="p-6 text-sm text-gray-500">
                    No activity data available.
                  </p>
                ) : (
                  <ol className="divide-y divide-gray-100">
                    {report.mostActiveUsers.map((user, idx) => (
                      <li
                        key={user.email}
                        className="flex items-center gap-4 px-6 py-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-600">
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                          {user.email}
                        </span>
                        <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                          {user.borrowCount} loans
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}
