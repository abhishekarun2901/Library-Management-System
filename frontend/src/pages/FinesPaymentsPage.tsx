import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Badge, Button, SearchInput, Select } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { SearchCard, Banner, DataTable } from '../components/composite'
import {
  librarianSidebarItems,
  memberSidebarItems,
} from '../config/sidebarConfig'
import { getAllFines, payFine } from '../services/fineService'
import { getUserFines, type FineResponse } from '../services/userService'

export type FinesPaymentsPageProps = { role?: 'member' | 'librarian' }

const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

export const FinesPaymentsPage = ({
  role = 'member',
}: FinesPaymentsPageProps) => {
  const { isAuthenticated } = useAuthStore()
  const sidebarItems =
    role === 'librarian' ? librarianSidebarItems : memberSidebarItems
  const topbarTitle = role === 'librarian' ? 'Fines & Payments' : 'My Fines'

  const [fines, setFines] = useState<FineResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [finePage, setFinePage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated) return
    const loader = role === 'librarian' ? getAllFines() : getUserFines()
    loader
      .then(setFines)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated, role])

  useEffect(() => {
    setFinePage(1)
  }, [search, filterStatus])

  const handlePay = async (fine: FineResponse) => {
    if (!fine.transactionId) return
    setPayingId(fine.fineId)
    try {
      await payFine(fine.transactionId)
      setFines((prev) =>
        prev.map((f) => (f.fineId === fine.fineId ? { ...f, paid: true } : f))
      )
      setSuccessMsg(`Fine for "${fine.bookTitle ?? 'book'}" marked as paid.`)
    } catch {
      setSuccessMsg('Failed to mark fine as paid.')
    } finally {
      setPayingId(null)
    }
  }

  const filtered = fines.filter((f) => {
    const q = search.toLowerCase()
    const matchSearch =
      search.length < 2 ||
      (f.bookTitle ?? '').toLowerCase().includes(q) ||
      f.fineId.toLowerCase().includes(q) ||
      (f.memberName ?? '').toLowerCase().includes(q)
    const matchStatus =
      !filterStatus || (filterStatus === 'paid' ? f.paid : !f.paid)
    return matchSearch && matchStatus
  })

  const FINES_PER_PAGE = 10
  const totalFinePages = Math.max(
    1,
    Math.ceil(filtered.length / FINES_PER_PAGE)
  )
  const pagedFines = filtered.slice(
    (finePage - 1) * FINES_PER_PAGE,
    finePage * FINES_PER_PAGE
  )
  const getFinePageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    if (totalFinePages <= 7)
      return Array.from({ length: totalFinePages }, (_, i) => i + 1)
    pages.push(1)
    if (finePage > 4) pages.push('...')
    const s = Math.max(2, finePage - 2)
    const e = Math.min(totalFinePages - 1, finePage + 2)
    for (let i = s; i <= e; i++) pages.push(i)
    if (finePage < totalFinePages - 3) pages.push('...')
    pages.push(totalFinePages)
    return pages
  }

  const totalUnpaid = fines
    .filter((f) => !f.paid)
    .reduce((s, f) => s + (f.amount ?? 0), 0)
  const totalPaid = fines
    .filter((f) => f.paid)
    .reduce((s, f) => s + (f.amount ?? 0), 0)

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle={topbarTitle}>
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title={
            role === 'librarian' ? 'Fines & Payments' : 'My Fines & Payments'
          }
          description={
            role === 'librarian'
              ? 'Track and manage overdue fines across all members'
              : 'View your outstanding library fines'
          }
        />

        {successMsg && (
          <Banner
            title={successMsg}
            variant="success"
            onClose={() => setSuccessMsg(null)}
          />
        )}

        {role === 'member' && totalUnpaid > 0 && (
          <Banner
            title={`You have $${totalUnpaid.toFixed(2)} in outstanding fines.`}
            description="Please pay your fines to continue borrowing books without restrictions."
            variant="warning"
          />
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Total Fines',
              value: String(fines.length),
              color: 'text-gray-900',
            },
            {
              label: 'Outstanding',
              value: `$${totalUnpaid.toFixed(2)}`,
              color: 'text-red-600',
            },
            {
              label: role === 'librarian' ? 'Collected' : 'Paid',
              value: `$${totalPaid.toFixed(2)}`,
              color: 'text-green-600',
            },
            {
              label: 'Unpaid Fines',
              value: String(fines.filter((f) => !f.paid).length),
              color: 'text-yellow-600',
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{label}</p>
              <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <SearchCard
          title="Search Fines"
          description={
            role === 'librarian'
              ? 'Filter by member name, book title or fine ID'
              : 'Filter by book title or fine ID'
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              className="flex-1"
              placeholder={
                role === 'librarian'
                  ? 'Search by member name, book title or fine ID…'
                  : 'Search by book title or fine ID…'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
            <Select
              className="sm:w-40"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: 'All', value: '' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Paid', value: 'paid' },
              ]}
            />
          </div>
        </SearchCard>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-900">
                {pagedFines.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filtered.length}
              </span>{' '}
              fine{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading fines…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">
                No fines found matching your criteria.
              </p>
            </div>
          ) : (
            <DataTable
              headers={
                role === 'librarian'
                  ? [
                      'Member',
                      'Book',
                      'Issued At',
                      'Amount',
                      'Status',
                      'Action',
                    ]
                  : ['Book', 'Reason', 'Amount', 'Status', 'Action']
              }
              rows={pagedFines.map((fine) => [
                ...(role === 'librarian'
                  ? [
                      <div key="member" className="max-w-[140px]">
                        <p
                          className="truncate font-medium text-gray-900"
                          title={fine.memberName ?? '—'}
                        >
                          {fine.memberName ?? '—'}
                        </p>
                      </div>,
                    ]
                  : []),
                <div key="book" className="max-w-[160px]">
                  <p
                    className="truncate font-medium text-gray-900"
                    title={fine.bookTitle ?? 'Unknown'}
                  >
                    {fine.bookTitle ?? 'Unknown'}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {fine.reason ?? ''}
                  </p>
                </div>,
                <span key="date" className="text-sm text-gray-600">
                  {role === 'librarian'
                    ? fmtDate(fine.issuedAt)
                    : (fine.reason ?? '—')}
                </span>,
                <span key="amount" className="font-semibold text-gray-900">
                  ${Number(fine.amount ?? 0).toFixed(2)}
                </span>,
                <Badge
                  key="status"
                  label={fine.paid ? 'Paid' : 'Unpaid'}
                  variant={fine.paid ? 'available' : 'overdue'}
                />,
                role === 'librarian' && !fine.paid ? (
                  <Button
                    key="action"
                    className="px-3 py-1.5 text-xs"
                    disabled={payingId === fine.fineId}
                    onClick={() => handlePay(fine)}
                  >
                    {payingId === fine.fineId ? 'Processing…' : 'Mark Paid'}
                  </Button>
                ) : (
                  <span key="action" />
                ),
              ])}
            />
          )}
          {!loading && filtered.length > 0 && totalFinePages > 1 && (
            <div className="mt-4 flex flex-col items-center gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-gray-600">
                Page{' '}
                <span className="font-medium text-gray-900">{finePage}</span> of{' '}
                <span className="font-medium text-gray-900">
                  {totalFinePages}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  disabled={finePage === 1}
                  onClick={() => setFinePage((p) => p - 1)}
                >
                  ← Previous
                </Button>
                {getFinePageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`e${idx}`}
                      className="px-2 text-sm text-gray-400"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setFinePage(page as number)}
                      className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        finePage === page
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  disabled={finePage === totalFinePages}
                  onClick={() => setFinePage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
