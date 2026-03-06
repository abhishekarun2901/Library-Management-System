import { Link } from "react-router-dom"
import { Badge, Button, Input, Select } from "../components/ui"
import { AppLayout } from "../components/layout"
import { PageHeader } from "../components/layout"
import { SearchCard, ListItemCard } from "../components/composite"
import { librarianSidebarItems, memberSidebarItems } from "../config/sidebarConfig"

export type BookCatalogProps = {
  role?: "member" | "librarian"
}

const mockBooks = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", genre: "Software", status: "available" as const },
  { id: 2, title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", genre: "Software", status: "issued" as const },
  { id: 3, title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt", isbn: "978-0135957059", genre: "Software", status: "available" as const },
  { id: 4, title: "Refactoring", author: "Martin Fowler", isbn: "978-0134757599", genre: "Software", status: "reserved" as const },
  { id: 5, title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", genre: "Fiction", status: "available" as const },
  { id: 6, title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", genre: "Fiction", status: "issued" as const },
  { id: 7, title: "1984", author: "George Orwell", isbn: "978-0451524935", genre: "Fiction", status: "available" as const },
  { id: 8, title: "Algorithms", author: "Robert Sedgewick", isbn: "978-0321573513", genre: "Computer Science", status: "available" as const },
]

const statusVariant: Record<string, "available" | "issued" | "reserved"> = {
  available: "available",
  issued: "issued",
  reserved: "reserved",
}

export const BookCatalog = ({ role = "member" }: BookCatalogProps) => {
  const sidebarItems = role === "librarian" ? librarianSidebarItems : memberSidebarItems
  const topbarTitle = role === "librarian" ? "Librarian – Catalog Search" : "Browse Catalog"

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle={topbarTitle}>
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="Book Catalog"
          description="Search and discover books available in the library"
          action={
            <div className="flex items-center gap-3">
              {role === "librarian" ? (
                <Link to="/librarian/issue">
                  <Button>Issue Book</Button>
                </Link>
              ) : null}
              <Link to={role === "librarian" ? "/librarian" : "/member"}>
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />

        {/* Search & Filters */}
        <SearchCard
          title="Search Books"
          description="Find books by title, author, ISBN, or genre"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <Input
                placeholder="Search by title, author, or ISBN..."
                type="search"
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                placeholder="All Genres"
                options={[
                  { label: "Fiction", value: "fiction" },
                  { label: "Software", value: "software" },
                  { label: "Computer Science", value: "cs" },
                  { label: "Science", value: "science" },
                  { label: "History", value: "history" },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Select
                placeholder="All Status"
                options={[
                  { label: "Available", value: "available" },
                  { label: "Issued", value: "issued" },
                  { label: "Reserved", value: "reserved" },
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Button className="w-full">Search</Button>
            </div>
          </div>
        </SearchCard>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">8</span> of{" "}
            <span className="font-medium text-gray-900">2,847</span> books
          </p>
          <Select
            className="w-40"
            placeholder="Sort by"
            options={[
              { label: "Title A–Z", value: "title-asc" },
              { label: "Title Z–A", value: "title-desc" },
              { label: "Author A–Z", value: "author-asc" },
              { label: "Newest First", value: "newest" },
            ]}
          />
        </div>

        {/* Book List */}
        <div className="space-y-3">
          {mockBooks.map((book) => (
            <ListItemCard
              key={book.id}
              title={book.title}
              subtitle={`${book.author} · ISBN: ${book.isbn}`}
              meta={`Genre: ${book.genre}`}
              action={
                <div className="flex items-center gap-3">
                  <Badge
                    label={book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    variant={statusVariant[book.status]}
                  />
                  {book.status === "available" ? (
                    <Button className="text-xs">Reserve</Button>
                  ) : null}
                </div>
              }
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">Page 1 of 285</p>
          <div className="flex gap-2">
            <Button variant="secondary" disabled>
              Previous
            </Button>
            <Button variant="secondary">Next</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
