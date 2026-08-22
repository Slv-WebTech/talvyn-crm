import { api } from './api.js'

export function register(data) {
  return api.post('/auth/register', data).then((res) => res.data)
}

export function login(data) {
  return api.post('/auth/login', data).then((res) => res.data)
}

export function fetchMe() {
  return api.get('/auth/me').then((res) => res.data)
}
