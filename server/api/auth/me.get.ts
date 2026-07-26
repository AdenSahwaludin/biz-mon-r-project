import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const currentUser = requireAuth(event)
  
  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    include: {
      branch: { include: { business: true } },
      branches: { include: { business: true } }
    }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  const userBranches = user.branches.length > 0
    ? user.branches.map(b => ({ id: b.id, name: b.name, businessId: b.businessId, businessName: b.business?.name || '' }))
    : (user.branch ? [{ id: user.branch.id, name: user.branch.name, businessId: user.branch.businessId, businessName: user.branch.business?.name || '' }] : [])

  return successResponse({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null,
    business: user.branch?.business ? { id: user.branch.business.id, name: user.branch.business.name } : null,
    branches: userBranches
  })
})
