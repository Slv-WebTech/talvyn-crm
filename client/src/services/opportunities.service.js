import { api } from './api.js'

export function listOpportunities(params) {
  return api.get('/opportunities', { params }).then((res) => res.data)
}

export function createOpportunity(data) {
  return api.post('/opportunities', data).then((res) => res.data)
}

export function updateOpportunity(id, data) {
  return api.put(`/opportunities/${id}`, data).then((res) => res.data)
}

export function updateOpportunityStage(id, stage) {
  return api.patch(`/opportunities/${id}/stage`, { stage }).then((res) => res.data)
}

export function deleteOpportunity(id) {
  return api.delete(`/opportunities/${id}`)
}
