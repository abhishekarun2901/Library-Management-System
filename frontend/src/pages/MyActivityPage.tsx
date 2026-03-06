import { useState } from "react"
import type { ReactNode } from "react"
import { Badge } from "../components/ui"
import { AppLayout, PageHeader } from "../components/layout"
import { StatCard, DataTable, SearchCard } from "../components/composite"
import { memberSidebarItems } from "../config/sidebarConfig"
import { Bell, Calendar, Hash, Lock, Mail, Phone, Shield, User } from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type LoanStatus = "issued" | "overdue"
type ReservationStatus = "pending" | "ready" | "fulfilled" | "cancelled"
type HistoryType = "return" | "loan" | "reservation" | "fine"
type FineStatus = "unpaid" | "paid"

type Loan = { id: string; bookTitle: string; bookAuthor: string; borrowedDate: string; dueDate: string; status: LoanStatus }
type Reservation = { id: string; bookTitle: string; bookAuthor: string; reservedDate: string; availableDate: string | null; status: ReservationStatus }
type HistoryEntry = { id: string; event: string; detail: string; date: string; type: HistoryType }
type Fine = { id: string; bookTitle: string; bookAuthor: string; dueDate: string; daysOverdue: number; totalAmount: number; status: FineStatus }

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const loans: Loan[] = [
  { id: "L001", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", borrowedDate: "Feb 15, 2026", dueDate: "Mar 1, 2026", status: "overdue" },
  { id: "L002", bookTitle: "Design Patterns", bookAuthor: "Gang of Four", borrowedDate: "Feb 25, 2026", dueDate: "Mar 11, 2026", status: "issued" },
  { id: "L003", bookTitle: "The Pragmatic Programmer", bookAuthor: "David Thomas & Andrew Hunt", borrowedDate: "Mar 1, 2026", dueDate: "Mar 15, 2026", status: "issued" },
]

const reservations: Reservation[] = [
  { id: "R001", bookTitle: "Refactoring", bookAuthor: "Martin Fowler", reservedDate: "Mar 3, 2026", availableDate: null, status: "pending" },
  { id: "R002", bookTitle: "The Clean Coder", bookAuthor: "Robert C. Martin", reservedDate: "Mar 5, 2026", availableDate: "Mar 10, 2026", status: "ready" },
]

const history: HistoryEntry[] = [
  { id: "H001", event: "Book Returned", detail: "Introduction to Algorithms", date: "Feb 28, 2026", type: "return" },
  { id: "H002", event: "Book Reserved", detail: "Refactoring — Martin Fowler", date: "Mar 3, 2026", type: "reservation" },
  { id: "H003", event: "Fine Paid", detail: "$1.00 — The Great Gatsby", date: "Feb 20, 2026", type: "fine" },
  { id: "H004", event: "Book Borrowed", detail: "Clean Code — Robert C. Martin", date: "Feb 15, 2026", type: "loan" },
  { id: "H005", event: "Book Returned", detail: "The Great Gatsby — F. Scott Fitzgerald", date: "Nov 28, 2025", type: "return" },
  { id: "H006", event: "Book Borrowed", detail: "Introduction to Algorithms — Thomas H. Cormen et al.", date: "Nov 10, 2025", type: "loan" },
]

const memberFines: Fine[] = [
  { id: "F001", bookTitle: "Clean Code", bookAuthor: "Robert C. Martin", dueDate: "Feb 15, 2026", daysOverdue: 19, totalAmount: 4.75, status: "unpaid" },
  { id: "F005", bookTitle: "To Kill a Mockingbird", bookAuthor: "Harper Lee", dueDate: "Dec 15, 2025", daysOverdue: 3, totalAmount: 0.75, status: "paid" },
  { id: "F008", bookTitle: "The Great Gatsby", bookAuthor: "F. Scott Fitzgerald", dueDate: "Nov 24, 2025", daysOverdue: 4, totalAmount: 1.00, status: "paid" },
]

// ─────────────────────────────────────────────────────────────────────────────
// Badge maps
// ─────────────────────────────────────────────────────────────────────────────

const loanBadgeVariant: Record<LoanStatus, "overdue" | "issued"> = { issued: "issued", overdue: "overdue" }
const loanBadgeLabel: Record<LoanStatus, string> = { issued: "Issued", overdue: "Overdue" }

const resBadgeVariant: Record<ReservationStatus, "pending" | "available" | "issued" | "overdue"> = {
  pending: "pending", ready: "available", fulfilled: "issued", cancelled: "overdue",
}
const resBadgeLabel: Record<ReservationStatus, string> = {
  pending: "Pending", ready: "Ready to Pick Up", fulfilled: "Fulfilled", cancelled: "Cancelled",
}

const historyChipColor: Record<HistoryType, string> = {
  return: "bg-emerald-100 text-emerald-700",
  loan: "bg-indigo-100 text-indigo-700",
  reservation: "bg-gray-100 text-gray-700",
  fine: "bg-red-100 text-red-700",
}

const fineBadgeVariant: Record<FineStatus, "overdue" | "available"> = { unpaid: "overdue", paid: "available" }
const fineBadgeLabel: Record<FineStatus, string> = { unpaid: "Unpaid", paid: "Paid" }

// ─────────────────────────────────────────────────────────────────────────────
// Tab config
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "loans" | "reservations" | "history" | "fines" | "profile"

const tabs: { id: Tab; label: string; badge?: number }[] = [
  { id: "loans",        label: "My Loans",     badge: loans.length },
  { id: "reservations", label: "Reservations", badge: reservations.length },
  { id: "history",      label: "History",      badge: history.length },
  { id: "fines",        label: "Fines",        badge: memberFines.filter((f) => f.status === "unpaid").length },
  { id: "profile",      label: "My Profile" },
]

// ─────────────────────────────────────────────────────────────────────────────
// Profile sub-components
// ─────────────────────────────────────────────────────────────────────────────

const InfoRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="truncate text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
)

