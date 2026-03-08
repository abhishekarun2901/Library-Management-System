import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import type { AuthRole } from '../../store/authStore'

type ProtectedRouteProps = {
  /** If provided, only users with this role can access. Redirects others to /login. */
  allowedRole?: AuthRole
}

/**
 * Wraps a group of routes. Redirects to /login when the user is not
 * authenticated, and to /login when the role does not match (if specified).
 */
export const ProtectedRoute = ({ allowedRole }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && role !== allowedRole) {
    // Redirect to the correct dashboard rather than an error page
    return <Navigate to={role === 'admin' ? '/librarian' : '/member'} replace />
  }

  return <Outlet />
}
