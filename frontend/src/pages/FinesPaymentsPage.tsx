import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge, Button, Input, Select } from "../components/ui"
import { AppLayout, PageHeader } from "../components/layout"
import { SearchCard, Banner, DataTable } from "../components/composite"
import { librarianSidebarItems, memberSidebarItems } from "../config/sidebarConfig"

type FineStatus = "unpaid" | "paid"

type Fine = {
  id: string
  bookTitle: string
  bookAuthor: string
  isbn: string
  memberName: string
  memberId: string
  issuedDate: string
  dueDate: string
  returnedDate: string | null
  daysOverdue: number
  finePerDay: number
  totalAmount: number
  status: FineStatus
}

const librarianFines: Fine[] = [
  { id: "F001", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", isbn: "978-0132350884", memberName: "Alex Johnson", memberId: "M001", issuedDate: "Feb 1, 2026", dueDate: "Feb 15, 2026", returnedDate: null, daysOverdue: 19, finePerDay: 0.25, totalAmount: 4.75, status: "unpaid" },
  { id: "F002", bookTitle: "Design Patterns", bookAuthor: "Erich Gamma et al.", isbn: "978-0201633610", memberName: "James Wilson", memberId: "M003", issuedDate: "Jan 20, 2026", dueDate: "Feb 3, 2026", returnedDate: "Feb 10, 2026", daysOverdue: 7, finePerDay: 0.25, totalAmount: 1.75, status: "paid" },
  { id: "F003", bookTitle: "The Pragmatic Programmer", bookAuthor: "David Thomas & Andrew Hunt", isbn: "978-0135957059", memberName: "Emily Chen", memberId: "M004", issuedDate: "Jan 10, 2026", dueDate: "Jan 24, 2026", returnedDate: "Feb 5, 2026", daysOverdue: 12, finePerDay: 0.25, totalAmount: 3.00, status: "paid" },
  { id: "F004", bookTitle: "1984", bookAuthor: "George Orwell", isbn: "978-0451524935", memberName: "Sarah Davis", memberId: "M006", issuedDate: "Feb 5, 2026", dueDate: "Feb 19, 2026", returnedDate: null, daysOverdue: 15, finePerDay: 0.25, totalAmount: 3.75, status: "unpaid" },
  { id: "F005", bookTitle: "To Kill a Mockingbird", bookAuthor: "Harper Lee", isbn: "978-0061120084", memberName: "Alex Johnson", memberId: "M001", issuedDate: "Dec 1, 2025", dueDate: "Dec 15, 2025", returnedDate: "Dec 18, 2025", daysOverdue: 3, finePerDay: 0.25, totalAmount: 0.75, status: "paid" },
  { id: "F006", bookTitle: "Refactoring", bookAuthor: "Martin Fowler", isbn: "978-0134757599", memberName: "James Wilson", memberId: "M003", issuedDate: "Feb 10, 2026", dueDate: "Feb 24, 2026", returnedDate: null, daysOverdue: 10, finePerDay: 0.25, totalAmount: 2.50, status: "unpaid" },
  { id: "F007", bookTitle: "Introduction to Algorithms", bookAuthor: "Thomas H. Cormen et al.", isbn: "978-0262033848", memberName: "Maria Garcia", memberId: "M002", issuedDate: "Jan 15, 2026", dueDate: "Jan 29, 2026", returnedDate: "Feb 1, 2026", daysOverdue: 3, finePerDay: 0.25, totalAmount: 0.75, status: "paid" },
]

const memberFines: Fine[] = [
  { id: "F001", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", isbn: "978-0132350884", memberName: "Alex Johnson", memberId: "M001", issuedDate: "Feb 1, 2026", dueDate: "Feb 15, 2026", returnedDate: null, daysOverdue: 19, finePerDay: 0.25, totalAmount: 4.75, status: "unpaid" },
  { id: "F005", bookTitle: "To Kill a Mockingbird", bookAuthor: "Harper Lee", isbn: "978-0061120084", memberName: "Alex Johnson", memberId: "M001", issuedDate: "Dec 1, 2025", dueDate: "Dec 15, 2025", returnedDate: "Dec 18, 2025", daysOverdue: 3, finePerDay: 0.25, totalAmount: 0.75, status: "paid" },
  { id: "F008", bookTitle: "The Great Gatsby", bookAuthor: "F. Scott Fitzgerald", isbn: "978-0743273565", memberName: "Alex Johnson", memberId: "M001", issuedDate: "Nov 10, 2025", dueDate: "Nov 24, 2025", returnedDate: "Nov 28, 2025", daysOverdue: 4, finePerDay: 0.25, totalAmount: 1.00, status: "paid" },
]

const statusBadgeVariant: Record<FineStatus, "overdue" | "available"> = {
  unpaid: "overdue",
  paid: "available",
}

const statusLabel: Record<FineStatus, string> = {
  unpaid: "Unpaid",
  paid: "Paid",
}

export type FinesPaymentsPageProps = {
  role?: "member" | "librarian"
}

export const FinesPaymentsPage = ({ role = "member" }: FinesPaymentsPageProps) => {
  const initialData = role === "librarian" ? librarianFines : memberFines
  const sidebarItems = role === "librarian" ? librarianSidebarItems : memberSidebarItems
  const topbarTitle = role === "librarian" ? "Fines & Payments" : "My Fines"

  const fines = initialData
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const filtered = fines.filter((f) => {
    const query = search.toLowerCase()
    const matchesSearch =
      search.length < 2 ||
      f.bookTitle.toLowerCase().includes(query) ||
      f.bookAuthor.toLowerCase().includes(query) ||
      f.memberName.toLowerCase().includes(query) ||
      f.memberId.toLowerCase().includes(query) ||
      f.id.toLowerCase().includes(query)
    const matchesStatus = !filterStatus || f.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalUnpaid = fines
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + f.totalAmount, 0)

  const totalCollected = fines
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.totalAmount, 0)

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle={topbarTitle}>
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title={role === "librarian" ? "Fines & Payments" : "My Fines & Payments"}
          description={
            role === "librarian"
              ? "Track and manage overdue fines across all members"
              : "View and pay your outstanding library fines"
          }
          action={
            <Link to={role === "librarian" ? "/librarian" : "/member"}>
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          }
        />

        {/* Outstanding Balance Banner (member only) */}
        {role === "member" && totalUnpaid > 0 ? (
          <Banner
            title={`You have $${totalUnpaid.toFixed(2)} in outstanding fines.`}
            description="Please pay your fines to continue borrowing books without restrictions."
            variant="warning"
          />
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Fines</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{fines.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Outstanding</p>
            <p className="mt-1 text-2xl font-bold text-red-600">
              ${totalUnpaid.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{role === "librarian" ? "Collected" : "Paid"}</p>
            <p className="mt-1 text-2xl font-bold text-green-600">
              ${totalCollected.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Unpaid Fines</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {fines.filter((f) => f.status === "unpaid").length}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <SearchCard
          title="Search Fines"
          description={
            role === "librarian"
              ? "Filter by book title, member name, or fine ID"
              : "Filter by book title or fine ID"
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-6">
              <Input
                placeholder={
                  role === "librarian"
                    ? "Search by book title, member name, or fine ID…"
                    : "Search by book title or fine ID…"
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
                  { label: "Unpaid", value: "unpaid" },
                  { label: "Paid", value: "paid" },
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

        {/* Fines Table */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{filtered.length}</span> fine
              {filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
              <p className="text-gray-500">No fines found matching your criteria.</p>
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
            <DataTable
              headers={
                role === "librarian"
                  ? ["Book", "Member", "Due Date", "Days Overdue", "Amount", "Status"]
                  : ["Book", "Due Date", "Days Overdue", "Amount", "Status"]
              }
              rows={filtered.map((fine) =>
                role === "librarian"
                  ? [
                      <div key="book">
                        <p className="font-medium text-gray-900">{fine.bookTitle}</p>
                        <p className="text-xs text-gray-500">{fine.bookAuthor}</p>
                      </div>,
                      <div key="member">
                        <p className="font-medium text-gray-900">{fine.memberName}</p>
                        <p className="text-xs text-gray-500">{fine.memberId}</p>
                      </div>,
                      <span key="due" className="text-sm">{fine.dueDate}</span>,
                      <span key="days" className="font-medium text-red-600">{fine.daysOverdue}d</span>,
                      <span key="amount" className="font-semibold text-gray-900">${fine.totalAmount.toFixed(2)}</span>,
                      <Badge key="status" label={statusLabel[fine.status]} variant={statusBadgeVariant[fine.status]} />,
                    ]
                  : [
                      <div key="book">
                        <p className="font-medium text-gray-900">{fine.bookTitle}</p>
                        <p className="text-xs text-gray-500">{fine.bookAuthor}</p>
                      </div>,
                      <span key="due" className="text-sm">{fine.dueDate}</span>,
                      <span key="days" className="font-medium text-red-600">{fine.daysOverdue}d</span>,
                      <span key="amount" className="font-semibold text-gray-900">${fine.totalAmount.toFixed(2)}</span>,
                      <Badge key="status" label={statusLabel[fine.status]} variant={statusBadgeVariant[fine.status]} />,
                    ]
              )}
            />
          )}
        </div>
      </div>

    </AppLayout>
  )
}
