import { Link } from 'react-router-dom'
import { Target, Plus } from 'lucide-react'
import { Badge } from '../common/Badge.jsx'
import { Button } from '../common/Button.jsx'
import { formatDate } from '../../utils/formatters.js'

const STATUS_TONE = {
  NEW: 'default',
  CONTACTED: 'info',
  QUALIFIED: 'warning',
  CONVERTED: 'success',
  LOST: 'danger',
}

export function LeadTable({ leads, onCreate }) {
  if (!leads.length) {
    return (
      <div className="empty-state">
        <span className="empty-state-icon">
          <Target size={20} strokeWidth={2} />
        </span>
        <p>No leads yet. Add your first lead to get started.</p>
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus size={16} /> Add Lead
          </Button>
        )}
      </div>
    )
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Email</th>
          <th>Source</th>
          <th>Status</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        {leads.map((lead) => (
          <tr key={lead.id}>
            <td>
              <Link to={`/leads/${lead.id}`}>{lead.name}</Link>
            </td>
            <td>{lead.company}</td>
            <td>{lead.email}</td>
            <td>{lead.source ?? '—'}</td>
            <td>
              <Badge tone={STATUS_TONE[lead.status] ?? 'default'}>{lead.status}</Badge>
            </td>
            <td>{formatDate(lead.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
