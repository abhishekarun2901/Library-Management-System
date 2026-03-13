import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  Badge,
  Button,
  SearchInput,
  SearchableSelect,
  Select,
} from '../components/ui'
import { AppLayout } from '../components/layout'
import { PageHeader } from '../components/layout'
import { SearchCard, ListItemCard, Banner } from '../components/composite'
import {
  librarianSidebarItems,
  memberSidebarItems,
} from '../config/sidebarConfig'
import {
  getBooks,
  getCategories,
  type BookResponse,
} from '../services/bookService'
import {
  createReservation,
  getReservations,
} from '../services/reservationService'
import { getCurrentUser } from '../services/userService'

export type BookCatalogProps = {
  role?: 'member' | 'librarian'
}

const ITEMS_PER_PAGE = 8

export const BookCatalog = ({ role = 'member' }: BookCatalogProps) => {
  const { isAuthenticated } = useAuthStore()
  const sidebarItems =
    role === 'librarian' ? librarianSidebarItems : memberSidebarItems
  const topbarTitle =
    role === 'librarian' ? 'Librarian – Catalog Search' : 'Browse Catalog'

  const [books, setBooks] = useState<BookResponse[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [searchInput, setSearchInput] = useState('')
  const [filterGenre, setFilterGenre] = useState('')
  const [sortBy, setSortBy] = useState('')

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [reservingId, setReservingId] = useState<string | null>(null)
  const [reserveSuccess, setReserveSuccess] = useState<string | null>(null)
  const [reserveError, setReserveError] = useState<string | null>(null)
  const [myActiveBookIds, setMyActiveBookIds] = useState<Set<string>>(new Set())
  const [genreOptions, setGenreOptions] = useState<
    { label: string; value: string }[]
  >([])

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const genreDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchDebounced = (
    value: string,
    category = filterGenre,
    sort = sortBy
  ) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1)
      fetchBooks(1, value, category, sort)
    }, 350)
  }

  useEffect(() => {
    if (!isAuthenticated) return
    getReservations()
      .then((rvs) =>
        setMyActiveBookIds(
          new Set(rvs.filter((r) => r.status === 'active').map((r) => r.bookId))
        )
      )
      .catch(console.error)
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    getCurrentUser()
      .then((u) => setCurrentUserId(u.userId))
      .catch(console.error)
  }, [isAuthenticated])

  const fetchBooks = (
    page: number,
    search = searchInput,
    category = filterGenre,
    sort = sortBy
  ) => {
    setLoading(true)
    getBooks({
      search: search || undefined,
      category: category || undefined,
      page: page - 1,
      size: ITEMS_PER_PAGE,
      sortBy: sort || undefined,
    })
      .then((data) => {
        setBooks(data.content)
        setTotalElements(data.totalElements)
        setTotalPages(Math.max(1, data.totalPages))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchBooks(1)
  }, [])

  useEffect(() => {
    getCategories()
      .then((cats) =>
        setGenreOptions(cats.map((c) => ({ label: c, value: c })))
      )
      .catch(console.error)
  }, [])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchBooks(1)
  }

  const handleReserve = async (book: BookResponse) => {
    if (!currentUserId) return

    // AC-1: Guard on the client side too — block when no available copies.
    if ((book.trueAvailableStock ?? 0) <= 0) {
      setReserveError(
        `No available copies for "${book.title}". Reservation not allowed.`
      )
      return
    }

    setReservingId(book.bookId)
    setReserveError(null)
    try {
      await createReservation(currentUserId, book.bookId)
      setMyActiveBookIds((prev) => new Set([...prev, book.bookId]))
      setReserveSuccess(`"${book.title}" has been reserved!`)
    } catch (e: unknown) {
      setReserveError(
        e instanceof Error ? e.message : 'Failed to reserve book.'
      )
    } finally {
      setReservingId(null)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchBooks(page)
  }

  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalElements)

  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    pages.push(1)
    if (currentPage > 4) pages.push('...')
    const rs = Math.max(2, currentPage - 2)
    const re = Math.min(totalPages - 1, currentPage + 2)
    for (let i = rs; i <= re; i++) pages.push(i)
    if (currentPage < totalPages - 3) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle={topbarTitle}>
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title="Book Catalog"
          description="Search and discover books available in the library"
          action={
            role === 'librarian' ? (
              <Link to="/librarian/books">
                <Button>Manage Books</Button>
              </Link>
            ) : null
          }
        />

        {reserveSuccess && (
          <Banner
            title={reserveSuccess}
            variant="success"
            onClose={() => setReserveSuccess(null)}
          />
        )}
        {reserveError && (
          <Banner
            title={reserveError}
            variant="danger"
            onClose={() => setReserveError(null)}
          />
        )}

        <SearchCard
          title="Search Books"
          description="Find books by title, author, or genre"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              className="flex-1"
              placeholder="Search by title or author…"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                handleSearchDebounced(e.target.value)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onClear={() => {
                setSearchInput('')
                setCurrentPage(1)
                fetchBooks(1, '', filterGenre, sortBy)
              }}
            />
            <SearchableSelect
              className="sm:w-52"
              placeholder="All Genres"
              value={filterGenre}
              options={genreOptions}
              onChange={(val) => {
                setFilterGenre(val)
                setCurrentPage(1)
                if (genreDebounceRef.current)
                  clearTimeout(genreDebounceRef.current)
                genreDebounceRef.current = setTimeout(
                  () => fetchBooks(1, searchInput, val, sortBy),
                  350
                )
              }}
            />
          </div>
        </SearchCard>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? (
              'Loading…'
            ) : (
              <>
                Showing{' '}
                <span className="font-medium text-gray-900">
                  {totalElements === 0 ? 0 : startItem}–{endItem}
                </span>{' '}
                of{' '}
                <span className="font-medium text-gray-900">
                  {totalElements.toLocaleString()}
                </span>{' '}
                books
              </>
            )}
          </p>
          <Select
            className="w-40"
            placeholder="Sort by"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              setCurrentPage(1)
              fetchBooks(1, searchInput, filterGenre, e.target.value)
            }}
            options={[
              { label: 'Title A–Z', value: 'title' },
              { label: 'Newest First', value: 'createdAt' },
            ]}
          />
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-gray-500">
            Loading books…
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => {
              const isAvailable = (book.trueAvailableStock ?? 0) > 0
              return (
                <ListItemCard
                  key={book.bookId}
                  title={book.title}
                  subtitle={`${book.authors?.join(', ') ?? '—'} · ${book.categories?.join(', ') ?? '—'}`}
                  meta={`${book.publisher ?? ''}${book.publishDate ? ` · ${book.publishDate.slice(0, 4)}` : ''}`}
                  action={
                    <div className="flex items-center gap-3">
                      <Badge
                        label={isAvailable ? 'Available' : 'Unavailable'}
                        variant={isAvailable ? 'available' : 'issued'}
                      />
                      {role === 'member' && isAvailable ? (
                        <div className="flex items-center gap-2">
                          {myActiveBookIds.has(book.bookId) ? (
                            <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                              Already Reserved
                            </span>
                          ) : (
                            <Button
                              className="text-xs"
                              disabled={
                                reservingId === book.bookId || !currentUserId
                              }
                              onClick={() => handleReserve(book)}
                            >
                              {reservingId === book.bookId
                                ? 'Reserving…'
                                : 'Reserve'}
                            </Button>
                          )}
                        </div>
                      ) : role === 'member' && !isAvailable ? (
                        <span className="text-xs text-gray-400 italic">
                          No copies available
                        </span>
                      ) : null}
                    </div>
                  }
                />
              )
            })}
            {books.length === 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-500">
                  No books found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-1 border-t border-gray-200 pt-4">
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ← Previous
            </Button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-sm text-gray-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${currentPage === page ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  {page}
                </button>
              )
            )}
            <Button
              variant="secondary"
              className="px-3 py-1.5 text-xs"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
