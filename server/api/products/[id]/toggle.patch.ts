import { requireAuth, assertBusinessAccess } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Product ID is required'))
  }

  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) {
    throw createError(errorResponse(event, 404, 'Product not found'))
  }

  await assertBusinessAccess(event, user, product.businessId)

  const updated = await prisma.product.update({
    where: { id },
    data: { isActive: !product.isActive }
  })

  return successResponse(updated, `Product ${updated.isActive ? 'activated' : 'deactivated'} successfully`)
})