const SettingRow = ({ icon, label, description }: { icon: ReactNode; label: string; description: string }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">{icon}</div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────────────────

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
    <p className="text-gray-500">{message}</p>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export const MyActivityPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("loans")

  const totalUnpaid = memberFines.filter((f) => f.status === "unpaid").reduce((s, f) => s + f.totalAmount, 0)

  return (
    <AppLayout sidebarItems={memberSidebarItems} topbarTitle="My Activity">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="My Activity"
          description="Loans, reservations, history, fines, and your profile — all in one place"
        />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Active Loans"   value={String(loans.length)} />
          <StatCard label="Reservations"   value={String(reservations.length)} />
          <StatCard label="Books Returned" value="24" />
          <StatCard label="Outstanding"    value={`$${totalUnpaid.toFixed(2)}`} />
        </div>

        {/* Tab bar */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Loans tab ── */}
        {activeTab === "loans" && (
          loans.length === 0 ? <EmptyState message="You have no active loans." /> : (
            <DataTable
              headers={["Book", "Borrowed", "Due Date", "Status"]}
              rows={loans.map((loan) => [
                <div key="book">
                  <p className="font-medium text-gray-900">{loan.bookTitle}</p>
                  <p className="text-xs text-gray-500">{loan.bookAuthor}</p>
                </div>,
                <span key="borrowed" className="text-sm text-gray-600">{loan.borrowedDate}</span>,
                <span key="due" className={`text-sm font-medium ${loan.status === "overdue" ? "text-red-600" : "text-gray-900"}`}>
                  {loan.dueDate}
                </span>,
                <Badge key="status" label={loanBadgeLabel[loan.status]} variant={loanBadgeVariant[loan.status]} />,
              ])}
            />
          )
        )}

        {/* ── Reservations tab ── */}
        {activeTab === "reservations" && (
          reservations.length === 0 ? <EmptyState message="You have no active reservations." /> : (
            <DataTable
              headers={["Book", "Reserved On", "Available", "Status"]}
              rows={reservations.map((res) => [
                <div key="book">
                  <p className="font-medium text-gray-900">{res.bookTitle}</p>
                  <p className="text-xs text-gray-500">{res.bookAuthor}</p>
                </div>,
                <span key="reserved" className="text-sm text-gray-600">{res.reservedDate}</span>,
                <span key="available" className="text-sm text-gray-600">{res.availableDate ?? "—"}</span>,
                <Badge key="status" label={resBadgeLabel[res.status]} variant={resBadgeVariant[res.status]} />,
              ])}
            />
          )
        )}

        {/* ── History tab ── */}
        {activeTab === "history" && (
          history.length === 0 ? <EmptyState message="No activity recorded yet." /> : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="divide-y divide-gray-100">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-4 px-5 py-4">
                    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${historyChipColor[entry.type]}`}>
                      {entry.event}
                    </span>
                    <p className="flex-1 text-sm text-gray-900">{entry.detail}</p>
                    <p className="shrink-0 text-xs text-gray-500">{entry.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* ── Fines tab ── */}
        {activeTab === "fines" && (
          <div className="space-y-4">
            {totalUnpaid > 0 && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                You have <span className="font-semibold">${totalUnpaid.toFixed(2)}</span> in outstanding fines. Please clear them to continue borrowing.
              </div>
            )}
            {memberFines.length === 0 ? <EmptyState message="You have no fines." /> : (
              <DataTable
                headers={["Book", "Due Date", "Days Overdue", "Amount", "Status"]}
                rows={memberFines.map((fine) => [
                  <div key="book">
                    <p className="font-medium text-gray-900">{fine.bookTitle}</p>
                    <p className="text-xs text-gray-500">{fine.bookAuthor}</p>
                  </div>,
                  <span key="due" className="text-sm">{fine.dueDate}</span>,
                  <span key="days" className="font-medium text-red-600">{fine.daysOverdue}d</span>,
                  <span key="amount" className="font-semibold text-gray-900">${fine.totalAmount.toFixed(2)}</span>,
                  <Badge key="status" label={fineBadgeLabel[fine.status]} variant={fineBadgeVariant[fine.status]} />,
                ])}
              />
            )}
          </div>
        )}

        {/* ── Profile tab ── */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Profile hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-6 text-white shadow-lg">
              <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/5" />
              <div className="absolute -bottom-8 right-20 h-32 w-32 rounded-full bg-purple-400/20" />
              <div className="relative flex items-center gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold ring-2 ring-white/30">
                  AJ
                </div>
                <div>
                  <h2 className="text-xl font-bold">Alex Johnson</h2>
                  <p className="text-sm text-indigo-200">member@booking.com</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">ID: M001</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/30 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      Active Member
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info sections */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SearchCard title="Personal Information" description="Your account details on file">
                <div className="divide-y divide-gray-100">
                  <InfoRow icon={<User className="h-4 w-4" />}     label="Full Name"    value="Alex Johnson" />
                  <InfoRow icon={<Mail className="h-4 w-4" />}     label="Email"        value="member@booking.com" />
                  <InfoRow icon={<Phone className="h-4 w-4" />}    label="Phone"        value="+1 (555) 234-5678" />
                  <InfoRow icon={<Hash className="h-4 w-4" />}     label="Member ID"    value="M001" />
                  <InfoRow icon={<Calendar className="h-4 w-4" />} label="Member Since" value="January 15, 2024" />
                </div>
              </SearchCard>

              <SearchCard title="Account Settings" description="Notification and privacy preferences">
                <div className="divide-y divide-gray-100">
                  <SettingRow icon={<Bell className="h-4 w-4" />}   label="Email Notifications" description="Receive reminders for due dates and updates" />
                  <SettingRow icon={<Bell className="h-4 w-4" />}   label="Overdue Alerts"       description="Get notified when a book is past its due date" />
                  <SettingRow icon={<Lock className="h-4 w-4" />}   label="Password"             description="Last changed 3 months ago" />
                  <SettingRow icon={<Shield className="h-4 w-4" />} label="Privacy"              description="Control visibility of your reading history" />
                </div>
              </SearchCard>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

