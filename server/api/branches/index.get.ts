import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  
  const query = getQuery(event)
  const businessId = query.businessId as string | undefined

  const where = businessId ? { businessId } : {}

  const branches = await prisma.branch.findMany({
    where,
    include: { business: true },
    orderBy: { createdAt: 'asc' }
  })

  return successResponse(branches)
})
