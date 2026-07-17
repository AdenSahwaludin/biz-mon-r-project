import { verifyToken } from '../utils/jwt'

export default defineEventHandler((event) => {
  // We attach user to context if token is valid
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)
    if (decoded) {
      event.context.user = decoded
    }
  }
})
