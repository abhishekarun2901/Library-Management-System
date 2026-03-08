import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Badge, Button, Input, Select } from '../components/ui'
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
  const { token } = useAuthStore()
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

  useEffect(() => {
    if (!token) return
    getReservations(token)
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  const handleMarkFulfilled = async (res: ReservationResponse) => {
    if (!token) return
    setActionLoading(res.reservationId)
    try {
      await updateReservationStatus(res.reservationId, 'fulfilled', token)
      setReservations((prev) =>
        prev.map((r) =>
          r.reservationId === res.reservationId
            ? { ...r, status: 'fulfilled' }
            : r
        )
      )
      setSuccessMessage(
        `Reservation for "${res.bookTitle}" marked as fulfilled.`
      )
    } catch {
      setSuccessMessage('Failed to fulfill reservation.')
    } finally {
      setActionLoading(null)
    }
  }

  const openCancel = (res: ReservationResponse) => {
    setCancelTarget(res)
    setIsCancelOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !token) return
    setActionLoading(cancelTarget.reservationId)
    try {
      await cancelReservation(cancelTarget.reservationId, token)
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
      search.length < 2 || r.bookTitle.toLowerCase().includes(q)
    const matchStatus = !filterStatus || r.status === filterStatus
    return matchSearch && matchStatus
  })

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
              <Link to={role === 'librarian' ? '/librarian' : '/member'}>
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input
                placeholder="Search by book title…"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                placeholder="All Statuses"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Fulfilled', value: 'fulfilled' },
                  { label: 'Expired', value: 'expired' },
                  { label: 'Cancelled', value: 'cancelled' },
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
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Book
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Reserved On
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Expires
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
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {res.bookTitle}
                              </span>
                              <Badge
                                label={statusLabel[res.status] ?? res.status}
                                variant={
                                  statusBadgeVariant[res.status] ?? 'pending'
                                }
                              />
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                            {fmtDate(res.reservedAt)}
                          </td>
                          <td
                            className={`whitespace-nowrap px-4 py-4 font-medium ${res.status === 'active' ? 'text-amber-600' : 'text-gray-700'}`}
                          >
                            {fmtDate(res.expiresAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col items-start gap-2">
                              {role === 'librarian' ? (
                                <>
                                  {res.status === 'active' && (
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
                                  {res.status === 'active' && (
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
                                  )}
                                </>
                              ) : (
                                res.status === 'active' && (
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
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {Math.ceil(filtered.length / RES_PER_PAGE) > 1 && (
                <div className="flex items-center justify-end border-t border-gray-200 pt-3">
                  <div className="flex gap-1">
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      disabled={resPage === 1}
                      onClick={() => setResPage((p) => p - 1)}
                    >
                      ← Prev
                    </Button>
                    <Button
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      disabled={
                        resPage >= Math.ceil(filtered.length / RES_PER_PAGE)
                      }
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
