import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const rawId = getRouterParam(event, 'id') || ''
  const id = decodeURIComponent(rawId)
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

  // If karyawan, can only view assigned branches' transactions
  if (user.role === 'KARYAWAN') {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { branches: true }
    })
    const userBranchIds = [
      ...(dbUser?.branchId ? [dbUser.branchId] : []),
      ...(dbUser?.branches ? dbUser.branches.map(b => b.id) : [])
    ]
    if (userBranchIds.length > 0 && !userBranchIds.includes(transaction.branchId)) {
      throw createError(errorResponse(event, 403, 'Forbidden'))
    }
  }

  return successResponse(transaction)
})
