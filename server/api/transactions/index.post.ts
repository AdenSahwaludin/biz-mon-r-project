import { z } from 'zod'
import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const detailSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().min(1)
})

const createSchema = z.object({
  branchId: z.string().min(1),
  paymentMethod: z.string().default('Tunai'),
  details: z.array(detailSchema).min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    if (user.role === 'KARYAWAN' && user.branchId !== data.branchId) {
      throw createError(errorResponse(event, 403, 'Forbidden: You can only create transactions for your assigned branch'))
    }

    // Verify branch is active
    const branch = await prisma.branch.findUnique({ where: { id: data.branchId }, include: { business: true } })
    if (!branch || !branch.isActive) {
      throw createError(errorResponse(event, 400, 'Branch is not active or not found'))
    }
    if (!branch.business.isActive) {
      throw createError(errorResponse(event, 400, 'The parent business is not active'))
    }

    let total = 0
    const transactionDetails = []

    for (const item of data.details) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      
      if (!product) {
        throw createError(errorResponse(event, 400, `Product with ID ${item.productId} not found`))
      }
      if (!product.isActive) {
        throw createError(errorResponse(event, 400, `Product ${product.name} is inactive and cannot be sold`))
      }
      if (product.businessId !== branch.businessId) {
        throw createError(errorResponse(event, 400, `Product ${product.name} does not belong to this business`))
      }

      const subtotal = product.price * item.qty
      total += subtotal

      transactionDetails.push({
        productId: product.id,
        snapshotPrice: product.price,
        qty: item.qty,
        subtotal
      })

      // Update product stock
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.qty } }
      })
    }

    const now = new Date()
    const d = now.getDate().toString().padStart(2, '0')
    const m = (now.getMonth() + 1).toString().padStart(2, '0')
    const y = now.getFullYear().toString().substring(2)
    const random = Math.floor(1000 + Math.random() * 9000)
    const customId = `TRX-${y}${m}${d}-${random}`

    const transaction = await prisma.transaction.create({
      data: {
        id: customId,
        total,
        paymentMethod: data.paymentMethod,
        cashierId: user.id,
        branchId: data.branchId,
        details: {
          create: transactionDetails
        }
      },
      include: { details: true }
    })

    return successResponse(transaction, 'Transaction created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
