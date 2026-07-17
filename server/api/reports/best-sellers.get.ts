import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const query = getQuery(event)
  const businessId = query.businessId as string | undefined
  const branchId = query.branchId as string | undefined

  const where: any = {}
  if (branchId) {
    where.branchId = branchId
  } else if (businessId) {
    where.branch = { businessId }
  }

  const transactionDetails = await prisma.transactionDetail.findMany({
    where: {
      transaction: where
    },
    include: {
      product: { select: { id: true, name: true, business: { select: { name: true } } } }
    }
  })

  const productSales: Record<string, { name: string, business: string, qty: number, subtotal: number }> = {}

  transactionDetails.forEach(detail => {
    if (!productSales[detail.productId]) {
      productSales[detail.productId] = {
        name: detail.product.name,
        business: detail.product.business.name,
        qty: 0,
        subtotal: 0
      }
    }
    productSales[detail.productId].qty += detail.qty
    productSales[detail.productId].subtotal += detail.subtotal
  })

  const sorted = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 10) // Top 10

  return successResponse(sorted)
})
