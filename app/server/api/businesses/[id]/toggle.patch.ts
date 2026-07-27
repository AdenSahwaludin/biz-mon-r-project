import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Business ID is required'))
  }

  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) {
    throw createError(errorResponse(event, 404, 'Business not found'))
  }

  const updated = await prisma.business.update({
    where: { id },
    data: { isActive: !business.isActive }
  })

  return successResponse(updated, `Business ${updated.isActive ? 'activated' : 'deactivated'} successfully`)
})
