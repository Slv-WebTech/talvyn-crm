import { createContext, useEffect, useState, useCallback } from 'react'
import { getToken, setToken as persistToken } from '../services/api.js'
import * as authService from '../services/auth.service.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authService
      .fetchMe()
      .then(setUser)
      .catch(() => persistToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (credentials) => {
    const { user: loggedInUser, token } = await authService.login(credentials)
    persistToken(token)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const register = useCallback(async (data) => {
    const { user: registeredUser, token } = await authService.register(data)
    persistToken(token)
    setUser(registeredUser)
    return registeredUser
  }, [])

  const logout = useCallback(() => {
    persistToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
