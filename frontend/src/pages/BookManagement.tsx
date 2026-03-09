import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Badge, Button, Input, Select, Textarea } from '../components/ui'
import { AppLayout, PageHeader } from '../components/layout'
import {
  FormField,
  SearchCard,
  ListItemCard,
  Banner,
} from '../components/composite'
import { Modal } from '../components/overlay'
import { librarianSidebarItems as sidebarItems } from '../config/sidebarConfig'
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getCopies,
  createCopy,
  updateCopyStatus,
  deleteCopy,
  type BookResponse,
  type CopyResponse,
} from '../services/bookService'
import { getUsers, type UserResponse } from '../services/userService'
import {
  issueBook,
  returnBook,
  getTransactions,
  type TransactionResponse,
} from '../services/transactionService'
import { getReports, type ReportResponse } from '../services/reportService'

type Tab = 'manage' | 'issue'

const emptyForm = {
  title: '',
  author: '',
  category: '',
  publisherName: '',
  publishDate: '',
  description: '',
}

const ITEMS_PER_PAGE = 6

const XIcon = () => (
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
)

type PaginationProps = {
  currentPage: number
  totalPages: number
  onChange: (p: number) => void
}
const Pagination = ({ currentPage, totalPages, onChange }: PaginationProps) => {
  const pages: (number | 'ellipsis')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 4) pages.push('ellipsis')
    const s = Math.max(2, currentPage - 2),
      e = Math.min(totalPages - 1, currentPage + 2)
    for (let i = s; i <= e; i++) pages.push(i)
    if (currentPage < totalPages - 3) pages.push('ellipsis')
    pages.push(totalPages)
  }
  return (
    <div className="flex items-center justify-end gap-1 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
        >
          ← Previous
        </Button>
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e${idx}`} className="px-2 text-sm text-gray-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={`min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${currentPage === p ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {p}
            </button>
          )
        )}
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-xs"
          disabled={currentPage === totalPages}
          onClick={() => onChange(currentPage + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  )
}

const fmtDate = (d: string | null | undefined) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

