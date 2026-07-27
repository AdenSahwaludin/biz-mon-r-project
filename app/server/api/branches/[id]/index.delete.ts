import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Branch ID is required'))
  }

  const branch = await prisma.branch.findUnique({
    where: { id },
    include: {
      business: {
        include: {
          _count: {
            select: { branches: true }
          }
        }
      }
    }
  })

  if (!branch) {
    throw createError(errorResponse(event, 404, 'Cabang tidak ditemukan'))
  }

  // 1. Check if branch is the last branch of this business
  if (branch.business._count.branches <= 1) {
    throw createError(errorResponse(event, 400, 'Tidak dapat menghapus cabang terakhir dari bisnis ini'))
  }

  // 2. Check if branch has registered transactions
  const trxCount = await prisma.transaction.count({
    where: { branchId: id }
  })
  if (trxCount > 0) {
    throw createError(errorResponse(event, 400, `Cabang tidak dapat dihapus karena telah memiliki ${trxCount} riwayat transaksi terdaftar`))
  }

  // 3. Check if branch has assigned users/cashiers
  const userCount = await prisma.user.count({
    where: { branchId: id }
  })
  if (userCount > 0) {
    throw createError(errorResponse(event, 400, `Cabang tidak dapat dihapus karena masih terhubung dengan ${userCount} akun karyawan`))
  }

  await prisma.branch.delete({ where: { id } })

  return successResponse(null, 'Cabang berhasil dihapus')
})
