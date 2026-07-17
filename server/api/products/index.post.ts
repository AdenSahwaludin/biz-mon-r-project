import { z } from 'zod'
import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  barcode: z.string().optional().nullable(),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  price: z.number().min(0, 'Harga tidak boleh negatif').max(2000000000, 'Harga terlalu besar'),
  stock: z.number().min(0, 'Stok tidak boleh negatif').max(2000000000, 'Stok terlalu besar').default(0),
  unit: z.string().min(1).default('pcs'),
  businessId: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true)
})

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    if (data.barcode) {
      const existingBarcode = await prisma.product.findUnique({
        where: {
          barcode_businessId: {
            barcode: data.barcode,
            businessId: data.businessId
          }
        }
      })

      if (existingBarcode) {
        throw createError(errorResponse(event, 400, 'Barcode already exists in this business'))
      }
    }

    const product = await prisma.product.create({
      data: {
        barcode: data.barcode || `BRC-${Date.now()}`,
        name: data.name,
        price: data.price,
        stock: data.stock,
        unit: data.unit,
        businessId: data.businessId,
        categoryId: data.categoryId,
        isActive: data.isActive
      }
    })

    return successResponse(product, 'Product created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
