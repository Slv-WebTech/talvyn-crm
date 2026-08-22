import axios from 'axios'

const AUTH_TOKEN_KEY = 'crm_token'

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token)
  else localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getErrorMessage(error) {
  return error?.response?.data?.error?.message ?? 'Something went wrong. Please try again.'
}

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getToken()) {
      setToken(null)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)
