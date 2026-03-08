import { BrowserRouter, Routes, Route } from 'react-router-dom'
import {
  HomePage,
  LoginPage,
  SignUpPage,
  MemberDashboard,
  LibrarianDashboard,
  BookCatalog,
  MemberManagement,
  BookManagement,
  ReservationsPage,
  FinesPaymentsPage,
  MyActivityPage,
  ProfilePage,
  ReportsPage,
  LibrarianProfilePage,
} from './pages'
import { ProtectedRoute } from './components/router/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Member-only routes */}
        <Route element={<ProtectedRoute allowedRole="member" />}>
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/member/catalog" element={<BookCatalog />} />
          <Route path="/member/activity" element={<MyActivityPage />} />
          <Route path="/member/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin (librarian) routes */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/librarian" element={<LibrarianDashboard />} />
          <Route
            path="/librarian/reservations"
            element={<ReservationsPage role="librarian" />}
          />
          <Route path="/librarian/members" element={<MemberManagement />} />
          <Route path="/librarian/books" element={<BookManagement />} />
          <Route
            path="/librarian/fines"
            element={<FinesPaymentsPage role="librarian" />}
          />
          <Route path="/librarian/reports" element={<ReportsPage />} />
          <Route path="/librarian/profile" element={<LibrarianProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
