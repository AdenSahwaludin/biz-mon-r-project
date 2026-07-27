import { H3Event } from 'h3'
import { errorResponse } from './response'

export function requireAuth(event: H3Event) {
  if (!event.context.user) {
    throw createError(errorResponse(event, 401, 'Unauthorized'))
  }
  return event.context.user
}

export function requireAdmin(event: H3Event) {
  const user = requireAuth(event)
  if (user.role !== 'ADMIN') {
    throw createError(errorResponse(event, 403, 'Forbidden: Admin access required'))
  }
  return user
}
