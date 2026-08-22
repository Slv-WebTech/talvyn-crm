import { Link } from 'react-router-dom'
import { formatDateTime } from '../../utils/formatters.js'

export function UpcomingFollowUps({ followUps }) {
  return (
    <div className="dashboard-card">
      <h3>Upcoming Follow-ups</h3>
      {!followUps.length && <p className="empty-hint">Nothing scheduled. Enjoy the quiet.</p>}
      <ul className="record-list">
        {followUps.map((followUp) => (
          <li key={followUp.id} className="record-list-item">
            <div>
              <strong>{followUp.type}</strong> — {formatDateTime(followUp.scheduledAt)}
              {followUp.notes && <p className="record-notes">{followUp.notes}</p>}
            </div>
            {followUp.leadId && <Link to={`/leads/${followUp.leadId}`}>View lead</Link>}
            {followUp.customerId && <Link to={`/customers/${followUp.customerId}`}>View customer</Link>}
          </li>
        ))}
      </ul>
    </div>
  )
}
