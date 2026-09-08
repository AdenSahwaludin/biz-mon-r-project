import { requireAuth, getUserBusinessIds } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  const user = requireAuth(event)
  const body = await readBody(event)
  const { ids } = body || {}

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError(errorResponse(event, 400, 'Product IDs array is required'))
  }

  if (ids.length > 100) {
    throw createError(errorResponse(event, 400, 'Maksimal 100 produk per batch-delete'))
  }

  if (!ids.every((id: any) => typeof id === 'string' && id.length > 0)) {
    throw createError(errorResponse(event, 400, 'Product IDs tidak valid'))
  }

  // Scope: karyawan hanya boleh hapus produk bisnis cabangnya
  if (user.role !== 'ADMIN') {
    const allowed = await getUserBusinessIds(user.id)
    const targets = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, businessId: true }
    })
    const forbidden = targets.some((t) => !allowed.has(t.businessId))
    if (forbidden || targets.length !== ids.length) {
      throw createError(errorResponse(event, 403, 'Forbidden: bukan bisnis cabang Anda'))
    }
  }

  // Find products that are used in transactions
  const productsWithTransactions = await prisma.product.findMany({
    where: {
      id: { in: ids },
      transactionDetails: { some: {} }
    },
    select: { id: true, name: true }
  })

  const blockedIds = new Set(productsWithTransactions.map((p) => p.id))
  const deletableIds = ids.filter((id) => !blockedIds.has(id))

  let deletedCount = 0
  if (deletableIds.length > 0) {
    const res = await prisma.product.deleteMany({
      where: { id: { in: deletableIds } }
    })
    deletedCount = res.count
  }

  return successResponse(
    {
      deletedCount,
      blockedCount: blockedIds.size,
      blockedProducts: productsWithTransactions.map((p) => p.name)
    },
    `${deletedCount} produk berhasil dihapus${blockedIds.size > 0 ? `, ${blockedIds.size} produk dilewati karena memiliki riwayat transaksi` : ''}`
  )
})
