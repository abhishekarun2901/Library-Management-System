import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Badge, Button } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { DataTable } from '../components/composite'
import { memberSidebarItems } from '../config/sidebarConfig'
import {
  getTransactions,
  type TransactionResponse,
} from '../services/transactionService'
import {
  getReservations,
  type ReservationResponse,
} from '../services/reservationService'
import {
  getUserFines,
  getUserHistory,
  type FineResponse,
} from '../services/userService'

const txBadgeVariant: Record<
  string,
  'overdue' | 'issued' | 'available' | 'pending'
> = {
  issued: 'issued',
  overdue: 'overdue',
  returned: 'available',
  lost: 'pending',
}
const txBadgeLabel: Record<string, string> = {
  issued: 'Issued',
  overdue: 'Overdue',
  returned: 'Returned',
  lost: 'Lost',
}
const resBadgeVariant: Record<
  string,
  'pending' | 'available' | 'issued' | 'overdue'
> = {
  active: 'pending',
  fulfilled: 'issued',
  expired: 'overdue',
  cancelled: 'overdue',
}
const resBadgeLabel: Record<string, string> = {
  active: 'Active',
  fulfilled: 'Fulfilled',
  expired: 'Expired',
  cancelled: 'Cancelled',
}
const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

type Tab = 'loans' | 'reservations' | 'fines' | 'history'

const getActPageNumbers = (page: number, total: number): (number | '...')[] => {
  const pages: (number | '...')[] = []
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  pages.push(1)
  if (page > 4) pages.push('...')
  const s = Math.max(2, page - 2)
  const e = Math.min(total - 1, page + 2)
  for (let i = s; i <= e; i++) pages.push(i)
  if (page < total - 3) pages.push('...')
  pages.push(total)
  return pages
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
    <p className="text-gray-500">{message}</p>
  </div>
)