export const BookManagement = () => {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('manage')
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  // Manage tab state
  const [books, setBooks] = useState<BookResponse[]>([])
  const [catalogTotal, setCatalogTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [manPage, setManPage] = useState(0)
  const [manSearch, setManSearch] = useState('')
  const [manFilterGenre, setManFilterGenre] = useState('')
  const [manLoading, setManLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookResponse | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  // Delete book state
  const [deleteTarget, setDeleteTarget] = useState<BookResponse | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Copy management state
  const [copiesBook, setCopiesBook] = useState<BookResponse | null>(null)
  const [isCopiesOpen, setIsCopiesOpen] = useState(false)
  const [managedCopies, setManagedCopies] = useState<CopyResponse[]>([])
  const [copiesManageLoading, setCopiesManageLoading] = useState(false)
  const [addingCopy, setAddingCopy] = useState(false)
  const [deletingCopyId, setDeletingCopyId] = useState<string | null>(null)

  // Return book state
  const [returningId, setReturningId] = useState<string | null>(null)

  // Global stats
  const [reportData, setReportData] = useState<ReportResponse | null>(null)
  const [allTx, setAllTx] = useState<TransactionResponse[]>([])
  const [genreOptions, setGenreOptions] = useState<
    { label: string; value: string }[]
  >([])
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Issue tab state
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState<UserResponse[]>([])
  const [memberSearchLoading, setMemberSearchLoading] = useState(false)
  const [selectedMember, setSelectedMember] = useState<UserResponse | null>(
    null
  )
  const [issueBookSearch, setIssueBookSearch] = useState('')
  const [issueBookResults, setIssueBookResults] = useState<BookResponse[]>([])
  const [issueBookLoading, setIssueBookLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null)
  const [selectedCopy, setSelectedCopy] = useState<CopyResponse | null>(null)
  const [copies, setCopies] = useState<CopyResponse[]>([])
  const [copiesLoading, setCopiesLoading] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [showIssueSuccess, setShowIssueSuccess] = useState(false)
  const [recentTx, setRecentTx] = useState<TransactionResponse[]>([])

  // Load books
  const loadBooks = (
    page: number,
    search = manSearch,
    genre = manFilterGenre
  ) => {
    if (!token) return
    setManLoading(true)
    getBooks(
      { page, size: ITEMS_PER_PAGE, title: search, category: genre },
      token
    )
      .then((data) => {
        setBooks(data.content)
        setTotalPages(Math.max(1, data.totalPages))
      })
      .catch(console.error)
      .finally(() => setManLoading(false))
  }

  const refreshCatalogTotal = () => {
    if (!token) return
    getBooks({ page: 0, size: 1 }, token)
      .then((data) => setCatalogTotal(data.totalElements))
      .catch(console.error)
  }

  useEffect(() => {
    loadBooks(manPage)
    refreshCatalogTotal()
  }, [token])

  useEffect(() => {
    if (!token) return
    getReports(token)
      .then((data) => {
        setReportData(data)
      })
      .catch(console.error)
  }, [token])

  const refreshReports = () => {
    if (!token) return
    getReports(token).then(setReportData).catch(console.error)
  }

  useEffect(() => {
    if (!token) return
    getBooks({ page: 0, size: 1000 }, token)
      .then((data) => {
        const cats = Array.from(
          new Set(data.content.flatMap((b) => b.categories ?? []))
        )
          .sort()
          .map((c) => ({ label: c, value: c }))
        setGenreOptions(cats)
      })
      .catch(console.error)
  }, [token])

  useEffect(() => {
    if (!token) return
    getTransactions(token)
      .then((txs) => {
        setAllTx(txs)
        setRecentTx(
          [...txs]
            .sort((a, b) =>
              (b.checkout_date ?? '').localeCompare(a.checkout_date ?? '')
            )
            .slice(0, 5)
        )
      })
      .catch(console.error)
  }, [token])

  const handlePageChange = (p: number) => {
    const page = p - 1
    setManPage(page)
    loadBooks(page)
  }

  const handleSearch = () => {
    setManPage(0)
    loadBooks(0, manSearch, manFilterGenre)
  }

  const handleSearchDebounced = (value: string, genre = manFilterGenre) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setManPage(0)
      loadBooks(0, value, genre)
    }, 400)
  }

  const handleClearSearch = () => {
    setManSearch('')
    setManFilterGenre('')
    setManPage(0)
    loadBooks(0, '', '')
  }

  const handleAdd = async () => {
    if (!token) return
    setSaving(true)
    try {
      await createBook(
        {
          title: form.title,
          authorNames: form.author ? [form.author] : undefined,
          categories: form.category ? [form.category] : undefined,
          publisherName: form.publisherName || undefined,
          publishDate: form.publishDate || undefined,
          description: form.description || undefined,
        },
        token
      )
      setShowSuccess(`"${form.title}" has been added to the catalog.`)
      setForm(emptyForm)
      setIsAddOpen(false)
      loadBooks(0)
      refreshCatalogTotal()
    } catch {
      setShowSuccess('Failed to add book.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!token || !editingBook) return
    setSaving(true)
    try {
      await updateBook(
        editingBook.bookId,
        {
          title: form.title,
          authorNames: form.author ? [form.author] : undefined,
          categories: form.category ? [form.category] : undefined,
          publisherName: form.publisherName || undefined,
        },
        token
      )
      setShowSuccess(`"${form.title}" has been updated.`)
      setForm(emptyForm)
      setEditingBook(null)
      setIsEditOpen(false)
      loadBooks(manPage)
    } catch {
      setShowSuccess('Failed to update book.')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (book: BookResponse) => {
    setEditingBook(book)
    setForm({
      title: book.title,
      author: book.authors?.[0] ?? '',
      category: book.categories?.[0] ?? '',
      publisherName: book.publisher ?? '',
      publishDate: book.publishDate ?? '',
      description: book.description ?? '',
    })
    setIsEditOpen(true)
  }

  const openDeleteBook = (book: BookResponse) => {
    setDeleteTarget(book)
    setIsDeleteOpen(true)
  }

  const handleDeleteBook = async () => {
    if (!token || !deleteTarget) return
    setDeleting(true)
    try {
      await deleteBook(deleteTarget.bookId, token)

      setShowSuccess(`"${deleteTarget.title}" has been deleted.`)
      setIsDeleteOpen(false)

      // Remove book from list immediately
      setBooks((prev) => prev.filter((b) => b.bookId !== deleteTarget.bookId))
      refreshCatalogTotal()

      // Adjust stats without a re-fetch
      refreshReports()

      // Refresh transactions list (issued transactions for this book are now gone)
      getTransactions(token)
        .then((txs) => {
          setAllTx(txs)
          setRecentTx(
            [...txs]
              .sort((a, b) =>
                (b.checkout_date ?? '').localeCompare(a.checkout_date ?? '')
              )
              .slice(0, 5)
          )
        })
        .catch(console.error)

      setDeleteTarget(null)
    } catch {
      setShowSuccess('Failed to delete book.')
    } finally {
      setDeleting(false)
    }
  }

  const openCopies = async (book: BookResponse) => {
    setCopiesBook(book)
    setIsCopiesOpen(true)
    setCopiesManageLoading(true)
    try {
      const c = await getCopies(book.bookId, token!)
      setManagedCopies(c)
    } catch {
      setManagedCopies([])
    } finally {
      setCopiesManageLoading(false)
    }
  }

  const handleAddCopy = async () => {
    if (!token || !copiesBook) return
    setAddingCopy(true)
    try {
      const c = await createCopy(copiesBook.bookId, token)
      setManagedCopies((prev) => [...prev, c])
      loadBooks(manPage)
      refreshReports()
    } catch {
      setShowSuccess('Failed to add copy.')
    } finally {
      setAddingCopy(false)
    }
  }

  const handleMarkCopyLost = async (copy: CopyResponse) => {
    if (!token) return
    try {
      const updated = await updateCopyStatus(copy.copyId, 'LOST', token)
      setManagedCopies((prev) =>
        prev.map((c) => (c.copyId === copy.copyId ? updated : c))
      )
      loadBooks(manPage)
      refreshReports()
    } catch {
      setShowSuccess('Failed to update copy status.')
    }
  }

  const handleMarkCopyFound = async (copy: CopyResponse) => {
    if (!token) return
    try {
      const updated = await updateCopyStatus(copy.copyId, 'AVAILABLE', token)
      setManagedCopies((prev) =>
        prev.map((c) => (c.copyId === copy.copyId ? updated : c))
      )
      loadBooks(manPage)
      refreshReports()
      setShowSuccess('Copy marked as available.')
    } catch {
      setShowSuccess('Failed to update copy status.')
    }
  }

  const handleDeleteCopy = async (copy: CopyResponse) => {
    if (!token) return
    setDeletingCopyId(copy.copyId)
    try {
      await deleteCopy(copy.copyId, token)
      setManagedCopies((prev) => prev.filter((c) => c.copyId !== copy.copyId))
      loadBooks(manPage)
      refreshReports()
      setShowSuccess('Copy deleted.')
    } catch (e: unknown) {
      setShowSuccess(e instanceof Error ? e.message : 'Failed to delete copy.')
    } finally {
      setDeletingCopyId(null)
    }
  }

  const handleReturnBook = async (tx: TransactionResponse) => {
    if (!token || returningId) return
    setReturningId(tx.transactionId)
    try {
      await returnBook(tx.transactionId, token)
      setRecentTx((prev) =>
        prev.map((t) =>
          t.transactionId === tx.transactionId
            ? { ...t, status: 'returned' }
            : t
        )
      )
      // Increment available stock for the book this copy belongs to
      setBooks((prev) =>
        prev.map((b) =>
          b.title === tx.bookTitle
            ? { ...b, trueAvailableStock: (b.trueAvailableStock ?? 0) + 1 }
            : b
        )
      )
      setShowSuccess('Book returned successfully.')
    } catch (e: unknown) {
      setShowSuccess(e instanceof Error ? e.message : 'Failed to return book.')
    } finally {
      setReturningId(null)
    }
  }

  // Member search for issue tab (debounced via button)
  const handleMemberSearch = async () => {
    if (!token || memberSearch.length < 2) return
    setMemberSearchLoading(true)
    try {
      const data = await getUsers({ page: 0, size: 10 }, token)
      setMemberResults(
        data.content.filter(
          (u) =>
            u.fullName.toLowerCase().includes(memberSearch.toLowerCase()) ||
            u.email.toLowerCase().includes(memberSearch.toLowerCase())
        )
      )
    } catch {
      setMemberResults([])
    } finally {
      setMemberSearchLoading(false)
    }
  }

  // Book search for issue tab
  const handleIssueBookSearch = async () => {
    if (!token || issueBookSearch.length < 2) return
    setIssueBookLoading(true)
    try {
      const data = await getBooks({ title: issueBookSearch, size: 10 }, token)
      setIssueBookResults(data.content)
    } catch {
      setIssueBookResults([])
    } finally {
      setIssueBookLoading(false)
    }
  }

  // Load copies when book selected
  const handleSelectBook = async (book: BookResponse) => {
    setSelectedBook(book)
    setIssueBookSearch(book.title)
    setIssueBookResults([])
    setSelectedCopy(null)
    if (!token) return
    setCopiesLoading(true)
    try {
      const c = await getCopies(book.bookId, token)
      const available = c.filter((copy) => copy.status === 'AVAILABLE')
      setCopies(available)
      if (available.length > 0) setSelectedCopy(available[0])
    } catch {
      setCopies([])
    } finally {
      setCopiesLoading(false)
    }
  }

  const handleIssue = async () => {
    if (!selectedMember || !selectedCopy || !token) return
    setIssuing(true)
    try {
      await issueBook(
        { userId: selectedMember.userId, copyId: selectedCopy.copyId },
        token
      )
      setShowIssueSuccess(true)
      setSelectedMember(null)
      setSelectedBook(null)
      setSelectedCopy(null)
      setCopies([])
      setMemberSearch('')
      setIssueBookSearch('')
      // Refresh recent transactions
      getTransactions(token)
        .then((txs) => {
          setAllTx(txs)
          setRecentTx(
            [...txs]
              .sort((a, b) =>
                (b.checkout_date ?? '').localeCompare(a.checkout_date ?? '')
              )
              .slice(0, 5)
          )
        })
        .catch(console.error)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to issue book.'
      setShowSuccess(msg)
    } finally {
      setIssuing(false)
    }
  }

  const clearIssueForm = () => {
    setSelectedMember(null)
    setSelectedBook(null)
    setSelectedCopy(null)
    setCopies([])
    setMemberSearch('')
    setIssueBookSearch('')
    setMemberResults([])
    setIssueBookResults([])
    setShowIssueSuccess(false)
  }

  const isFormValid =
    form.title.trim() !== '' &&
    form.author.trim() !== '' &&
    form.category.trim() !== ''
  const canIssue = selectedMember !== null && selectedCopy !== null && !issuing

  const bookFormFields = (
    <div className="space-y-4">
      <FormField label="Title" htmlFor="book-title" required>
        <Input
          id="book-title"
          placeholder="e.g. Clean Code"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Author" htmlFor="book-author" required>
          <Input
            id="book-author"
            placeholder="e.g. Robert C. Martin"
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
          />
        </FormField>
        <FormField label="Category" htmlFor="book-genre" required>
          <Select
            id="book-genre"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Select genre"
            options={genreOptions}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Publisher" htmlFor="book-publisher">
          <Input
            id="book-publisher"
            placeholder="e.g. Prentice Hall"
            value={form.publisherName}
            onChange={(e) =>
              setForm({ ...form, publisherName: e.target.value })
            }
          />
        </FormField>
        <FormField label="Publish Date" htmlFor="book-date">
          <Input
            id="book-date"
            type="date"
            value={form.publishDate}
            onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Description" htmlFor="book-description">
        <Textarea
          id="book-description"
          placeholder="Brief description of the book..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />
      </FormField>
    </div>
  )

  const tabs: { id: Tab; label: string }[] = [
    { id: 'manage', label: 'Manage Books' },
    { id: 'issue', label: 'Issue Book' },
  ]

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Books">
      <div className="w-full space-y-6 p-6 pb-10">
        <PageHeader
          title="Books"
          description="Browse the catalog, manage inventory, and issue books to members"
          action={
            <Link to="/librarian">
              <Button variant="secondary">Back to Dashboard</Button>
            </Link>
          }
        />

        {showSuccess && (
          <Banner
            title={showSuccess}
            variant="success"
            onClose={() => setShowSuccess(null)}
          />
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(() => {
            const issuedCount = allTx.filter(
              (t) => t.status === 'issued' || t.status === 'overdue'
            ).length
            const totalCopies = reportData?.totalInventory ?? 0
            const lostCount = reportData?.lostCount ?? 0
            const availableCopies = Math.max(
              0,
              totalCopies - issuedCount - lostCount
            )
            return [
              {
                label: 'Total Books',
                value: String(catalogTotal),
                color: 'text-gray-900',
                title: 'Unique titles in the catalog',
              },
              {
                label: 'Available Copies',
                value: totalCopies ? String(availableCopies) : '—',
                color: 'text-green-600',
                title: 'Copies on shelf across all books',
              },
              {
                label: 'Currently Out',
                value: String(issuedCount),
                color: 'text-indigo-600',
                title: 'Copies currently issued to members',
              },
              {
                label: 'Lost Copies',
                value: reportData !== null ? String(lostCount) : '—',
                color: 'text-red-500',
                title: 'Copies marked as lost',
              },
            ].map(({ label, value, color, title }) => (
              <div
                key={label}
                title={title}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`mt-1 text-2xl font-semibold ${color}`}>
                  {value}
                </p>
              </div>
            ))
          })()}
        </div>

        <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'manage' && (
          <>
            <SearchCard
              title="Book Inventory"
              description="Add, edit, and manage the book catalog"
              action={
                <Button
                  onClick={() => {
                    setForm(emptyForm)
                    setIsAddOpen(true)
                  }}
                >
                  Add Book
                </Button>
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                <div className="sm:col-span-5">
                  <Input
                    placeholder="Search by title…"
                    type="search"
                    value={manSearch}
                    onChange={(e) => {
                      setManSearch(e.target.value)
                      handleSearchDebounced(e.target.value)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="sm:col-span-4">
                  <Select
                    placeholder="All Genres"
                    value={manFilterGenre}
                    onChange={(e) => {
                      setManFilterGenre(e.target.value)
                      handleSearchDebounced(manSearch, e.target.value)
                    }}
                    options={[
                      { label: 'All Genres', value: '' },
                      ...genreOptions,
                    ]}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleClearSearch}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </SearchCard>

            {manLoading ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Loading books…
              </div>
            ) : (
              <div className="space-y-3">
                {books.map((book) => (
                  <ListItemCard
                    key={book.bookId}
                    title={book.title}
                    subtitle={`${book.authors?.join(', ') ?? '—'} · ${book.categories?.join(', ') ?? '—'}`}
                    meta={`${book.trueAvailableStock ?? 0} available copies · ${book.publisher ?? ''}`}
                    action={
                      <div className="flex items-center gap-2">
                        <Badge
                          label={
                            (book.trueAvailableStock ?? 0) > 0
                              ? 'Available'
                              : 'Unavailable'
                          }
                          variant={
                            (book.trueAvailableStock ?? 0) > 0
                              ? 'available'
                              : 'issued'
                          }
                        />
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => openCopies(book)}
                        >
                          Copies
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs"
                          onClick={() => openEdit(book)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="text-xs text-red-600 hover:text-red-700"
                          onClick={() => openDeleteBook(book)}
                        >
                          Delete
                        </Button>
                      </div>
                    }
                  />
                ))}
                {books.length === 0 && (
                  <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                    <p className="text-gray-500">
                      No books found matching your criteria.
                    </p>
                  </div>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={manPage + 1}
                totalPages={totalPages}
                onChange={handlePageChange}
              />
            )}
          </>
        )}

        {activeTab === 'issue' && (
          <>
            {showIssueSuccess && (
              <Banner
                title="Book issued successfully! The loan has been recorded."
                variant="success"
                onClose={() => setShowIssueSuccess(false)}
              />
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Member select */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  1. Select Member
                </h3>
                <FormField
                  label="Search Member"
                  htmlFor="member-search"
                  helperText="Search by name or email, then click Search"
                >
                  <div className="flex gap-2">
                    <Input
                      id="member-search"
                      placeholder="e.g. Alex Johnson"
                      value={memberSearch}
                      onChange={(e) => {
                        setMemberSearch(e.target.value)
                        setSelectedMember(null)
                      }}
                    />
                    <Button
                      onClick={handleMemberSearch}
                      disabled={memberSearchLoading || memberSearch.length < 2}
                    >
                      {memberSearchLoading ? '…' : 'Search'}
                    </Button>
                  </div>
                </FormField>
                {memberResults.length > 0 && !selectedMember && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {memberResults.length} member(s) found
                    </p>
                    {memberResults.map((m) => (
                      <button
                        key={m.userId}
                        type="button"
                        onClick={() => {
                          setSelectedMember(m)
                          setMemberSearch(m.fullName)
                          setMemberResults([])
                        }}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                      >
                        <p className="font-medium text-gray-900">
                          {m.fullName}
                        </p>
                        <p className="text-sm text-gray-500">{m.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                {selectedMember && (
                  <div className="mt-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedMember.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedMember.email}
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
                        <XIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Book select */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  2. Select Book
                </h3>
                <FormField
                  label="Search Book"
                  htmlFor="issue-book-search"
                  helperText="Search by title, then click Search"
                >
                  <div className="flex gap-2">
                    <Input
                      id="issue-book-search"
                      placeholder="e.g. Clean Code"
                      value={issueBookSearch}
                      onChange={(e) => {
                        setIssueBookSearch(e.target.value)
                        setSelectedBook(null)
                        setSelectedCopy(null)
                      }}
                    />
                    <Button
                      onClick={handleIssueBookSearch}
                      disabled={issueBookLoading || issueBookSearch.length < 2}
                    >
                      {issueBookLoading ? '…' : 'Search'}
                    </Button>
                  </div>
                </FormField>
                {issueBookResults.length > 0 && !selectedBook && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {issueBookResults.length} book(s) found
                    </p>
                    {issueBookResults.map((b) => (
                      <button
                        key={b.bookId}
                        type="button"
                        onClick={() => {
                          if ((b.trueAvailableStock ?? 0) > 0)
                            handleSelectBook(b)
                        }}
                        disabled={(b.trueAvailableStock ?? 0) === 0}
                        className={`w-full rounded-lg border p-3 text-left transition ${(b.trueAvailableStock ?? 0) === 0 ? 'cursor-not-allowed border-gray-200 bg-gray-100 opacity-60' : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {b.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {b.authors?.join(', ')}
                            </p>
                          </div>
                          <Badge
                            label={
                              (b.trueAvailableStock ?? 0) > 0
                                ? `${b.trueAvailableStock} available`
                                : 'Unavailable'
                            }
                            variant={
                              (b.trueAvailableStock ?? 0) > 0
                                ? 'available'
                                : 'overdue'
                            }
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedBook && (
                  <div className="mt-4 rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedBook.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedBook.authors?.join(', ')}
                        </p>
                        {copiesLoading ? (
                          <p className="mt-1 text-xs text-gray-500">
                            Loading copies…
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-gray-500">
                            {copies.length} available cop
                            {copies.length === 1 ? 'y' : 'ies'}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBook(null)
                          setIssueBookSearch('')
                          setSelectedCopy(null)
                          setCopies([])
                        }}
                        className="rounded-md p-1 text-gray-400 hover:bg-white hover:text-gray-600"
                      >
                        <XIcon />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Confirm & Issue */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                3. Confirm &amp; Issue
              </h3>
              {canIssue ? (
                <div className="mb-4 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  {[
                    { label: 'Member', value: selectedMember!.fullName },
                    { label: 'Email', value: selectedMember!.email },
                    { label: 'Book', value: selectedBook!.title },
                    {
                      label: 'Copy ID',
                      value: selectedCopy!.copyId.slice(0, 8) + '…',
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-4 text-sm text-gray-500">
                  Please select a member and an available book above to proceed.
                </p>
              )}
              <div className="flex items-center gap-3">
                <Button disabled={!canIssue} onClick={handleIssue}>
                  {issuing ? 'Issuing…' : 'Issue Book'}
                </Button>
                <Button variant="secondary" onClick={clearIssueForm}>
                  Clear Form
                </Button>
              </div>
            </div>

            {/* Recent Issues */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Issues
              </h3>
              {recentTx.length === 0 ? (
                <p className="text-sm text-gray-500">No recent transactions.</p>
              ) : (
                <div className="space-y-3">
                  {recentTx.map((tx) => (
                    <ListItemCard
                      key={tx.transactionId}
                      title={tx.bookTitle ?? 'Unknown Book'}
                      subtitle={`Issued ${fmtDate(tx.checkout_date)} · Due ${fmtDate(tx.due_date)}`}
                      action={
                        <div className="flex items-center gap-2">
                          <Badge
                            label={
                              tx.status.charAt(0).toUpperCase() +
                              tx.status.slice(1)
                            }
                            variant={
                              tx.status === 'returned'
                                ? 'available'
                                : tx.status === 'overdue'
                                  ? 'overdue'
                                  : 'issued'
                            }
                          />
                          {(tx.status === 'issued' ||
                            tx.status === 'overdue') && (
                            <Button
                              variant="secondary"
                              className="text-xs"
                              disabled={returningId === tx.transactionId}
                              onClick={() => handleReturnBook(tx)}
                            >
                              {returningId === tx.transactionId
                                ? '…'
                                : 'Return'}
                            </Button>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        open={isAddOpen}
        title="Add New Book"
        onClose={() => {
          setIsAddOpen(false)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleAdd} disabled={!isFormValid || saving}>
            {saving ? 'Saving…' : 'Add Book'}
          </Button>
        }
      >
        {bookFormFields}
      </Modal>

      <Modal
        open={isEditOpen}
        title="Edit Book"
        onClose={() => {
          setIsEditOpen(false)
          setEditingBook(null)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleEdit} disabled={!isFormValid || saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        }
      >
        {editingBook ? <div className="space-y-4">{bookFormFields}</div> : null}
      </Modal>

      <Modal
        open={isDeleteOpen}
        title="Delete Book"
        onClose={() => {
          setIsDeleteOpen(false)
          setDeleteTarget(null)
        }}
        primaryAction={
          <Button
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            onClick={handleDeleteBook}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete Book'}
          </Button>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">
            "{deleteTarget?.title}"
          </span>
          ? This will remove the book and all its copies. This action cannot be
          undone.
        </p>
      </Modal>

      <Modal
        open={isCopiesOpen}
        title={`Copies — ${copiesBook?.title ?? ''}`}
        onClose={() => {
          setIsCopiesOpen(false)
          setCopiesBook(null)
          setManagedCopies([])
        }}
        primaryAction={
          <Button onClick={handleAddCopy} disabled={addingCopy}>
            {addingCopy ? 'Adding…' : 'Add Copy'}
          </Button>
        }
      >
        {copiesManageLoading ? (
          <p className="py-4 text-center text-sm text-gray-500">
            Loading copies…
          </p>
        ) : (
          <div className="space-y-2">
            {managedCopies.map((c) => (
              <div
                key={c.copyId}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div className="space-y-1">
                  <p className="font-mono text-xs text-gray-500">
                    {c.copyId.slice(0, 8)}…
                  </p>
                  <Badge
                    label={c.status}
                    variant={
                      c.status === 'AVAILABLE'
                        ? 'available'
                        : c.status === 'ISSUED'
                          ? 'issued'
                          : 'overdue'
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  {c.status === 'AVAILABLE' && (
                    <Button
                      variant="secondary"
                      className="text-xs"
                      onClick={() => handleMarkCopyLost(c)}
                    >
                      Mark Lost
                    </Button>
                  )}
                  {c.status === 'LOST' && (
                    <Button
                      variant="secondary"
                      className="text-xs text-green-700 hover:bg-green-50"
                      onClick={() => handleMarkCopyFound(c)}
                    >
                      Mark Found
                    </Button>
                  )}
                  {c.status !== 'ISSUED' && (
                    <Button
                      variant="secondary"
                      className="text-xs text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteCopy(c)}
                      disabled={deletingCopyId === c.copyId}
                    >
                      {deletingCopyId === c.copyId ? '…' : 'Delete'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {managedCopies.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                No copies found for this book. Add one above.
              </p>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  )
}
