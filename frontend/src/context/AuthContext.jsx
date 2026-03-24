import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.api'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    // Only attempt to fetch the profile if we have a token
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await authApi.me()
      setUser(response.data || response.user || response)
    } catch {
      setUser(null)
      localStorage.removeItem('auth_token') // Clear invalid token
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()

    // Listen for global 401 Unauthorized events from Axios interceptor
    const handleUnauthorized = () => {
      setUser(null)
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [refreshUser])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login: async (email, password) => {
        const response = await authApi.login({ email, password })
        if (response.token) {
          localStorage.setItem('auth_token', response.token)
        }
        setUser(response.user)
      },
      register: async (name, email, password, passwordConfirmation) => {
        const response = await authApi.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        })
        if (response.token) {
          localStorage.setItem('auth_token', response.token)
        }
        setUser(response.user)
      },
      logout: async () => {
        try {
          await authApi.logout()
        } catch (e) {
          console.error("Logout failed on server, cleaning up local state anyway");
        } finally {
          localStorage.removeItem('auth_token')
          setUser(null)
        }
      },
      updateUserLocally: (updatedUser) => {
        setUser(updatedUser)
      },
      refreshUser,
    }),
    [loading, refreshUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
