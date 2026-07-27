import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Business ID is required'))
  }

  const business = await prisma.business.findUnique({
    where: { id }
  })

  if (!business) {
    throw createError(errorResponse(event, 404, 'Bisnis tidak ditemukan'))
  }

  // 1. Check total businesses count (Cannot delete the last business in system)
  const totalBiz = await prisma.business.count()
  if (totalBiz <= 1) {
    throw createError(errorResponse(event, 400, 'Tidak dapat menghapus bisnis terakhir di dalam sistem'))
  }

  // 2. Check if business has transactions
  const trxCount = await prisma.transaction.count({
    where: {
      branch: {
        businessId: id
      }
    }
  })
  if (trxCount > 0) {
    throw createError(errorResponse(event, 400, `Bisnis tidak dapat dihapus karena telah memiliki ${trxCount} riwayat transaksi terdaftar`))
  }

  // 3. Check if business has products
  const productCount = await prisma.product.count({
    where: { businessId: id }
  })
  if (productCount > 0) {
    throw createError(errorResponse(event, 400, `Bisnis tidak dapat dihapus karena masih memiliki ${productCount} produk terdaftar. Hapus produk terlebih dahulu.`))
  }

  // Delete business and associated branches/categories in transaction
  await prisma.$transaction([
    prisma.category.deleteMany({ where: { businessId: id } }),
    prisma.branch.deleteMany({ where: { businessId: id } }),
    prisma.business.delete({ where: { id } })
  ])

  return successResponse(null, 'Bisnis berhasil dihapus')
})
