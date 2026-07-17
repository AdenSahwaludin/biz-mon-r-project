import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const query = getQuery(event)
  let businessId = query.businessId as string | undefined

  if (user.role === 'KARYAWAN') {
    businessId = user.businessId
  }

  const where = businessId ? { businessId } : {}

  const products = await prisma.product.findMany({
    where,
    include: { category: true, business: true },
    orderBy: { createdAt: 'desc' }
  })

  return successResponse(products)
})
