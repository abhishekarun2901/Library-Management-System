import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Badge } from '../components/ui'
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

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
    <p className="text-gray-500">{message}</p>
  </div>
)

export const MyActivityPage = () => {
  const { token } = useAuthStore()
  const validTabs: Tab[] = ['loans', 'reservations', 'fines', 'history']
  const hashTab = window.location.hash.replace('#', '') as Tab
  const [activeTab, setActiveTab] = useState<Tab>(
    validTabs.includes(hashTab) ? hashTab : 'loans'
  )

  const switchTab = (tab: Tab) => {
    setActiveTab(tab)
    window.location.hash = tab
  }
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [reservationsList, setReservationsList] = useState<
    ReservationResponse[]
  >([])
  const [fines, setFines] = useState<FineResponse[]>([])
  const [history, setHistory] = useState<TransactionResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    Promise.all([
      getTransactions(token),
      getReservations(token),
      getUserFines(token),
      getUserHistory(token),
    ])
      .then(([txs, res, fins, hist]) => {
        const byCheckout = (a: TransactionResponse, b: TransactionResponse) =>
          (b.checkout_date ?? '').localeCompare(a.checkout_date ?? '')
        setTransactions(
          txs
            .filter((t) => t.status === 'issued' || t.status === 'overdue')
            .sort(byCheckout)
        )
        setReservationsList(
          [...res].sort((a, b) => b.reservedAt.localeCompare(a.reservedAt))
        )
        setFines([...fins].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)))
        setHistory([...hist].sort(byCheckout))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const activeLoans = transactions
  const unpaidFines = fines.filter((f) => !f.paid)
  const totalUnpaid = unpaidFines.reduce((s, f) => s + (f.amount ?? 0), 0)

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
                  rows={activeLoans.map((loan) => {
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
                      <div key="book">
                        <p className="font-medium text-gray-900">
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

            {activeTab === 'reservations' &&
              (reservationsList.length === 0 ? (
                <EmptyState message="You have no active reservations." />
              ) : (
                <DataTable
                  headers={['Book', 'Reserved On', 'Expires', 'Status']}
                  rows={reservationsList.map((res) => [
                    <div key="book">
                      <p className="font-medium text-gray-900">
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
                    rows={fines.map((fine) => [
                      <div key="book">
                        <p className="font-medium text-gray-900">
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
              </div>
            )}

            {activeTab === 'history' &&
              (history.length === 0 ? (
                <EmptyState message="No activity recorded yet." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="divide-y divide-gray-100">
                    {history.map((entry) => (
                      <div
                        key={entry.transactionId}
                        className="flex items-center gap-4 px-5 py-4"
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
                        <p className="flex-1 text-sm text-gray-900">
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
          </>
        )}
      </div>
    </AppLayout>
  )
}
