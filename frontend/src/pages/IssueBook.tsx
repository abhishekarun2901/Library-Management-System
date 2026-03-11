import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Input } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import { FormField, Banner, ListItemCard } from '../components/composite'
import { librarianSidebarItems as sidebarItems } from '../config/sidebarConfig'

const dummyMembers = [
  {
    id: 'M001',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    activeLoans: 2,
  },
  {
    id: 'M002',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    activeLoans: 0,
  },
  {
    id: 'M003',
    name: 'James Wilson',
    email: 'james@example.com',
    activeLoans: 4,
  },
]

const dummyBooks = [
  {
    id: 'B001',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    available: 3,
  },
  {
    id: 'B002',
    title: 'The Pragmatic Programmer',
    author: 'David Thomas',
    isbn: '978-0135957059',
    available: 1,
  },
  {
    id: 'B003',
    title: 'Design Patterns',
    author: 'Gang of Four',
    isbn: '978-0201633610',
    available: 0,
  },
  {
    id: 'B004',
    title: 'Refactoring',
    author: 'Martin Fowler',
    isbn: '978-0134757599',
    available: 5,
  },
]

export const IssueBook = () => {
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState<
    (typeof dummyMembers)[0] | null
  >(null)
  const [bookSearch, setBookSearch] = useState('')
  const [selectedBook, setSelectedBook] = useState<
    (typeof dummyBooks)[0] | null
  >(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const filteredMembers =
    memberSearch.length >= 2
      ? dummyMembers.filter(
          (m) =>
            m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.id.toLowerCase().includes(memberSearch.toLowerCase()) ||
            m.email.toLowerCase().includes(memberSearch.toLowerCase())
        )
      : []

  const filteredBooks =
    bookSearch.length >= 2
      ? dummyBooks.filter(
          (b) =>
            b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
            b.isbn.includes(bookSearch) ||
            b.author.toLowerCase().includes(bookSearch.toLowerCase())
        )
      : []

  const handleIssue = () => {
    if (selectedMember && selectedBook) {
      setShowSuccess(true)
      setSelectedMember(null)
      setSelectedBook(null)
      setMemberSearch('')
      setBookSearch('')
    }
  }

  const canIssue = selectedMember && selectedBook && selectedBook.available > 0

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Issue Books">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="Issue a Book"
          description="Search for a member and a book to create a new loan"
          action={
            <Link to="/librarian/catalog">
              <Button variant="secondary">Browse Catalog</Button>
            </Link>
          }
        />

        {/* Success Banner */}
        {showSuccess ? (
          <Banner
            title="Book issued successfully!"
            description="The loan has been recorded. The member will be notified via email."
            variant="info"
            onClose={() => setShowSuccess(false)}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Member Selection */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              1. Select Member
            </h3>

            <FormField
              label="Search Member"
              htmlFor="member-search"
              helperText="Search by name, ID, or email (min 2 characters)"
            >
              <Input
                id="member-search"
                placeholder="e.g. Alex Johnson or M001"
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value)
                  setSelectedMember(null)
                }}
              />
            </FormField>

            {/* Member Search Results */}
            {filteredMembers.length > 0 && !selectedMember ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {filteredMembers.length} member(s) found
                </p>
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setSelectedMember(member)
                      setMemberSearch(member.name)
                    }}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {member.activeLoans} active loans
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Selected Member Card */}
            {selectedMember ? (
              <div className="mt-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedMember.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedMember.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {selectedMember.activeLoans} active loans
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMember(null)
                      setMemberSearch('')
                    }}
                    className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Book Selection */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              2. Select Book
            </h3>

            <FormField
              label="Search Book"
              htmlFor="book-search"
              helperText="Search by title, author, or ISBN (min 2 characters)"
            >
              <Input
                id="book-search"
                placeholder="e.g. Clean Code or 978-0132350884"
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value)
                  setSelectedBook(null)
                }}
              />
            </FormField>

            {/* Book Search Results */}
            {filteredBooks.length > 0 && !selectedBook ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {filteredBooks.length} book(s) found
                </p>
                {filteredBooks.map((book) => (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => {
                      if (book.available > 0) {
                        setSelectedBook(book)
                        setBookSearch(book.title)
                      }
                    }}
                    disabled={book.available === 0}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      book.available === 0
                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60'
                        : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {book.title}
                        </p>
                        <p className="text-sm text-gray-500">{book.author}</p>
                        <p className="text-xs text-gray-400">
                          ISBN: {book.isbn}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          label={
                            book.available > 0
                              ? `${book.available} available`
                              : 'Unavailable'
                          }
                          variant={book.available > 0 ? 'available' : 'overdue'}
                        />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Selected Book Card */}
            {selectedBook ? (
              <div className="mt-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedBook.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedBook.author}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      ISBN: {selectedBook.isbn} · {selectedBook.available}{' '}
                      copies available
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBook(null)
                      setBookSearch('')
                    }}
                    className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Confirm & Issue */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            3. Confirm & Issue
          </h3>

          {canIssue ? (
            <div className="mb-4 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Member</span>
                <span className="font-medium text-gray-900">
                  {selectedMember.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Book</span>
                <span className="font-medium text-gray-900">
                  {selectedBook.title}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Author</span>
                <span className="font-medium text-gray-900">
                  {selectedBook.author}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ISBN</span>
                <span className="font-medium text-gray-900">
                  {selectedBook.isbn}
                </span>
              </div>
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-500">
              Please select a member and an available book above to issue.
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              disabled={!canIssue}
              onClick={handleIssue}
            >
              Issue Book
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedMember(null)
                setSelectedBook(null)
                setMemberSearch('')
                setBookSearch('')
                setShowSuccess(false)
              }}
            >
              Clear Form
            </Button>
          </div>
        </div>

        {/* Recent Issues */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Issues
          </h3>
          <div className="space-y-3">
            <ListItemCard
              title="The Pragmatic Programmer"
              subtitle="Issued to Maria Garcia (M002)"
              action={<Badge label="Active" variant="issued" />}
            />
            <ListItemCard
              title="Clean Code"
              subtitle="Issued to Alex Johnson (M001)"
              action={<Badge label="Due Mar 1" variant="overdue" />}
            />
            <ListItemCard
              title="Design Patterns"
              subtitle="Issued to James Wilson (M003)"
              action={<Badge label="Returned" variant="available" />}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
