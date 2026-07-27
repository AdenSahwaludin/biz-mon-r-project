import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'asc' }
  })

  return successResponse(businesses)
})
