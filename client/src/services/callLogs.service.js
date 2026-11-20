import { api } from './api.js'

export function listCallLogs(params) {
  return api.get('/call-logs', { params }).then((res) => res.data)
}

export function createCallLog(data) {
  return api.post('/call-logs', data).then((res) => res.data)
}

export function updateCallLog(id, data) {
  return api.put(`/call-logs/${id}`, data).then((res) => res.data)
}

export function deleteCallLog(id) {
  return api.delete(`/call-logs/${id}`)
}
