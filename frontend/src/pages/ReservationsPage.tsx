import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge, Button, Input, Select } from "../components/ui"
import { AppLayout, PageHeader } from "../components/layout"
import { SearchCard, ListItemCard, Banner, FormField } from "../components/composite"
import { Modal } from "../components/overlay"
import { librarianSidebarItems, memberSidebarItems } from "../config/sidebarConfig"

type ReservationStatus = "pending" | "ready" | "fulfilled" | "cancelled"

type Reservation = {
  id: string
  bookTitle: string
  bookAuthor: string
  isbn: string
  memberName: string
  memberId: string
  reservedOn: string
  expiresOn: string
  status: ReservationStatus
}

const librarianReservations: Reservation[] = [
  { id: "R001", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", isbn: "978-0132350884", memberName: "Alex Johnson", memberId: "M001", reservedOn: "Feb 28, 2026", expiresOn: "Mar 7, 2026", status: "ready" },
  { id: "R002", bookTitle: "Design Patterns", bookAuthor: "Erich Gamma et al.", isbn: "978-0201633610", memberName: "Maria Garcia", memberId: "M002", reservedOn: "Mar 1, 2026", expiresOn: "Mar 8, 2026", status: "pending" },
  { id: "R003", bookTitle: "The Pragmatic Programmer", bookAuthor: "David Thomas & Andrew Hunt", isbn: "978-0135957059", memberName: "James Wilson", memberId: "M003", reservedOn: "Mar 2, 2026", expiresOn: "Mar 9, 2026", status: "pending" },
  { id: "R004", bookTitle: "1984", bookAuthor: "George Orwell", isbn: "978-0451524935", memberName: "Emily Chen", memberId: "M004", reservedOn: "Feb 20, 2026", expiresOn: "Feb 27, 2026", status: "fulfilled" },
  { id: "R005", bookTitle: "The Great Gatsby", bookAuthor: "F. Scott Fitzgerald", isbn: "978-0743273565", memberName: "Robert Brown", memberId: "M005", reservedOn: "Feb 22, 2026", expiresOn: "Mar 1, 2026", status: "cancelled" },
  { id: "R006", bookTitle: "Introduction to Algorithms", bookAuthor: "Thomas H. Cormen et al.", isbn: "978-0262033848", memberName: "Sarah Davis", memberId: "M006", reservedOn: "Mar 3, 2026", expiresOn: "Mar 10, 2026", status: "ready" },
  { id: "R007", bookTitle: "A Brief History of Time", bookAuthor: "Stephen Hawking", isbn: "978-0553380163", memberName: "Alex Johnson", memberId: "M001", reservedOn: "Mar 4, 2026", expiresOn: "Mar 11, 2026", status: "pending" },
  { id: "R008", bookTitle: "Refactoring", bookAuthor: "Martin Fowler", isbn: "978-0134757599", memberName: "Maria Garcia", memberId: "M002", reservedOn: "Mar 5, 2026", expiresOn: "Mar 12, 2026", status: "pending" },
]

const memberReservations: Reservation[] = [
  { id: "R001", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", isbn: "978-0132350884", memberName: "Alex Johnson", memberId: "M001", reservedOn: "Feb 28, 2026", expiresOn: "Mar 7, 2026", status: "ready" },
  { id: "R007", bookTitle: "A Brief History of Time", bookAuthor: "Stephen Hawking", isbn: "978-0553380163", memberName: "Alex Johnson", memberId: "M001", reservedOn: "Mar 4, 2026", expiresOn: "Mar 11, 2026", status: "pending" },
  { id: "R009", bookTitle: "Algorithms", bookAuthor: "Robert Sedgewick", isbn: "978-0321573513", memberName: "Alex Johnson", memberId: "M001", reservedOn: "Feb 10, 2026", expiresOn: "Feb 17, 2026", status: "fulfilled" },
]

const statusBadgeVariant: Record<ReservationStatus, "available" | "issued" | "reserved" | "overdue" | "pending" | "ready"> = {
  pending: "pending",
  ready: "ready",
  fulfilled: "issued",
  cancelled: "overdue",
}

const statusLabel: Record<ReservationStatus, string> = {
  pending: "Pending",
  ready: "Ready for Pickup",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
}

export type ReservationsPageProps = {
  role?: "member" | "librarian"
}

export const ReservationsPage = ({ role = "member" }: ReservationsPageProps) => {
  const initialData = role === "librarian" ? librarianReservations : memberReservations
  const sidebarItems = role === "librarian" ? librarianSidebarItems : memberSidebarItems
  const topbarTitle = role === "librarian" ? "Reservations" : "My Reservations"

  const [reservations, setReservations] = useState<Reservation[]>(initialData)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null)
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newBookSearch, setNewBookSearch] = useState("")

  const filtered = reservations.filter((r) => {
    const query = search.toLowerCase()
    const matchesSearch =
      search.length < 2 ||
      r.bookTitle.toLowerCase().includes(query) ||
      r.bookAuthor.toLowerCase().includes(query) ||
      r.isbn.includes(query) ||
      r.memberName.toLowerCase().includes(query) ||
      r.memberId.toLowerCase().includes(query)
    const matchesStatus = !filterStatus || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleFulfill = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "fulfilled" as const } : r))
    )
    setSuccessMessage("Reservation fulfilled. The loan has been recorded.")
  }

  const handleMarkReady = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "ready" as const } : r))
    )
    setSuccessMessage("Member has been notified that the book is ready for pickup.")
  }

  const openCancel = (reservation: Reservation) => {
    setCancelTarget(reservation)
    setIsCancelOpen(true)
  }

  const handleConfirmCancel = () => {
    if (!cancelTarget) return
    setReservations((prev) =>
      prev.map((r) => (r.id === cancelTarget.id ? { ...r, status: "cancelled" as const } : r))
    )
    setSuccessMessage(`Reservation for "${cancelTarget.bookTitle}" has been cancelled.`)
    setCancelTarget(null)
    setIsCancelOpen(false)
  }

  const pendingCount = reservations.filter((r) => r.status === "pending").length
  const readyCount = reservations.filter((r) => r.status === "ready").length

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle={topbarTitle}>
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title={role === "librarian" ? "Reservations" : "My Reservations"}
          description={
            role === "librarian"
              ? "Manage all member book reservations"
              : "Track your book reservation requests"
          }
          action={
            <div className="flex items-center gap-3">
              {role === "member" ? (
                <Link to="/member/catalog">
                  <Button>Reserve a Book</Button>
                </Link>
              ) : null}
              <Link to={role === "librarian" ? "/librarian" : "/member"}>
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />

        {/* Success Banner */}
        {successMessage ? (
          <Banner
            title={successMessage}
            variant="success"
            onClose={() => setSuccessMessage(null)}
          />
        ) : null}

        {/* Ready for Pickup Banner (member only) */}
        {role === "member" && readyCount > 0 ? (
          <Banner
            title={`${readyCount} book${readyCount > 1 ? "s are" : " is"} ready for pickup!`}
            description="Please visit the library within the next 3 days to collect your reserved book(s)."
            variant="info"
          />
        ) : null}

        {/* Stats (librarian only) */}
        {role === "librarian" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total Reservations</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{reservations.length}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="mt-1 text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Ready for Pickup</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{readyCount}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Fulfilled (All Time)</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {reservations.filter((r) => r.status === "fulfilled").length}
              </p>
            </div>
          </div>
        ) : null}

        {/* Search & Filter */}
        <SearchCard
          title="Search Reservations"
          description={
            role === "librarian"
              ? "Filter by book title, author, member name, or ISBN"
              : "Filter by book title or author"
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input
                placeholder={
                  role === "librarian"
                    ? "Search by book title, author, ISBN, member name…"
                    : "Search by book title or author…"
                }
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
                  { label: "Pending", value: "pending" },
                  { label: "Ready for Pickup", value: "ready" },
                  { label: "Fulfilled", value: "fulfilled" },
                  { label: "Cancelled", value: "cancelled" },
                ]}
              />
            </div>
            <div className="flex items-end sm:col-span-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("")
                  setFilterStatus("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </SearchCard>

        {/* Results */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filtered.length}</span> reservation
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">No reservations found matching your criteria.</p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => {
                  setSearch("")
                  setFilterStatus("")
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((reservation) => (
                <ListItemCard
                  key={reservation.id}
                  title={
                    <span className="flex items-center gap-2">
                      {reservation.bookTitle}
                      <Badge
                        label={statusLabel[reservation.status]}
                        variant={statusBadgeVariant[reservation.status]}
                      />
                    </span>
                  }
                  subtitle={
                    role === "librarian"
                      ? `${reservation.bookAuthor} · ${reservation.isbn} · Member: ${reservation.memberName} (${reservation.memberId})`
                      : `${reservation.bookAuthor} · ${reservation.isbn}`
                  }
                  meta={`Reserved: ${reservation.reservedOn} · Expires: ${reservation.expiresOn} · ID: ${reservation.id}`}
                  action={
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {role === "librarian" ? (
                        <>
                          {reservation.status === "pending" ? (
                            <Button className="text-xs px-3 py-1.5" onClick={() => handleMarkReady(reservation.id)}>
                              Mark Ready
                            </Button>
                          ) : null}
                          {reservation.status === "ready" ? (
                            <Button className="text-xs px-3 py-1.5" onClick={() => handleFulfill(reservation.id)}>
                              Fulfill
                            </Button>
                          ) : null}
                          {(reservation.status === "pending" || reservation.status === "ready") ? (
                            <Button
                              className="text-xs px-3 py-1.5"
                              variant="secondary"
                              onClick={() => openCancel(reservation)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </>
                      ) : (
                        <>
                          {(reservation.status === "pending" || reservation.status === "ready") ? (
                            <Button
                              className="text-xs px-3 py-1.5"
                              variant="secondary"
                              onClick={() => openCancel(reservation)}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </>
                      )}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        open={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false)
          setCancelTarget(null)
        }}
        title="Cancel Reservation"
        primaryAction={<Button onClick={handleConfirmCancel}>Yes, Cancel</Button>}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel the reservation for{" "}
          <span className="font-semibold text-gray-900">
            {cancelTarget?.bookTitle}
          </span>
          {role === "librarian" && cancelTarget ? (
            <> by <span className="font-semibold text-gray-900">{cancelTarget.memberName}</span></>
          ) : null}
          ? This action cannot be undone.
        </p>
      </Modal>

      {/* Add Reservation Modal (librarian only) */}
      <Modal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="New Reservation"
        primaryAction={
          <Button
            onClick={() => {
              setIsAddOpen(false)
              setNewBookSearch("")
              setSuccessMessage("Reservation created successfully.")
            }}
          >
            Create Reservation
          </Button>
        }
      >
        <div className="space-y-4">
          <FormField label="Search Book" htmlFor="res-book" helperText="Search by title, author, or ISBN">
            <Input
              id="res-book"
              placeholder="e.g. Clean Code"
              value={newBookSearch}
              onChange={(e) => setNewBookSearch(e.target.value)}
            />
          </FormField>
          <FormField label="Member ID or Name" htmlFor="res-member">
            <Input id="res-member" placeholder="e.g. M001 or Alex Johnson" />
          </FormField>
        </div>
      </Modal>
    </AppLayout>
  )
}
