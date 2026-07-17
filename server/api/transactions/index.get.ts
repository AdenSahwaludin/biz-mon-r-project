import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const query = getQuery(event)
  let branchId = query.branchId as string | undefined
  const limit = query.limit ? parseInt(query.limit as string, 10) : 50

  if (user.role === 'KARYAWAN') {
    branchId = user.branchId
  }

  const where = branchId ? { branchId } : {}

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      cashier: { select: { id: true, name: true, username: true } },
      branch: { select: { id: true, name: true, business: { select: { name: true } } } },
      details: {
        include: { product: { select: { name: true, barcode: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return successResponse(transactions)
})
