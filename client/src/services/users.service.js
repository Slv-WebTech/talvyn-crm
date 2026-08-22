import { api } from './api.js'

export function listUsers() {
  return api.get('/users').then((res) => res.data)
}

export function createUser(data) {
  return api.post('/users', data).then((res) => res.data)
}

export function updateUser(id, data) {
  return api.put(`/users/${id}`, data).then((res) => res.data)
}

export function deactivateUser(id) {
  return api.delete(`/users/${id}`).then((res) => res.data)
}
