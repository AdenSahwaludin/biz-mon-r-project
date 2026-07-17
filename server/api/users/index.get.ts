import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const users = await prisma.user.findMany({
    include: { branch: { include: { business: true } } },
    orderBy: { createdAt: 'desc' }
  })

  // Remove passwords from response
  const sanitized = users.map(u => {
    const { password, ...rest } = u
    return rest
  })

  return successResponse(sanitized)
})
