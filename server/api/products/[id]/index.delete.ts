import { requireAuth, assertBusinessAccess } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Product ID is required'))
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: { transactionDetails: true }
      }
    }
  })

  if (!product) {
    throw createError(errorResponse(event, 404, 'Product not found'))
  }

  await assertBusinessAccess(event, user, product.businessId)

  if (product._count.transactionDetails > 0) {
    throw createError(errorResponse(event, 400, 'Cannot delete product because it has been used in transactions. Please deactivate it instead.'))
  }

  await prisma.product.delete({ where: { id } })

  return successResponse(null, 'Product deleted successfully')
})
