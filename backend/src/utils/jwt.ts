import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config/env'

interface TokenPayload {
  userId: string
}

export function generateToken(userId: string): string {
  const payload: TokenPayload = { userId }
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as SignOptions)
}

export function formatUserResponse(user: { _id: any; email: string }, token: string) {
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
    },
  }
}
