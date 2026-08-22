import { api } from './api.js'

export function listTasks(params) {
  return api.get('/tasks', { params }).then((res) => res.data)
}

export function createTask(data) {
  return api.post('/tasks', data).then((res) => res.data)
}

export function updateTask(id, data) {
  return api.put(`/tasks/${id}`, data).then((res) => res.data)
}

export function updateTaskStatus(id, status) {
  return api.patch(`/tasks/${id}/status`, { status }).then((res) => res.data)
}

export function deleteTask(id) {
  return api.delete(`/tasks/${id}`)
}
