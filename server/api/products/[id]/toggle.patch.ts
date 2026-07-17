import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Product ID is required'))
  }

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw createError(errorResponse(event, 404, 'Product not found'))
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive }
  })

  return successResponse(updated, `Product ${updated.isActive ? 'activated' : 'deactivated'} successfully`)
})
