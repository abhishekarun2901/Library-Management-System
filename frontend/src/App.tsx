import { BrowserRouter, Routes, Route } from "react-router-dom"
import {
  HomePage,
  LoginPage,
  SignUpPage,
  MemberDashboard,
  LibrarianDashboard,
  BookCatalog,
  IssueBook,
  MemberManagement,
  BookManagement,
  ReservationsPage,
  FinesPaymentsPage,
  MyActivityPage,
} from "./pages"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Member routes */}
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="/member/catalog" element={<BookCatalog />} />
        <Route path="/member/activity" element={<MyActivityPage />} />

        {/* Librarian routes */}
        <Route path="/librarian" element={<LibrarianDashboard />} />
        <Route path="/librarian/catalog" element={<BookCatalog role="librarian" />} />
        <Route path="/librarian/issue" element={<IssueBook />} />
        <Route path="/librarian/reservations" element={<ReservationsPage role="librarian" />} />
        <Route path="/librarian/members" element={<MemberManagement />} />
        <Route path="/librarian/books" element={<BookManagement />} />
        <Route path="/librarian/fines" element={<FinesPaymentsPage role="librarian" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
