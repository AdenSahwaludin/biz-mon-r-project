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
