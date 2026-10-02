import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './api'
import { AuthContext } from './authContextValue'

const TOKEN_KEY = 'clinicflow_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true
    apiRequest('/auth/me', { token })
      .then((currentUser) => { if (active) setUser(currentUser) })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        if (active) {
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [token])

  async function login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    return result.user
  }

  async function register(fullName, email, password) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    })
    localStorage.setItem(TOKEN_KEY, result.token)
    setToken(result.token)
    setUser(result.user)
    return result.user
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, login, register, logout }), [token, user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
