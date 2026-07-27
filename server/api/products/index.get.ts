import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const query = getQuery(event)
  let businessId = query.businessId as string | undefined

  const where: any = {}

  if (businessId) {
    where.businessId = businessId
  } else if (user.role === 'KARYAWAN') {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        branch: { select: { businessId: true } },
        branches: { select: { businessId: true } }
      }
    })

    const bizIds = new Set<string>()
    if (dbUser?.branch?.businessId) bizIds.add(dbUser.branch.businessId)
    if (dbUser?.branches) {
      dbUser.branches.forEach((b: any) => {
        if (b.businessId) bizIds.add(b.businessId)
      })
    }

    if (bizIds.size > 0) {
      where.businessId = { in: Array.from(bizIds) }
    }
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      business: true,
      _count: { select: { transactionDetails: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Calculate total qty sold per product
  const productIds = products.map((p: any) => p.id)
  const soldAgg = await prisma.transactionDetail.groupBy({
    by: ['productId'],
    where: { productId: { in: productIds } },
    _sum: { qty: true }
  })
  const soldMap = new Map(soldAgg.map((s: any) => [s.productId, s._sum.qty || 0]))

  const productsWithSold = products.map((p: any) => ({
    ...p,
    totalSold: soldMap.get(p.id) || 0
  }))

  return successResponse(productsWithSold)
})
