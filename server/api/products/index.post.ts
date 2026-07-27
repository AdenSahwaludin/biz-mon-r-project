import { z } from 'zod'
import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  sku: z.string().optional().nullable(),
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
    requireAuth(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    let finalSku = data.sku ? data.sku.trim() : ''
    let finalBarcode = data.barcode ? data.barcode.trim() : ''

    // Check SKU Uniqueness if provided
    if (finalSku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku: finalSku,
          businessId: data.businessId
        }
      })
      if (existingSku) {
        return errorResponse(event, 400, 'SKU sudah digunakan di bisnis ini')
      }
    } else {
      // Auto-generate SKU (e.g. WS-001 or ET-001)
      const count = await prisma.product.count({
        where: { businessId: data.businessId }
      })
      const biz = await prisma.business.findUnique({
        where: { id: data.businessId },
        select: { name: true }
      })

      const rawPrefix = biz?.name ? biz.name.split(' ').map(w => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) : 'PRD'
      const prefix = rawPrefix.length > 0 ? rawPrefix : 'PRD'
      
      let candidate = `${prefix}-${String(count + 1).padStart(3, '0')}`
      let counter = count + 1

      while (await prisma.product.findFirst({ where: { sku: candidate, businessId: data.businessId } })) {
        counter++
        candidate = `${prefix}-${String(counter).padStart(3, '0')}`
      }
      finalSku = candidate
    }

    // Check Barcode Uniqueness if provided
    if (finalBarcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: {
          barcode: finalBarcode,
          businessId: data.businessId
        }
      })
      if (existingBarcode) {
        return errorResponse(event, 400, 'Barcode sudah digunakan di bisnis ini')
      }
    }

    const product = await prisma.product.create({
      data: {
        sku: finalSku,
        barcode: finalBarcode || null,
        name: data.name,
        price: data.price,
        stock: data.stock,
        unit: data.unit,
        businessId: data.businessId,
        categoryId: data.categoryId || null,
        isActive: data.isActive
      }
    })

    return successResponse(product, 'Produk berhasil ditambahkan')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
