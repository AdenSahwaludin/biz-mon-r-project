import { z } from 'zod'
import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'
import { generateReadableSku } from '../../utils/skuGenerator'

const createSchema = z.object({
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  price: z.number().min(0, 'Harga tidak boleh negatif').max(2000000000, 'Harga terlalu besar'),
  stock: z.number().min(0, 'Stok tidak boleh negatif').max(2000000000, 'Stok terlalu besar').default(9999999),
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
      // Auto-generate human-readable SKU (e.g. MY-BML-2L or WNT-CHILI-OIL)
      const biz = await prisma.business.findUnique({
        where: { id: data.businessId },
        select: { name: true, slug: true }
      })
      let categoryName = ''
      if (data.categoryId) {
        const cat = await prisma.category.findUnique({
          where: { id: data.categoryId },
          select: { name: true }
        })
        if (cat) categoryName = cat.name
      }

      let baseSku = generateReadableSku(data.name, biz?.slug || biz?.name, categoryName)
      let candidate = baseSku
      let counter = 1

      while (await prisma.product.findFirst({ where: { sku: candidate, businessId: data.businessId } })) {
        counter++
        candidate = `${baseSku}-${String(counter).padStart(2, '0')}`
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
