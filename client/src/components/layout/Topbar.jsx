import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { formatRole } from '../../utils/roles.js'

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function Topbar({ onMenuClick, menuOpen = false }) {
  const { user, logout } = useAuth()

  return (
    <header className="topbar">
      <button
        type="button"
        className="icon-btn menu-toggle"
        onClick={onMenuClick}
        aria-label="Open navigation"
        aria-controls="app-sidebar"
        aria-expanded={menuOpen}
      >
        <Menu size={18} strokeWidth={2} />
      </button>
      <div className="topbar-spacer" />
      <div className="topbar-user">
        <div className="avatar">{initials(user?.name)}</div>
        <div className="topbar-identity">
          <span className="topbar-name">{user?.name}</span>
          <span className="topbar-role">{formatRole(user?.role)}</span>
        </div>
        <button type="button" className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">
          <LogOut size={17} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
