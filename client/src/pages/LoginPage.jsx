import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { getErrorMessage } from '../services/api.js'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <span className="auth-brand">
          <Sparkles size={20} strokeWidth={2.5} />
        </span>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to your CRM workspace</p>
        {error && <div className="form-error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? <Loader2 size={16} className="btn-spin" /> : <ArrowRight size={16} />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="auth-switch">
          No account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}
