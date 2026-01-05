import client from './client'

export interface User {
  _id: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post('/auth/register', { email, password })
  return response.data
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await client.post('/auth/login', { email, password })
  return response.data
}

export const getMe = async (): Promise<User> => {
  const response = await client.get('/auth/me')
  return response.data
}
