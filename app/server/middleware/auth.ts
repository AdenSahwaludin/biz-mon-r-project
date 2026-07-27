import { verifyToken } from '../utils/jwt'

export default defineEventHandler((event) => {
  let token: string | undefined

  // Check Authorization header first
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else {
    // Fallback to auth_token cookie
    token = getCookie(event, 'auth_token')
  }

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      event.context.user = decoded
    }
  }
})
