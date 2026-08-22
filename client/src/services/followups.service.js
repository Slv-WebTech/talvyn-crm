import { api } from './api.js'

export function listFollowUps(params) {
  return api.get('/followups', { params }).then((res) => res.data)
}

export function createFollowUp(data) {
  return api.post('/followups', data).then((res) => res.data)
}

export function updateFollowUp(id, data) {
  return api.put(`/followups/${id}`, data).then((res) => res.data)
}

export function completeFollowUp(id) {
  return api.patch(`/followups/${id}/complete`).then((res) => res.data)
}

export function deleteFollowUp(id) {
  return api.delete(`/followups/${id}`)
}
