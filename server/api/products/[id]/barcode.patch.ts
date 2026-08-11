import { z } from 'zod'
import { requireAuth } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

const updateBarcodeSchema = z.object({
  barcode: z.string().min(1, 'Barcode tidak boleh kosong'),
  force: z.boolean().optional().default(false)
})

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)

    const id = getRouterParam(event, 'id')
    if (!id) {
      return errorResponse(event, 'Product ID is required', 400)
    }

    const body = await readBody(event)
    const { barcode, force } = updateBarcodeSchema.parse(body)

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      return errorResponse(event, 'Produk tidak ditemukan', 404)
    }

    const finalBarcode = barcode.trim()

    // 1. Check Barcode Uniqueness within the business
    const existingProduct = await prisma.product.findFirst({
      where: {
        barcode: finalBarcode,
        businessId: product.businessId,
        NOT: { id }
      },
      select: {
        id: true,
        name: true
      }
    })

    if (existingProduct) {
      return errorResponse(
        event,
        `Barcode "${finalBarcode}" sudah digunakan oleh produk "${existingProduct.name}"`,
        400
      )
    }

    // 2. Check if product already has a barcode and user hasn't explicitly confirmed overwrite
    if (product.barcode && product.barcode !== finalBarcode && !force) {
      return errorResponse(
        event,
        `Produk "${product.name}" sudah memiliki barcode (${product.barcode}). Konfirmasi diperlukan untuk menimpa.`,
        409
      )
    }

    // 3. Update Barcode
    const updated = await prisma.product.update({
      where: { id },
      data: {
        barcode: finalBarcode
      }
    })

    return successResponse(updated, 'Barcode produk berhasil diperbarui')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 'Validasi gagal: ' + error.errors.map((e: any) => e.message).join(', '), 400)
    }
    return errorResponse(event, error.message || 'Gagal memperbarui barcode', 500)
  }
})
