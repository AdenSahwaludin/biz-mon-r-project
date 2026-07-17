import { z } from 'zod'
import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

const updateSchema = z.object({
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
    requireAdmin(event)
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

    if (data.barcode && data.barcode !== product.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: {
          barcode_businessId: {
            barcode: data.barcode,
            businessId: product.businessId
          }
        }
      })
      if (existingBarcode) {
        throw createError(errorResponse(event, 400, 'Barcode already exists in this business'))
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        barcode: data.barcode || product.barcode,
        name: data.name,
        price: data.price,
        stock: data.stock,
        unit: data.unit,
        categoryId: data.categoryId,
        ...(data.isActive !== undefined && { isActive: data.isActive })
      }
    })

    return successResponse(updated, 'Product updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
