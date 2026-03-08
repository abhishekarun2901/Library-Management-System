import { useEffect, useState } from 'react'
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

const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

export const LibrarianDashboard = () => {
  const { fullName, token } = useAuthStore()
  const firstName = fullName?.split(' ')[0] ?? 'Librarian'
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [recentTx, setRecentTx] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([getReports(token), getTransactions(token)])
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
  }, [token])

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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Transactions
                  </h2>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentTx.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No transactions yet.
                    </p>
                  ) : (
                    recentTx.map((tx) => (
                      <div
                        key={tx.transactionId}
                        className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {tx.bookTitle ?? 'Unknown Book'}
                          </p>
                          <p
                            className={`text-xs font-medium capitalize ${statusColor[tx.status] ?? 'text-gray-500'}`}
                          >
                            {tx.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-700">
                            {fmtDate(tx.checkout_date)}
                          </p>
                          {tx.due_date && (
                            <p className="text-xs text-gray-500">
                              Due: {fmtDate(tx.due_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" className="w-full">
                    View All Transactions
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-gray-200 bg-white shadow-sm">
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Top Borrowed Books
                  </h2>
                </CardHeader>
                <CardContent className="space-y-2">
                  {report?.topBorrowedBooks?.length ? (
                    report.topBorrowedBooks.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                      >
                        <p className="truncate font-medium text-gray-900">
                          {b.title}
                        </p>
                        <span className="ml-2 shrink-0 text-xs font-semibold text-indigo-600">
                          {b.borrowCount}×
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No data available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
