import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const currentUser = requireAuth(event)
  
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: { branch: { include: { business: true } } }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return successResponse({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null,
    business: user.branch?.business ? { id: user.branch.business.id, name: user.branch.business.name } : null
  })
})
