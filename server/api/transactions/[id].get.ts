import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) throw createError(errorResponse(event, 400, 'Transaction ID is required'))

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      cashier: { select: { id: true, name: true, username: true } },
      branch: { select: { id: true, name: true, business: { select: { name: true } } } },
      details: {
        include: { product: { select: { name: true, barcode: true } } }
      }
    }
  })

  if (!transaction) {
    throw createError(errorResponse(event, 404, 'Transaction not found'))
  }

  // If karyawan, can only view own branch's transactions
  if (user.role === 'KARYAWAN' && transaction.branchId !== user.branchId) {
    throw createError(errorResponse(event, 403, 'Forbidden'))
  }

  return successResponse(transaction)
})
