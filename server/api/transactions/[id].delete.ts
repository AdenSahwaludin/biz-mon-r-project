import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Transaction ID is required'))
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { details: true }
  })

  if (!transaction) {
    throw createError(errorResponse(event, 404, 'Transaction not found'))
  }

  // Restore product stocks
  for (const detail of transaction.details) {
    await prisma.product.update({
      where: { id: detail.productId },
      data: {
        stock: { increment: detail.qty }
      }
    }).catch(() => {
      // Ignore if product was deleted
    })
  }

  // Delete transaction (TransactionDetail will be deleted automatically due to onDelete: Cascade)
  await prisma.transaction.delete({
    where: { id }
  })

  return successResponse(null, 'Transaction deleted successfully and stock restored')
})
