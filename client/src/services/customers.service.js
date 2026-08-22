import { api } from './api.js'

export function listCustomers(params) {
  return api.get('/customers', { params }).then((res) => res.data)
}

export function getCustomer(id) {
  return api.get(`/customers/${id}`).then((res) => res.data)
}

export function createCustomer(data) {
  return api.post('/customers', data).then((res) => res.data)
}

export function updateCustomer(id, data) {
  return api.put(`/customers/${id}`, data).then((res) => res.data)
}

export function deleteCustomer(id) {
  return api.delete(`/customers/${id}`)
}

export function getCustomerOpportunities(id) {
  return api.get(`/customers/${id}/opportunities`).then((res) => res.data)
}
