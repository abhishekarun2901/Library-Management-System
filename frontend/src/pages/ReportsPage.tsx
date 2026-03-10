import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { Banner } from '../components/composite'
import { librarianSidebarItems as sidebarItems } from '../config/sidebarConfig'
import { getReports, type ReportResponse } from '../services/reportService'
import {
  getTransactions,
  type TransactionResponse,
} from '../services/transactionService'
import {
  getAllFines,
  payFine,
  type FineResponse,
} from '../services/fineService'
import {
  BarChart2,
  AlertTriangle,
  BookOpen,
  DollarSign,
  Package,
  TrendingUp,
} from 'lucide-react'

const fmt = (n: number | undefined) =>
  n === undefined ? '—' : n.toLocaleString()

const fmtCurrency = (n: number | undefined) =>
  n === undefined ? '—' : `$${n.toFixed(2)}`

const TX_PAGE_SIZE = 10

export const ReportsPage = () => {
  const { token } = useAuthStore()
  const location = useLocation()

  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [txLoading, setTxLoading] = useState(true)
  const [txFilter, setTxFilter] = useState('')
  const [txPage, setTxPage] = useState(0)
  const txRef = useRef<HTMLDivElement>(null)

  const [fines, setFines] = useState<FineResponse[]>([])
  const [payingFineId, setPayingFineId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!token) return
    setTxLoading(true)
    getTransactions(token)
      .then((txs) =>
        setTransactions(
          [...txs].sort((a, b) =>
            (b.checkout_date ?? '').localeCompare(a.checkout_date ?? '')
          )
        )
      )
      .catch(console.error)
      .finally(() => setTxLoading(false))
  }, [token])

  useEffect(() => {
    if (!token) return
    getAllFines(token)
      .then((data) =>
        setFines([...data].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)))
      )
      .catch(console.error)
  }, [token])

  // Reset to page 0 when filter changes
  useEffect(() => {
    setTxPage(0)
  }, [txFilter])

  const handleMarkPaid = async (fine: FineResponse) => {
    if (!token) return
    setPayingFineId(fine.fineId)
    try {
      await payFine(fine.transactionId, token)
      setFines((prev) =>
        prev.map((f) => (f.fineId === fine.fineId ? { ...f, paid: true } : f))
      )
      setReport((prev) =>
        prev
          ? {
              ...prev,
              totalOutstandingFines: Math.max(
                0,
                prev.totalOutstandingFines - fine.amount
              ),
              totalFineRevenue: prev.totalFineRevenue + fine.amount,
            }
          : prev
      )
    } catch {
      /* ignore */
    } finally {
      setPayingFineId(null)
    }
  }

  // Scroll to #transactions if navigated with that hash
  useEffect(() => {
    if (location.hash === '#transactions' && txRef.current) {
      setTimeout(
        () =>
          txRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        120
      )
    }
  }, [location.hash, txLoading])

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

            {/* ── All Transactions ───────────────────────────────────────── */}
            <div
              id="transactions"
              ref={txRef}
              className="scroll-mt-20 rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    All Transactions
                  </h3>
                  <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {transactions.length}
                  </span>
                </div>
                <input
                  type="search"
                  placeholder="Filter by book or status…"
                  value={txFilter}
                  onChange={(e) => setTxFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              {txLoading ? (
                <p className="px-6 py-8 text-center text-sm text-gray-400">
                  Loading transactions…
                </p>
              ) : (
                (() => {
                  const fineByTx = new Map(
                    fines.map((f) => [f.transactionId, f])
                  )
                  const q = txFilter.toLowerCase()
                  const filtered = transactions.filter(
                    (t) =>
                      !q ||
                      (t.bookTitle ?? '').toLowerCase().includes(q) ||
                      (t.memberName ?? '').toLowerCase().includes(q) ||
                      t.status.toLowerCase().includes(q)
                  )
                  const totalPages = Math.max(
                    1,
                    Math.ceil(filtered.length / TX_PAGE_SIZE)
                  )
                  const safePage = Math.min(txPage, totalPages - 1)
                  const paged = filtered.slice(
                    safePage * TX_PAGE_SIZE,
                    safePage * TX_PAGE_SIZE + TX_PAGE_SIZE
                  )
                  const fmtD = (d: string | null) =>
                    d
                      ? new Date(d).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'
                  const statusColors: Record<string, string> = {
                    issued: 'bg-indigo-100 text-indigo-700',
                    returned: 'bg-emerald-100 text-emerald-700',
                    overdue: 'bg-red-100 text-red-700',
                    lost: 'bg-gray-200 text-gray-600',
                    'paid with fine': 'bg-teal-100 text-teal-700',
                  }
                  return filtered.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-gray-400">
                      No transactions found.
                    </p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                              <th className="px-6 py-3">Book</th>
                              <th className="px-4 py-3">Member</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3">Checked Out</th>
                              <th className="px-4 py-3">Due Date</th>
                              <th className="px-4 py-3">Returned</th>
                              <th className="px-4 py-3 text-right">Fine</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paged.map((tx) => {
                              const fine = fineByTx.get(tx.transactionId)
                              return (
                                <tr
                                  key={tx.transactionId}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="max-w-[200px] truncate px-6 py-3 font-medium text-gray-900">
                                    {tx.bookTitle ?? 'Unknown'}
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                    {tx.memberName ?? '—'}
                                  </td>
                                  <td className="px-4 py-3">
                                    {(() => {
                                      const label =
                                        tx.finePaid === true
                                          ? 'paid with fine'
                                          : tx.status
                                      return (
                                        <span
                                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusColors[label] ?? 'bg-gray-100 text-gray-600'}`}
                                        >
                                          {label}
                                        </span>
                                      )
                                    })()}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">
                                    {fmtD(tx.checkout_date)}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">
                                    {fmtD(tx.due_date)}
                                  </td>
                                  <td className="px-4 py-3 text-gray-600">
                                    {fmtD(tx.return_date)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {fine ? (
                                      <div className="flex items-center justify-end gap-2">
                                        <span
                                          className={`text-xs font-semibold ${fine.paid ? 'text-emerald-600' : 'text-red-600'}`}
                                        >
                                          ${fine.amount.toFixed(2)}
                                          {fine.paid && (
                                            <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-emerald-700">
                                              paid
                                            </span>
                                          )}
                                        </span>
                                        {!fine.paid && (
                                          <Button
                                            variant="secondary"
                                            className="py-0.5 px-2 text-xs text-emerald-700 hover:bg-emerald-50"
                                            disabled={
                                              payingFineId === fine.fineId
                                            }
                                            onClick={() => handleMarkPaid(fine)}
                                          >
                                            {payingFineId === fine.fineId
                                              ? '…'
                                              : 'Mark Paid'}
                                          </Button>
                                        )}
                                      </div>
                                    ) : tx.estimatedFine != null &&
                                      tx.estimatedFine > 0 ? (
                                      <span className="text-xs text-gray-500">
                                        ~${tx.estimatedFine.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-gray-400">—</span>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                          <p className="text-xs text-gray-500">
                            Showing{' '}
                            <span className="font-medium">
                              {safePage * TX_PAGE_SIZE + 1}–
                              {Math.min(
                                (safePage + 1) * TX_PAGE_SIZE,
                                filtered.length
                              )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">
                              {filtered.length}
                            </span>
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                              disabled={safePage === 0}
                              onClick={() => setTxPage((p) => p - 1)}
                            >
                              ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i)
                              .filter(
                                (i) =>
                                  i === 0 ||
                                  i === totalPages - 1 ||
                                  Math.abs(i - safePage) <= 2
                              )
                              .reduce<(number | 'gap')[]>(
                                (acc, i, idx, arr) => {
                                  if (
                                    idx > 0 &&
                                    i - (arr[idx - 1] as number) > 1
                                  )
                                    acc.push('gap')
                                  acc.push(i)
                                  return acc
                                },
                                []
                              )
                              .map((item, idx) =>
                                item === 'gap' ? (
                                  <span
                                    key={`gap-${idx}`}
                                    className="px-1 text-xs text-gray-400"
                                  >
                                    …
                                  </span>
                                ) : (
                                  <button
                                    key={item}
                                    onClick={() => setTxPage(item as number)}
                                    className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none ${safePage === item ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                                  >
                                    {(item as number) + 1}
                                  </button>
                                )
                              )}
                            <button
                              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                              disabled={safePage === totalPages - 1}
                              onClick={() => setTxPage((p) => p + 1)}
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()
              )}
            </div>
          </>
        ) : null}
      </div>
    </AppLayout>
  )
}
