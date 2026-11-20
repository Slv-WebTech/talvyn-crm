const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export function formatCurrency(value) {
  if (value == null) return '—'
  return currencyFormatter.format(value)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const RELATIVE_UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function formatRelativeTime(value) {
  if (!value) return '—'
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })

  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return rtf.format(Math.round(seconds / unitSeconds), unit)
    }
  }
  return rtf.format(seconds, 'second')
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
