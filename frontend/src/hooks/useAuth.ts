import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, getMe, User } from '../api/auth'
import { showNotification } from '@mantine/notifications'
import { useQueryClient } from '@tanstack/react-query'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    try {
      const { token, user } = await login(email, password)
      localStorage.setItem('token', token)
      setUser(user)

      // Clear all queries on login to ensure no data from previous user remains
      queryClient.clear()

      navigate('/')
      showNotification({ message: 'Logged in successfully', color: 'green' })
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.error || 'Login failed',
        color: 'red',
      })
      throw error
    }
  }

  const handleRegister = async (email: string, password: string) => {
    try {
      const { token, user } = await register(email, password)
      localStorage.setItem('token', token)
      setUser(user)

      // Clear all queries on register
      queryClient.clear()

      navigate('/')
      showNotification({ message: 'Account created successfully', color: 'green' })
    } catch (error: any) {
      showNotification({
        message: error.response?.data?.error || 'Registration failed',
        color: 'red',
      })
      throw error
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)

    // Clear all queries on logout
    queryClient.clear()

    navigate('/login')
    showNotification({ message: 'Logged out', color: 'blue' })
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }
}
