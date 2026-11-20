import { useEffect, useState } from 'react'
import { Badge } from '../components/common/Badge.jsx'
import { TableSkeleton } from '../components/common/Skeleton.jsx'
import { formatDateTime } from '../utils/formatters.js'
import * as auditLogsService from '../services/auditLogs.service.js'

const ACTION_TONE = { CREATE: 'success', UPDATE: 'info', DELETE: 'danger' }

export function AuditLogPage() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auditLogsService
      .listAuditLogs({ limit: 100 })
      .then((res) => setLogs(res.items))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Audit Log</h1>
      </div>

      {loading ? (
        <TableSkeleton columns={4} rows={8} />
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <p>No activity recorded yet.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  <Badge tone={ACTION_TONE[log.action] ?? 'default'}>{log.action}</Badge>
                </td>
                <td>
                  {log.entityType} <span className="record-meta">{log.entityId.slice(0, 8)}</span>
                </td>
                <td>{log.user?.name ?? 'System'}</td>
                <td>{formatDateTime(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
