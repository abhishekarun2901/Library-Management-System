import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Badge, Button, Input, Select } from '../components/ui'
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
  const { token } = useAuthStore()
  const sidebarItems =
    role === 'librarian' ? librarianSidebarItems : memberSidebarItems
  const topbarTitle = role === 'librarian' ? 'Fines' : 'My Fines'

  const [fines, setFines] = useState<FineResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const loader =
      role === 'librarian' ? getAllFines(token) : getUserFines(token)
    loader
      .then((data) =>
        setFines([...data].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)))
      )
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token, role])

  const handlePay = async (fine: FineResponse) => {
    if (!token || !fine.transactionId) return
    setPayingId(fine.fineId)
    try {
      await payFine(fine.transactionId, token)
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
          title={role === 'librarian' ? 'Fines' : 'My Fines'}
          description={
            role === 'librarian'
              ? 'Track and manage overdue fines across all members'
              : 'View your outstanding library fines'
          }
          action={
            <Link to={role === 'librarian' ? '/librarian' : '/member'}>
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input
                placeholder={
                  role === 'librarian'
                    ? 'Search by member name, book title or fine ID…'
                    : 'Search by book title or fine ID…'
                }
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                placeholder="All"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: 'Unpaid', value: 'unpaid' },
                  { label: 'Paid', value: 'paid' },
                ]}
              />
            </div>
            <div className="flex items-end sm:col-span-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setFilterStatus('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </SearchCard>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
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
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setSearch('')
                  setFilterStatus('')
                }}
              >
                Clear Filters
              </Button>
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
              rows={filtered.map((fine) => [
                ...(role === 'librarian'
                  ? [
                      <div key="member">
                        <p className="font-medium text-gray-900">
                          {fine.memberName ?? '—'}
                        </p>
                      </div>,
                    ]
                  : []),
                <div key="book">
                  <p className="font-medium text-gray-900">
                    {fine.bookTitle ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{fine.reason ?? ''}</p>
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
        </div>
      </div>
    </AppLayout>
  )
}
