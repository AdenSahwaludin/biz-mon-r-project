import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  
  const query = getQuery(event)
  let businessId = query.businessId as string | undefined

  if (user.role === 'KARYAWAN') {
    businessId = user.businessId
    if (!businessId && user.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: user.branchId },
        select: { businessId: true }
      })
      if (branch) {
        businessId = branch.businessId
      }
    }
  }

  const where = businessId ? { businessId } : {}

  const categories = await prisma.category.findMany({
    where,
    include: {
      business: true,
      products: {
        orderBy: { name: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return successResponse(categories)
})
