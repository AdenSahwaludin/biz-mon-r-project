import { z } from 'zod'
import { requireAuth } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

const updateSchema = z.object({
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  price: z.number().min(0, 'Harga tidak boleh negatif').max(2000000000, 'Harga terlalu besar'),
  stock: z.number().min(0, 'Stok tidak boleh negatif').max(2000000000, 'Stok terlalu besar'),
  unit: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    requireAuth(event)
    const id = event.context.params?.id
    if (!id) {
      throw createError(errorResponse(event, 400, 'Product ID is required'))
    }

    const body = await readBody(event)
    const data = updateSchema.parse(body)

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) {
      throw createError(errorResponse(event, 404, 'Product not found'))
    }

    const finalSku = data.sku ? data.sku.trim() : null
    const finalBarcode = data.barcode ? data.barcode.trim() : null

    // Check SKU Uniqueness if changed
    if (finalSku && finalSku !== product.sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: finalSku,
          businessId: product.businessId,
          NOT: { id }
        }
      })
      if (existingSku) {
        return errorResponse(event, 400, 'SKU sudah digunakan di bisnis ini')
      }
    }

    // Check Barcode Uniqueness if changed
    if (finalBarcode && finalBarcode !== product.barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: {
          barcode: finalBarcode,
          businessId: product.businessId,
          NOT: { id }
        }
      })
      if (existingBarcode) {
        return errorResponse(event, 400, 'Barcode sudah digunakan di bisnis ini')
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        sku: finalSku ?? product.sku,
        barcode: finalBarcode,
        name: data.name,
        price: data.price,
        stock: data.stock,
        unit: data.unit,
        categoryId: data.categoryId || null,
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    })

    return successResponse(updated, 'Produk berhasil diperbarui')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
