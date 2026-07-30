import { requireAuth } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const barcode = getRouterParam(event, 'barcode')
  const query = getQuery(event)
  let businessId = query.businessId as string | undefined

  if (!barcode) {
    return errorResponse(event, 'Barcode required', 400)
  }

  const where: any = {
    OR: [
      { barcode: { equals: barcode } },
      { sku: { equals: barcode } }
    ]
  }

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

  const product = await prisma.product.findFirst({
    where,
    include: {
      category: true,
      business: true
    }
  })

  if (!product) {
    return errorResponse(event, 'Produk tidak ditemukan', 404)
  }

  return successResponse(product)
})
