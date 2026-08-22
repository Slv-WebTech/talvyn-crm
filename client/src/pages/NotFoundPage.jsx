import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <span className="auth-brand">
          <Compass size={20} strokeWidth={2.5} />
        </span>
        <h1>404</h1>
        <p className="auth-subtitle">This page doesn't exist, or you don't have access to it.</p>
        <Link to="/" className="btn btn-primary btn-block">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