export const MyActivityPage = () => {
  const { isAuthenticated } = useAuthStore()
  const validTabs: Tab[] = ['loans', 'reservations', 'fines', 'history']
  const hashTab = window.location.hash.replace('#', '') as Tab
  const [activeTab, setActiveTab] = useState<Tab>(
    validTabs.includes(hashTab) ? hashTab : 'loans'
  )

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    window.location.hash = tab
    setLoansPage(1)
    setResPage(1)
    setFinesPage(1)
    setHistPage(1)
  }
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [reservationsList, setReservationsList] = useState<
    ReservationResponse[]
  >([])
  const [fines, setFines] = useState<FineResponse[]>([])
  const [history, setHistory] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loansPage, setLoansPage] = useState(1)
  const [resPage, setResPage] = useState(1)
  const [finesPage, setFinesPage] = useState(1)
  const [histPage, setHistPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) return
    Promise.all([
      getTransactions(),
      getReservations(),
      getUserFines(),
      getUserHistory(),
    ])
      .then(([txs, res, fins, hist]) => {
        setTransactions(
          txs.filter((t) => t.status === 'issued' || t.status === 'overdue')
        )
        setReservationsList(res)
        setFines(fins)
        setHistory(hist)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const activeLoans = transactions
  const unpaidFines = fines.filter((f) => !f.paid)
  const totalUnpaid = unpaidFines.reduce((s, f) => s + (f.amount ?? 0), 0)

  const ACT_PER_PAGE = 10
  const loansTotalPages = Math.max(
    1,
    Math.ceil(activeLoans.length / ACT_PER_PAGE)
  )
  const pagedLoans = activeLoans.slice(
    (loansPage - 1) * ACT_PER_PAGE,
    loansPage * ACT_PER_PAGE
  )
  const resTotalPages = Math.max(
    1,
    Math.ceil(reservationsList.length / ACT_PER_PAGE)
  )
  const pagedReservations = reservationsList.slice(
    (resPage - 1) * ACT_PER_PAGE,
    resPage * ACT_PER_PAGE
  )
  const actFinePages = Math.max(1, Math.ceil(fines.length / ACT_PER_PAGE))
  const pagedFinesAct = fines.slice(
    (finesPage - 1) * ACT_PER_PAGE,
    finesPage * ACT_PER_PAGE
  )
  const histTotalPages = Math.max(1, Math.ceil(history.length / ACT_PER_PAGE))
  const pagedHist = history.slice(
    (histPage - 1) * ACT_PER_PAGE,
    histPage * ACT_PER_PAGE
  )

  const renderActPagination = (
    page: number,
    totalPages: number,
    setPage: (n: number) => void
  ) => (
    <div className="mt-4 flex flex-col items-center gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-gray-600">
        Page <span className="font-medium text-gray-900">{page}</span> of{' '}
        <span className="font-medium text-gray-900">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          ← Previous
        </Button>
        {getActPageNumbers(page, totalPages).map((pg, idx) =>
          pg === '...' ? (
            <span key={`e${idx}`} className="px-2 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => setPage(pg as number)}
              className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                page === pg
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pg}
            </button>
          )
        )}
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  )

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: 'loans', label: 'My Loans', badge: activeLoans.length || undefined },
    {
      id: 'reservations',
      label: 'Reservations',
      badge: reservationsList.length || undefined,
    },
    { id: 'fines', label: 'Fines', badge: unpaidFines.length || undefined },
    { id: 'history', label: 'History' },
  ]

  return (
    <AppLayout sidebarItems={memberSidebarItems} topbarTitle="My Activity">
      <div className="w-full space-y-6 p-6 pb-12">
        <PageHeader
          title="My Activity"
          description="Track your loans, reservations, fines and borrowing history"
        />

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">
            Loading…
          </div>
        ) : (
          <>
            {activeTab === 'loans' &&
              (activeLoans.length === 0 ? (
                <EmptyState message="You have no active loans." />
              ) : (
                <DataTable
                  headers={[
                    'Book',
                    'Borrowed',
                    'Due Date',
                    'Est. Fine',
                    'Status',
                  ]}
                  rows={pagedLoans.map((loan) => {
                    const isOverdue = loan.status === 'overdue'
                    const daysOverdue =
                      isOverdue && loan.due_date
                        ? Math.max(
                            0,
                            Math.floor(
                              (Date.now() - new Date(loan.due_date).getTime()) /
                                86400000
                            )
                          )
                        : 0
                    const finePerDay = 0.5
                    const estFine =
                      loan.estimatedFine ??
                      (isOverdue ? daysOverdue * finePerDay : 0)
                    return [
                      <div key="book" className="max-w-[180px]">
                        <p
                          className="truncate font-medium text-gray-900"
                          title={loan.bookTitle ?? 'Unknown'}
                        >
                          {loan.bookTitle ?? 'Unknown'}
                        </p>
                      </div>,
                      <span key="borrowed" className="text-sm text-gray-600">
                        {fmtDate(loan.checkout_date)}
                      </span>,
                      <span
                        key="due"
                        className={`text-sm font-medium ${loan.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}
                      >
                        {fmtDate(loan.due_date)}
                      </span>,
                      isOverdue ? (
                        <span
                          key="fine"
                          className="text-xs text-red-600 font-medium"
                        >
                          ${finePerDay.toFixed(2)}/day × {daysOverdue}d ={' '}
                          <span className="font-bold">
                            ${estFine.toFixed(2)}
                          </span>
                        </span>
                      ) : (
                        <span key="fine" className="text-xs text-gray-400">
                          —
                        </span>
                      ),
                      <Badge
                        key="status"
                        label={txBadgeLabel[loan.status] ?? loan.status}
                        variant={txBadgeVariant[loan.status] ?? 'pending'}
                      />,
                    ]
                  })}
                />
              ))}
            {activeTab === 'loans' &&
              activeLoans.length > 0 &&
              loansTotalPages > 1 &&
              renderActPagination(loansPage, loansTotalPages, setLoansPage)}

            {activeTab === 'reservations' &&
              (reservationsList.length === 0 ? (
                <EmptyState message="You have no active reservations." />
              ) : (
                <DataTable
                  headers={['Book', 'Reserved On', 'Expires', 'Status']}
                  rows={pagedReservations.map((res) => [
                    <div key="book" className="max-w-[180px]">
                      <p
                        className="truncate font-medium text-gray-900"
                        title={res.bookTitle}
                      >
                        {res.bookTitle}
                      </p>
                    </div>,
                    <span key="reserved" className="text-sm text-gray-600">
                      {fmtDate(res.reservedAt)}
                    </span>,
                    <span key="expires" className="text-sm text-gray-600">
                      {fmtDate(res.expiresAt)}
                    </span>,
                    <Badge
                      key="status"
                      label={resBadgeLabel[res.status] ?? res.status}
                      variant={resBadgeVariant[res.status] ?? 'pending'}
                    />,
                  ])}
                />
              ))}
            {activeTab === 'reservations' &&
              reservationsList.length > 0 &&
              resTotalPages > 1 &&
              renderActPagination(resPage, resTotalPages, setResPage)}

            {activeTab === 'fines' && (
              <div className="space-y-4">
                {totalUnpaid > 0 && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                    You have{' '}
                    <span className="font-semibold">
                      ${totalUnpaid.toFixed(2)}
                    </span>{' '}
                    in outstanding fines.
                  </div>
                )}
                {fines.length === 0 ? (
                  <EmptyState message="You have no fines." />
                ) : (
                  <DataTable
                    headers={['Book', 'Reason', 'Amount', 'Status']}
                    rows={pagedFinesAct.map((fine) => [
                      <div key="book" className="max-w-[180px]">
                        <p
                          className="truncate font-medium text-gray-900"
                          title={fine.bookTitle ?? 'Unknown'}
                        >
                          {fine.bookTitle ?? 'Unknown'}
                        </p>
                      </div>,
                      <span key="reason" className="text-sm text-gray-600">
                        {fine.reason ?? '—'}
                      </span>,
                      <span
                        key="amount"
                        className="font-semibold text-gray-900"
                      >
                        ${Number(fine.amount ?? 0).toFixed(2)}
                      </span>,
                      <Badge
                        key="status"
                        label={fine.paid ? 'Paid' : 'Unpaid'}
                        variant={fine.paid ? 'available' : 'overdue'}
                      />,
                    ])}
                  />
                )}
                {fines.length > 0 &&
                  actFinePages > 1 &&
                  renderActPagination(finesPage, actFinePages, setFinesPage)}
              </div>
            )}

            {activeTab === 'history' &&
              (history.length === 0 ? (
                <EmptyState message="No activity recorded yet." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="divide-y divide-gray-100">
                    {pagedHist.map((entry) => (
                      <div
                        key={entry.transactionId}
                        className="flex min-h-[56px] items-center gap-4 px-5 py-3"
                      >
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            entry.status === 'returned'
                              ? 'bg-emerald-100 text-emerald-700'
                              : entry.status === 'overdue' ||
                                  entry.status === 'lost'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {txBadgeLabel[entry.status] ?? entry.status}
                        </span>
                        <p
                          className="min-w-0 flex-1 truncate text-sm text-gray-900"
                          title={entry.bookTitle ?? 'Unknown Book'}
                        >
                          {entry.bookTitle ?? 'Unknown Book'}
                        </p>
                        <p className="shrink-0 text-xs text-gray-500">
                          {fmtDate(entry.checkout_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {activeTab === 'history' &&
              history.length > 0 &&
              histTotalPages > 1 &&
              renderActPagination(histPage, histTotalPages, setHistPage)}
          </>
        )}
      </div>
    </AppLayout>
  )
}
