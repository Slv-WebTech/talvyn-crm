import { Trash2 } from 'lucide-react'
import { Badge } from '../common/Badge.jsx'
import { Button } from '../common/Button.jsx'
import { formatDateTime } from '../../utils/formatters.js'

const STATUS_TONE = { PENDING: 'warning', COMPLETED: 'success', CANCELLED: 'danger' }

export function FollowUpList({ followUps, onComplete, onDelete }) {
  if (!followUps.length) {
    return <p className="empty-hint">No follow-ups scheduled yet.</p>
  }

  return (
    <ul className="record-list">
      {followUps.map((followUp) => (
        <li key={followUp.id} className="record-list-item">
          <div>
            <strong>{followUp.type}</strong> — {formatDateTime(followUp.scheduledAt)}
            {followUp.notes && <p className="record-notes">{followUp.notes}</p>}
          </div>
          <div className="record-list-actions">
            <Badge tone={STATUS_TONE[followUp.status] ?? 'default'}>{followUp.status}</Badge>
            {followUp.status === 'PENDING' && (
              <Button variant="secondary" onClick={() => onComplete(followUp.id)}>
                Mark done
              </Button>
            )}
            {onDelete && (
              <Button variant="danger" onClick={() => onDelete(followUp)} aria-label="Delete follow-up">
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
