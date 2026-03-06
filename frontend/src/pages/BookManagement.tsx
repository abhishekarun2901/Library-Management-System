import { useState } from "react"
import { Link } from "react-router-dom"
import { Badge, Button, Input, Select, Textarea } from "../components/ui"
import { AppLayout, PageHeader } from "../components/layout"
import { FormField, SearchCard, ListItemCard, Banner } from "../components/composite"
import { Modal } from "../components/overlay"
import { librarianSidebarItems as sidebarItems } from "../config/sidebarConfig"

type Book = {
  id: string
  title: string
  author: string
  isbn: string
  genre: string
  status: "available" | "issued" | "reserved"
  totalCopies: number
  availableCopies: number
  publishedYear: number
  publisher: string
}

const initialBooks: Book[] = [
  { id: "B001", title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", genre: "Software Engineering", status: "available", totalCopies: 5, availableCopies: 3, publishedYear: 2008, publisher: "Prentice Hall" },
  { id: "B002", title: "Design Patterns", author: "Erich Gamma et al.", isbn: "978-0201633610", genre: "Software Engineering", status: "issued", totalCopies: 3, availableCopies: 0, publishedYear: 1994, publisher: "Addison-Wesley" },
  { id: "B003", title: "The Pragmatic Programmer", author: "David Thomas & Andrew Hunt", isbn: "978-0135957059", genre: "Software Engineering", status: "available", totalCopies: 4, availableCopies: 2, publishedYear: 2019, publisher: "Addison-Wesley" },
  { id: "B004", title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "978-0743273565", genre: "Fiction", status: "available", totalCopies: 6, availableCopies: 5, publishedYear: 1925, publisher: "Scribner" },
  { id: "B005", title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "978-0061120084", genre: "Fiction", status: "issued", totalCopies: 4, availableCopies: 1, publishedYear: 1960, publisher: "J.B. Lippincott & Co." },
  { id: "B006", title: "1984", author: "George Orwell", isbn: "978-0451524935", genre: "Fiction", status: "available", totalCopies: 7, availableCopies: 6, publishedYear: 1949, publisher: "Secker & Warburg" },
  { id: "B007", title: "Introduction to Algorithms", author: "Thomas H. Cormen et al.", isbn: "978-0262033848", genre: "Computer Science", status: "reserved", totalCopies: 3, availableCopies: 1, publishedYear: 2009, publisher: "MIT Press" },
  { id: "B008", title: "A Brief History of Time", author: "Stephen Hawking", isbn: "978-0553380163", genre: "Science", status: "available", totalCopies: 2, availableCopies: 2, publishedYear: 1988, publisher: "Bantam Books" },
]

const statusBadgeVariant: Record<string, "available" | "issued" | "reserved"> = {
  available: "available",
  issued: "issued",
  reserved: "reserved",
}

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  genre: "",
  publisher: "",
  publishedYear: "",
  totalCopies: "1",
  description: "",
}

