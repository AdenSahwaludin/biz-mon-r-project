import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET

if (!SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET || 'supersecret', { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET || 'supersecret')
  } catch (error) {
    return null
  }
}
