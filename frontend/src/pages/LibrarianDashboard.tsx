import { Button } from "../components/ui"
import { AppLayout } from "../components/layout"
import { PageHeader } from "../components/layout"
import { StatCard, SearchCard, QuickActionTile } from "../components/composite"
import { librarianSidebarItems as sidebarItems } from "../config/sidebarConfig"

export const LibrarianDashboard = () => {
  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Librarian Dashboard">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="Welcome back, Sarah"
          description="Here's your library management overview"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Books"
            value="2,847"
            className="border-gray-200 bg-white shadow-sm"
          />
          <StatCard
            label="Active Members"
            value="1,243"
            className="border-gray-200 bg-white shadow-sm"
          />
          <StatCard
            label="Books on Loan"
            value="487"
            className="border-gray-200 bg-white shadow-sm"
          />
          <StatCard
            label="Pending Returns"
            value="23"
            className="border-gray-200 bg-white shadow-sm"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <QuickActionTile
              title="Issue Book"
              description="Issue a book to a member"
              href="/librarian/issue"
            />
            <QuickActionTile
              title="Browse Catalog"
              description="Search the book catalog"
              href="/librarian/catalog"
            />
            <QuickActionTile
              title="Add Book"
              description="Add a new book to the library"
              href="/librarian/books"
            />
            <QuickActionTile
              title="Register Member"
              description="Register a new library member"
              href="/librarian/members"
            />
            <QuickActionTile
              title="Manage Returns"
              description="Process book returns"
            />
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Loans */}
          <div className="lg:col-span-2">
            <SearchCard
              title="Recent Book Loans"
              description="Track recent loan transactions"
              className="border-gray-200 bg-white shadow-sm"
            >
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">The Great Gatsby</p>
                      <p className="text-sm text-gray-600">Loaned to John Doe</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Mar 5, 2026</p>
                      <p className="text-xs text-gray-600">Due: Mar 19, 2026</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button variant="secondary" className="w-full">
                  View All Loans
                </Button>
              </div>
            </SearchCard>
          </div>

          {/* Pending Actions */}
          <div>
            <SearchCard
              title="Pending Actions"
              className="border-gray-200 bg-white shadow-sm"
            >
              <div className="space-y-3">
                <div className="rounded-lg bg-amber-50 p-3 text-sm">
                  <p className="font-medium text-amber-900">5 Overdue Returns</p>
                  <p className="text-xs text-amber-700">Action required</p>
                </div>
                <div className="rounded-lg bg-indigo-50 p-3 text-sm">
                  <p className="font-medium text-indigo-900">12 Pending Requests</p>
                  <p className="text-xs text-indigo-700">Awaiting approval</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-sm">
                  <p className="font-medium text-green-900">Ready for Pickup</p>
                  <p className="text-xs text-green-700">3 books reserved</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
                <Button variant="secondary" className="w-full text-sm">
                  Review Overdue
                </Button>
                <Button className="w-full text-sm">
                  Process Requests
                </Button>
              </div>
            </SearchCard>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
