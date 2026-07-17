import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Business ID is required'))
  }

  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transactions: true }
      }
    }
  })

  if (!business) {
    throw createError(errorResponse(event, 404, 'Business not found'))
  }

  if (business._count.transactions > 0) {
    throw createError(errorResponse(event, 400, 'Cannot delete business because it has transactions'))
  }

  await prisma.business.delete({ where: { id } })

  return successResponse(null, 'Business deleted successfully')
})
