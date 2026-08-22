import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Target,
  Users,
  KanbanSquare,
  CalendarClock,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/leads', label: 'Leads', icon: Target },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { to: '/followups', label: 'Follow-ups', icon: CalendarClock },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
]

export function Sidebar({ open = false, onClose }) {
  const { user } = useAuth()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <nav id="app-sidebar" className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark">
            <Sparkles size={16} strokeWidth={2.5} />
          </span>
          Aurora
        </div>
        <ul className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end}>
                <item.icon size={17} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          {user?.role === 'ADMIN' && (
            <li>
              <NavLink to="/users">
                <ShieldCheck size={17} strokeWidth={2} />
                <span>Users</span>
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </>
  )
}
