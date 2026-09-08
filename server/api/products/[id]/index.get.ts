import { requireAuth } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = event.context.params?.id
    if (!id) {
      return errorResponse(event, 400, 'ID produk wajib diisi')
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        business: true,
      }
    })

    if (!product) {
      return errorResponse(event, 404, 'Produk tidak ditemukan')
    }

    return successResponse(product)
  } catch (error: any) {
    return errorResponse(event, 500, error.message || 'Terjadi kesalahan pada server')
  }
})
