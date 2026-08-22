import { api } from './api.js'

export function listLeads(params) {
  return api.get('/leads', { params }).then((res) => res.data)
}

export function getLead(id) {
  return api.get(`/leads/${id}`).then((res) => res.data)
}

export function createLead(data) {
  return api.post('/leads', data).then((res) => res.data)
}

export function updateLead(id, data) {
  return api.put(`/leads/${id}`, data).then((res) => res.data)
}

export function deleteLead(id) {
  return api.delete(`/leads/${id}`)
}

export function convertLead(id) {
  return api.post(`/leads/${id}/convert`).then((res) => res.data)
}