export const BookManagement = () => {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterGenre, setFilterGenre] = useState("")

  // Modal state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [showSuccess, setShowSuccess] = useState<string | null>(null)

  const genres = [...new Set(books.map((b) => b.genre))].sort()

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      search.length < 2 ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || b.status === filterStatus
    const matchesGenre = !filterGenre || b.genre === filterGenre
    return matchesSearch && matchesStatus && matchesGenre
  })

  const handleAdd = () => {
    const newBook: Book = {
      id: `B${String(books.length + 1).padStart(3, "0")}`,
      title: form.title,
      author: form.author,
      isbn: form.isbn,
      genre: form.genre,
      publisher: form.publisher,
      publishedYear: parseInt(form.publishedYear) || new Date().getFullYear(),
      totalCopies: parseInt(form.totalCopies) || 1,
      availableCopies: parseInt(form.totalCopies) || 1,
      status: "available",
    }
    setBooks([newBook, ...books])
    setForm(emptyForm)
    setIsAddOpen(false)
    setShowSuccess(`Book "${newBook.title}" added successfully.`)
  }

  const handleEdit = () => {
    if (!editingBook) return
    setBooks(
      books.map((b) =>
        b.id === editingBook.id
          ? {
              ...b,
              title: form.title,
              author: form.author,
              isbn: form.isbn,
              genre: form.genre,
              publisher: form.publisher,
              publishedYear: parseInt(form.publishedYear) || b.publishedYear,
              totalCopies: parseInt(form.totalCopies) || b.totalCopies,
            }
          : b
      )
    )
    setForm(emptyForm)
    setEditingBook(null)
    setIsEditOpen(false)
    setShowSuccess(`Book "${form.title}" updated successfully.`)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      publisher: book.publisher,
      publishedYear: String(book.publishedYear),
      totalCopies: String(book.totalCopies),
      description: "",
    })
    setIsEditOpen(true)
  }

  const openAdd = () => {
    setForm(emptyForm)
    setIsAddOpen(true)
  }

  const isFormValid =
    form.title.trim() !== "" &&
    form.author.trim() !== "" &&
    form.isbn.trim() !== "" &&
    form.genre.trim() !== ""

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
      <FormField label="Author" htmlFor="book-author" required>
        <Input
          id="book-author"
          placeholder="e.g. Robert C. Martin"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
        />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="ISBN" htmlFor="book-isbn" required>
          <Input
            id="book-isbn"
            placeholder="e.g. 978-0132350884"
            value={form.isbn}
            onChange={(e) => setForm({ ...form, isbn: e.target.value })}
          />
        </FormField>
        <FormField label="Genre" htmlFor="book-genre" required>
          <Select
            id="book-genre"
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            placeholder="Select genre"
            options={[
              { label: "Fiction", value: "Fiction" },
              { label: "Science", value: "Science" },
              { label: "Computer Science", value: "Computer Science" },
              { label: "Software Engineering", value: "Software Engineering" },
              { label: "History", value: "History" },
              { label: "Philosophy", value: "Philosophy" },
              { label: "Biography", value: "Biography" },
              { label: "Other", value: "Other" },
            ]}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Publisher" htmlFor="book-publisher">
          <Input
            id="book-publisher"
            placeholder="e.g. Prentice Hall"
            value={form.publisher}
            onChange={(e) => setForm({ ...form, publisher: e.target.value })}
          />
        </FormField>
        <FormField label="Published Year" htmlFor="book-year">
          <Input
            id="book-year"
            type="number"
            placeholder="e.g. 2023"
            value={form.publishedYear}
            onChange={(e) => setForm({ ...form, publishedYear: e.target.value })}
          />
        </FormField>
      </div>
      <FormField label="Total Copies" htmlFor="book-copies" required>
        <Input
          id="book-copies"
          type="number"
          min="1"
          placeholder="e.g. 5"
          value={form.totalCopies}
          onChange={(e) => setForm({ ...form, totalCopies: e.target.value })}
        />
      </FormField>
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

  return (
    <AppLayout sidebarItems={sidebarItems} topbarTitle="Book Management">
      <div className="w-full space-y-6 p-6 pb-10">
        {/* Page Header */}
        <PageHeader
          title="Book Management"
          description="Add, edit, and manage the library's book inventory"
          action={
            <div className="flex items-center gap-3">
              <Button onClick={openAdd}>Add Book</Button>
              <Link to="/librarian/catalog">
                <Button variant="secondary">Browse Catalog</Button>
              </Link>
              <Link to="/librarian">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />

        {/* Success Banner */}
        {showSuccess ? (
          <Banner
            title={showSuccess}
            variant="info"
            onClose={() => setShowSuccess(null)}
          />
        ) : null}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Books</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{books.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Available</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {books.filter((b) => b.status === "available").length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Issued</p>
            <p className="mt-1 text-2xl font-semibold text-indigo-600">
              {books.filter((b) => b.status === "issued").length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Total Copies</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {books.reduce((acc, b) => acc + b.totalCopies, 0)}
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchCard title="Search Books" description="Find books by title, author, ISBN, or ID">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div className="sm:col-span-4">
              <Input
                placeholder="Search by title, author, or ISBN..."
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="All Statuses"
                options={[
                  { label: "All Statuses", value: "" },
                  { label: "Available", value: "available" },
                  { label: "Issued", value: "issued" },
                  { label: "Reserved", value: "reserved" },
                ]}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                placeholder="All Genres"
                options={[
                  { label: "All Genres", value: "" },
                  ...genres.map((g) => ({ label: g, value: g })),
                ]}
              />
            </div>
            <div className="sm:col-span-2">
              <Button
                className="w-full"
                variant="secondary"
                onClick={() => {
                  setSearch("")
                  setFilterStatus("")
                  setFilterGenre("")
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </SearchCard>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredBooks.length}</span> of{" "}
            <span className="font-medium text-gray-900">{books.length}</span> books
          </p>
        </div>

        {/* Books List */}
        <div className="space-y-3">
          {filteredBooks.map((book) => (
            <ListItemCard
              key={book.id}
              title={
                <div className="flex items-center gap-2">
                  <span>{book.title}</span>
                  <Badge label={book.id} variant="issued" />
                </div>
              }
              subtitle={
                <span>
                  {book.author} · ISBN: {book.isbn} · {book.genre}
                </span>
              }
              meta={`${book.availableCopies}/${book.totalCopies} copies available · ${book.publisher} · ${book.publishedYear}`}
              action={
                <div className="flex items-center gap-2">
                  <Badge
                    label={book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    variant={statusBadgeVariant[book.status]}
                  />
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => openEdit(book)}
                  >
                    Edit
                  </Button>
                </div>
              }
            />
          ))}

          {filteredBooks.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500">No books found matching your search criteria.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Add Book Modal */}
      <Modal
        open={isAddOpen}
        title="Add New Book"
        onClose={() => {
          setIsAddOpen(false)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleAdd} disabled={!isFormValid}>
            Add Book
          </Button>
        }
      >
        {bookFormFields}
      </Modal>

      {/* Edit Book Modal */}
      <Modal
        open={isEditOpen}
        title="Edit Book"
        onClose={() => {
          setIsEditOpen(false)
          setEditingBook(null)
          setForm(emptyForm)
        }}
        primaryAction={
          <Button onClick={handleEdit} disabled={!isFormValid}>
            Save Changes
          </Button>
        }
      >
        {editingBook ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">Book ID</p>
              <p className="font-medium text-gray-900">{editingBook.id}</p>
            </div>
            {bookFormFields}
          </div>
        ) : null}
      </Modal>
    </AppLayout>
  )
}
