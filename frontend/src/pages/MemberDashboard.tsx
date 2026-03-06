import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge, Button } from "../components/ui"
import { AppLayout } from "../components/layout"
import { PageHeader } from "../components/layout"
import { StatCard, SearchCard, ListItemCard, QuickActionTile, Banner } from "../components/composite"
import { memberSidebarItems as sidebarItems } from "../config/sidebarConfig"

export const MemberDashboard = () => {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Member Dashboard">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="Welcome back, Alex"
          description="Here's an overview of your library activity"
        />

        {/* Overdue Banner */}
        {showBanner ? (
          <div>
            <Banner
              title="You have 1 overdue book"
              description="Please return 'Clean Code' by Mar 1, 2026 to avoid additional fines."
              variant="warning"
              onClose={() => setShowBanner(false)}
            />
          </div>
        ) : null}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Books Borrowed" value="3" />
          <StatCard label="Active Reservations" value="1" />
          <StatCard label="Books Returned" value="24" />
          <StatCard label="Outstanding Fines" value="$2.50" />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickActionTile
              title="Browse Catalog"
              description="Search and discover books"
              href="/member/catalog"
            />
            <QuickActionTile
              title="My Activity"
              description="Loans, reservations & history"
              href="/member/activity"
            />
            <QuickActionTile
              title="Reserve a Book"
              description="Place a reservation request"
              href="/member/catalog"
            />
            <QuickActionTile
              title="Pay Fines"
              description="Clear outstanding balances"
              href="/member/activity"
            />
          </div>
        </div>

        {/* Current Loans & Reservations */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Current Loans */}
          <div className="lg:col-span-2">
            <SearchCard
              title="Current Loans"
              description="Books you currently have checked out"
            >
              <div className="space-y-3">
                <ListItemCard
                  title="Clean Code"
                  subtitle="Robert C. Martin"
                  meta="Borrowed: Feb 15, 2026"
                  action={<Badge label="Overdue" variant="overdue" />}
                />
                <ListItemCard
                  title="Design Patterns"
                  subtitle="Gang of Four"
                  meta="Borrowed: Feb 25, 2026 · Due: Mar 11, 2026"
                  action={<Badge label="Issued" variant="issued" />}
                />
                <ListItemCard
                  title="The Pragmatic Programmer"
                  subtitle="David Thomas & Andrew Hunt"
                  meta="Borrowed: Mar 1, 2026 · Due: Mar 15, 2026"
                  action={<Badge label="Issued" variant="issued" />}
                />
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Link to="/member/activity">
                  <Button variant="secondary" className="w-full">
                    View All Loans
                  </Button>
                </Link>
              </div>
            </SearchCard>
          </div>

          {/* Sidebar Panel */}
          <div className="space-y-6">
            {/* Reservations */}
            <SearchCard title="Reservations">
              <div className="space-y-3">
                <ListItemCard
                  title="Refactoring"
                  subtitle="Martin Fowler"
                  meta="Reserved: Mar 3, 2026"
                  action={<Badge label="Pending" variant="pending" />}
                />
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Link to="/member/activity">
                  <Button variant="secondary" className="w-full text-sm">
                    View All Reservations
                  </Button>
                </Link>
              </div>
            </SearchCard>

            {/* Recent Activity */}
            <SearchCard title="Recent Activity">
              <div className="space-y-3">
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-gray-900">Returned "Algorithms"</p>
                  <p className="text-xs text-gray-600">Feb 28, 2026</p>
                </div>
                <div className="border-b border-gray-200 pb-3">
                  <p className="text-sm font-medium text-gray-900">Reserved "Refactoring"</p>
                  <p className="text-xs text-gray-600">Mar 3, 2026</p>
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-gray-900">Paid fine — $1.00</p>
                  <p className="text-xs text-gray-600">Feb 20, 2026</p>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Link to="/member/activity">
                  <Button variant="secondary" className="w-full text-sm">
                    View Full History
                  </Button>
                </Link>
              </div>
            </SearchCard>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
