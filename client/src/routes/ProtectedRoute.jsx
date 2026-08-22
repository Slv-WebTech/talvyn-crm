import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { Loader } from '../components/common/Loader.jsx'

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader label="Loading your workspace…" className="full-page-loader" />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />

  return children
}
