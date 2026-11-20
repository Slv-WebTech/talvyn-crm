import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarClock, ListChecks, Target, Briefcase } from 'lucide-react'
import * as notificationsService from '../../services/notifications.service.js'
import { formatRelativeTime } from '../../utils/formatters.js'

const POLL_INTERVAL_MS = 30000

const TYPE_ICON = {
  LEAD_ASSIGNED: Target,
  TASK_ASSIGNED: ListChecks,
  TASK_OVERDUE: ListChecks,
  OPPORTUNITY_STAGE_CHANGED: Briefcase,
  FOLLOWUP_UPCOMING: CalendarClock,
}

const ENTITY_ROUTE = {
  lead: (id) => `/leads/${id}`,
  customer: (id) => `/customers/${id}`,
  opportunity: () => '/pipeline',
  task: () => '/tasks',
  followup: () => '/followups',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const rootRef = useRef(null)

  const load = useCallback(() => {
    notificationsService
      .listNotifications()
      .then((res) => {
        setItems(res.items)
        setUnreadCount(res.unreadCount)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  async function handleMarkRead(notification) {
    if (notification.virtual || notification.read) return
    try {
      await notificationsService.markNotificationRead(notification.id)
      setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {
      // next poll reconciles
    }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsService.markAllNotificationsRead()
      setItems((prev) => prev.map((n) => (n.virtual ? n : { ...n, read: true })))
      setUnreadCount(items.filter((n) => n.virtual).length)
    } catch {
      // next poll reconciles
    }
  }

  return (
    <div className="notification-bell" ref={rootRef}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={17} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="notification-panel" role="menu">
          <div className="notification-panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className="notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="notification-empty">You're all caught up.</p>
          ) : (
            <ul className="notification-list">
              {items.map((notification) => {
                const Icon = TYPE_ICON[notification.type] ?? Bell
                const route = notification.entityType
                  ? ENTITY_ROUTE[notification.entityType]?.(notification.entityId)
                  : null
                const content = (
                  <>
                    <span className="notification-icon">
                      <Icon size={15} strokeWidth={2} />
                    </span>
                    <span className="notification-content">
                      <span className="notification-message">{notification.message}</span>
                      <span className="notification-time">{formatRelativeTime(notification.createdAt)}</span>
                    </span>
                  </>
                )
                const itemClass = `notification-item${notification.read ? '' : ' notification-item-unread'}`

                return (
                  <li key={notification.id} className={itemClass}>
                    {route ? (
                      <Link
                        to={route}
                        className="notification-link"
                        onClick={() => {
                          handleMarkRead(notification)
                          setOpen(false)
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="notification-link"
                        onClick={() => handleMarkRead(notification)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
