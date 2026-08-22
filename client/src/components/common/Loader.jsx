import { Loader2 } from 'lucide-react'

export function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`loader ${className}`.trim()} role="status" aria-live="polite">
      <Loader2 size={18} strokeWidth={2.5} />
      {label}
    </div>
  )
}
