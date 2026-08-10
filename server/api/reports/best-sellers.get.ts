import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const query = getQuery(event)
  const businessId = query.businessId as string | undefined
  const branchId = query.branchId as string | undefined
  const limit = query.limit ? parseInt(query.limit as string, 10) : 10
  const startDateStr = (query.startDate || query.date) as string | undefined
  const endDateStr = (query.endDate || query.date) as string | undefined

  const transactionWhere: any = {}
  if (branchId) {
    transactionWhere.branchId = branchId
  } else if (businessId) {
    transactionWhere.branch = { businessId }
  }

  if (startDateStr || endDateStr) {
    transactionWhere.createdAt = {}
    if (startDateStr) transactionWhere.createdAt.gte = new Date(`${startDateStr}T00:00:00.000Z`)
    if (endDateStr) transactionWhere.createdAt.lte = new Date(`${endDateStr}T23:59:59.999Z`)
  }

  const salesAgg = await prisma.transactionDetail.groupBy({
    by: ['productId'],
    where: {
      transaction: transactionWhere
    },
    _sum: {
      qty: true,
      subtotal: true
    },
    orderBy: {
      _sum: {
        qty: 'desc'
      }
    },
    take: limit
  })

  if (salesAgg.length === 0) {
    return successResponse([])
  }

  const productIds = salesAgg.map((s) => s.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      business: { select: { name: true } }
    }
  })

  const productMap = new Map(products.map((p) => [p.id, p]))

  const result = salesAgg.map((item) => {
    const prod = productMap.get(item.productId)
    return {
      id: item.productId,
      name: prod?.name || 'Produk Dihapus',
      business: prod?.business?.name || '-',
      qty: item._sum.qty || 0,
      subtotal: item._sum.subtotal || 0
    }
  })

  return successResponse(result)
})
