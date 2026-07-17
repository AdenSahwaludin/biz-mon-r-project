import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Category ID is required'))
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  if (!category) {
    throw createError(errorResponse(event, 404, 'Category not found'))
  }

  if (category._count.products > 0) {
    throw createError(errorResponse(event, 400, 'Cannot delete category because it has products'))
  }

  await prisma.category.delete({ where: { id } })

  return successResponse(null, 'Category deleted successfully')
})
