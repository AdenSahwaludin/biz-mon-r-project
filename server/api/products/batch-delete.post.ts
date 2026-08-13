import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAuth(event)
  const body = await readBody(event)
  const { ids } = body || {}

  if (!Array.isArray(ids) || ids.length === 0) {
    throw createError(errorResponse(event, 400, 'Product IDs array is required'))
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
