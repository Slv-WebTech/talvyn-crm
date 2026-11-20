import { api } from './api.js'

export function listAuditLogs(params) {
  return api.get('/audit-logs', { params }).then((res) => res.data)
}
