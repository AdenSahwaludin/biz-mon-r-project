import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const query = getQuery(event)
  let branchId = query.branchId as string | undefined
  const limit = query.limit ? parseInt(query.limit as string, 10) : undefined

  const where: any = {}

  if (branchId) {
    where.branchId = branchId
  } else if (user.role === 'KARYAWAN') {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { branches: true }
    })
    const userBranchIds = [
      ...(dbUser?.branchId ? [dbUser.branchId] : []),
      ...(dbUser?.branches ? dbUser.branches.map(b => b.id) : [])
    ]
    if (userBranchIds.length > 0) {
      where.branchId = { in: userBranchIds }
    }
  }

  // Karyawan can ONLY view their own daily transactions
  if (user.role === 'KARYAWAN') {
    where.cashierId = user.id
  }

  const startDateStr = (query.startDate || query.date) as string | undefined
  const endDateStr = (query.endDate || query.date) as string | undefined

  if (startDateStr || endDateStr) {
    where.createdAt = {}
    if (startDateStr) {
      where.createdAt.gte = new Date(`${startDateStr}T00:00:00.000Z`)
    }
    if (endDateStr) {
      where.createdAt.lte = new Date(`${endDateStr}T23:59:59.999Z`)
    }
  }

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
    ...(limit ? { take: limit } : {})
  })

  return successResponse(transactions)
})
