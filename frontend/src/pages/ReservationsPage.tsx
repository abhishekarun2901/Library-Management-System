import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Badge, Button, SearchInput, Select } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { SearchCard, Banner } from '../components/composite'
import { Modal } from '../components/overlay'
import {
  librarianSidebarItems,
  memberSidebarItems,
} from '../config/sidebarConfig'
import {
  getReservations,
  cancelReservation,
  updateReservationStatus,
  type ReservationResponse,
} from '../services/reservationService'

export type ReservationsPageProps = { role?: 'member' | 'librarian' }

const statusBadgeVariant: Record<
  string,
  'available' | 'issued' | 'pending' | 'overdue'
> = {
  active: 'pending',
  fulfilled: 'issued',
  expired: 'overdue',
  cancelled: 'overdue',
}
const statusLabel: Record<string, string> = {
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

export const ReservationsPage = ({
  role = 'member',
}: ReservationsPageProps) => {
  const { isAuthenticated } = useAuthStore()
  const sidebarItems =
    role === 'librarian' ? librarianSidebarItems : memberSidebarItems
  const topbarTitle = role === 'librarian' ? 'Reservations' : 'My Reservations'

  const [reservations, setReservations] = useState<ReservationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ReservationResponse | null>(
    null
  )
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [resPage, setResPage] = useState(1)
  const RES_PER_PAGE = 10

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [displaySearch, setDisplaySearch] = useState('')

  const handleSearchChange = (value: string) => {
    setDisplaySearch(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value)
      setResPage(1)
    }, 300)
  }

  useEffect(() => {
    if (!isAuthenticated) return
    getReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  useEffect(() => {
    setResPage(1)
  }, [filterStatus])

  const handleMarkFulfilled = async (res: ReservationResponse) => {
    setActionLoading(res.reservationId)
    try {
      await updateReservationStatus(res.reservationId, 'fulfilled')
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === res.reservationId
            ? { ...r, status: 'fulfilled' }
            : r
        )
      )
      setSuccessMessage(
        `"${res.bookTitle}" has been issued to the member. Reservation fulfilled.`
      )
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to fulfill reservation.'
      setSuccessMessage(msg)
    } finally {
      setActionLoading(null)
    }
  }

  const openCancel = (res: ReservationResponse) => {
    setCancelTarget(res)
    setIsCancelOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return
    setActionLoading(cancelTarget.reservationId)
    try {
      await cancelReservation(cancelTarget.reservationId)
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === cancelTarget.reservationId
            ? { ...r, status: 'cancelled' }
            : r
        )
      )
      setSuccessMessage(
        `Reservation for "${cancelTarget.bookTitle}" has been cancelled.`
      )
    } catch {
      setSuccessMessage('Failed to cancel reservation.')
    } finally {
      setActionLoading(null)
      setCancelTarget(null)
      setIsCancelOpen(false)
    }
  }

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase()
    const matchSearch =
      search.length < 2 ||
      r.bookTitle.toLowerCase().includes(q) ||
      (r.memberName ?? '').toLowerCase().includes(q)
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const resTotalPages = Math.max(1, Math.ceil(filtered.length / RES_PER_PAGE))
  const getResPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    if (resTotalPages <= 7)
      return Array.from({ length: resTotalPages }, (_, i) => i + 1)
    pages.push(1)
    if (resPage > 4) pages.push('...')
    const s = Math.max(2, resPage - 2)
    const e = Math.min(resTotalPages - 1, resPage + 2)
    for (let i = s; i <= e; i++) pages.push(i)
    if (resPage < resTotalPages - 3) pages.push('...')
    pages.push(resTotalPages)
    return pages
  }

  const activeCount = reservations.filter((r) => r.status === 'active').length
  const fulfilledCount = reservations.filter(
    (r) => r.status === 'fulfilled'
  ).length

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle={topbarTitle}>
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title={role === 'librarian' ? 'Reservations' : 'My Reservations'}
          description={
            role === 'librarian'
              ? 'Manage all member book reservations'
              : 'Track your book reservation requests'
          }
          action={
            <div className="flex items-center gap-3">
              {role === 'member' && (
                <Link to="/member/catalog">
                  <Button>Reserve a Book</Button>
                </Link>
              )}
            </div>
          }
        />

        {successMessage && (
          <Banner
            title={successMessage}
            variant="success"
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {role === 'member' && activeCount > 0 && (
          <Banner
            title={`${activeCount} reservation${activeCount > 1 ? 's are' : ' is'} ready for pickup!`}
            description="Please visit the library within the next 3 days to collect your reserved book(s)."
            variant="info"
          />
        )}

        {role === 'librarian' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[
              {
                label: 'Total',
                value: reservations.length,
                color: 'text-gray-900',
              },
              { label: 'Active', value: activeCount, color: 'text-yellow-600' },
              {
                label: 'Ready for Pickup',
                value: activeCount,
                color: 'text-green-600',
              },
              {
                label: 'Fulfilled (All Time)',
                value: fulfilledCount,
                color: 'text-blue-600',
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
        )}

        <SearchCard
          title="Search Reservations"
          description={
            role === 'librarian'
              ? 'Filter by book title or status'
              : 'Filter by book title'
          }
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              className="flex-1"
              placeholder="Search by book title or member name…"
              value={displaySearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClear={() => {
                setDisplaySearch('')
                setSearch('')
                setResPage(1)
              }}
            />
            <Select
              className="sm:w-44"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { label: 'All Status', value: '' },
                { label: 'Active', value: 'active' },
                { label: 'Fulfilled', value: 'fulfilled' },
                { label: 'Expired', value: 'expired' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />
          </div>
        </SearchCard>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{' '}
              <span className="font-medium text-gray-900">
                {Math.min(resPage * RES_PER_PAGE, filtered.length) -
                  (resPage - 1) * RES_PER_PAGE}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filtered.length}
              </span>{' '}
              reservation{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading reservations…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">
                No reservations found matching your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Book
                      </th>
                      {role === 'librarian' && (
                        <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Member
                        </th>
                      )}
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Reserved On
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Status / Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered
                      .slice(
                        (resPage - 1) * RES_PER_PAGE,
                        resPage * RES_PER_PAGE
                      )
                      .map((res) => (
                        <tr
                          key={res.reservationId}
                          className="hover:bg-gray-50/60"
                        >
                          <td className="px-4 py-4 max-w-[220px]">
                            <span
                              className="block truncate font-semibold text-gray-900"
                              title={res.bookTitle}
                            >
                              {res.bookTitle}
                            </span>
                          </td>
                          {role === 'librarian' && (
                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {res.memberName ?? '—'}
                            </td>
                          )}
                          <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                            {fmtDate(res.reservedAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                label={statusLabel[res.status] ?? res.status}
                                variant={
                                  statusBadgeVariant[res.status] ?? 'pending'
                                }
                              />
                              {res.status === 'active' && (
                                <>
                                  {role === 'librarian' && (
                                    <Button
                                      className="px-3 py-1.5 text-xs bg-green-600 hover:bg-green-700"
                                      disabled={
                                        actionLoading === res.reservationId
                                      }
                                      onClick={() => handleMarkFulfilled(res)}
                                    >
                                      Fulfill
                                    </Button>
                                  )}
                                  <Button
                                    className="px-3 py-1.5 text-xs"
                                    variant="secondary"
                                    disabled={
                                      actionLoading === res.reservationId
                                    }
                                    onClick={() => openCancel(res)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {resTotalPages > 1 && (
                <div className="mt-4 flex flex-col items-center gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between">
                  <p className="text-sm text-gray-600">
                    Page{' '}
                    <span className="font-medium text-gray-900">{resPage}</span>{' '}
                    of{' '}
                    <span className="font-medium text-gray-900">
                      {resTotalPages}
                    </span>
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      disabled={resPage === 1}
                      onClick={() => setResPage((p) => p - 1)}
                    >
                      ← Previous
                    </Button>
                    {getResPageNumbers().map((page, idx) =>
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
                          onClick={() => setResPage(page as number)}
                          className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            resPage === page
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
                      disabled={resPage === resTotalPages}
                      onClick={() => setResPage((p) => p + 1)}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        open={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false)
          setCancelTarget(null)
        }}
        title="Cancel Reservation"
        primaryAction={
          <Button onClick={handleConfirmCancel}>Yes, Cancel</Button>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel the reservation for{' '}
          <span className="font-semibold text-gray-900">
            {cancelTarget?.bookTitle}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </AppLayout>
  )
}
