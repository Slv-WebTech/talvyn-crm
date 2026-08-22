import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { Topbar } from './Topbar.jsx'

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="app-main">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} menuOpen={mobileNavOpen} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
