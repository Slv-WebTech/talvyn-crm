import { createContext, useCallback, useRef, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export const ToastContext = createContext(null)

let nextId = 1

const TONE_ICON = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const EXIT_DURATION = 180

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const leavingIds = useRef(new Set())

  const dismiss = useCallback((id) => {
    if (leavingIds.current.has(id)) return
    leavingIds.current.add(id)
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      leavingIds.current.delete(id)
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, EXIT_DURATION)
  }, [])

  const showToast = useCallback(
    (message, tone = 'danger') => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, tone, leaving: false }])
      setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = TONE_ICON[toast.tone] ?? Info
          return (
            <div
              key={toast.id}
              className={`toast toast-${toast.tone}${toast.leaving ? ' toast-leaving' : ''}`}
              onClick={() => dismiss(toast.id)}
            >
              <span className="toast-icon">
                <Icon size={16} strokeWidth={2.25} />
              </span>
              <span className="toast-content">{toast.message}</span>
              <button
                type="button"
                className="toast-close"
                aria-label="Dismiss"
                onClick={(e) => {
                  e.stopPropagation()
                  dismiss(toast.id)
                }}
              >
                <X size={14} strokeWidth={2.25} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
