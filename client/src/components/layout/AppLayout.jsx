import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { Topbar } from './Topbar.jsx'
import { useTableLabels } from '../../hooks/useTableLabels.js'

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/leads': 'Leads',
  '/customers': 'Customers',
  '/pipeline': 'Pipeline',
  '/followups': 'Follow-ups',
  '/tasks': 'Tasks',
  '/audit-log': 'Audit Log',
  '/users': 'Users',
}

function titleFor(pathname) {
  const base = '/' + pathname.split('/')[1]
  const name = ROUTE_TITLES[pathname] ?? ROUTE_TITLES[base]
  return name ? `${name} · Talvyn CRM` : 'Talvyn CRM'
}

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()
  const contentRef = useRef(null)
  useTableLabels(contentRef)

  useEffect(() => {
    setMobileNavOpen(false)
    document.title = titleFor(location.pathname)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} menuOpen={mobileNavOpen} />
        <main className="app-content" id="main-content" ref={contentRef} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
