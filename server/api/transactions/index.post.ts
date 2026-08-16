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

function formatTrxId(now: Date, seq: number): string {
  const d = now.getDate().toString().padStart(2, '0')
  const m = (now.getMonth() + 1).toString().padStart(2, '0')
  const y = now.getFullYear().toString().substring(2)
  return `TRX-${d}${m}${y}-${seq.toString().padStart(4, '0')}`
}

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    if (user.role === 'KARYAWAN') {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { branches: true }
      })
      const userBranchIds = [
        ...(dbUser?.branchId ? [dbUser.branchId] : []),
        ...(dbUser?.branches ? dbUser.branches.map(b => b.id) : [])
      ]
      if (userBranchIds.length > 0 && !userBranchIds.includes(data.branchId)) {
        throw createError(errorResponse(event, 403, 'Forbidden: You can only create transactions for your assigned branches'))
      }
    }

    // Verify branch is active
    const branch = await prisma.branch.findUnique({ where: { id: data.branchId }, include: { business: true } })
    if (!branch || !branch.isActive) {
      throw createError(errorResponse(event, 400, 'Branch is not active or not found'))
    }
    if (!branch.business.isActive) {
      throw createError(errorResponse(event, 400, 'The parent business is not active'))
    }

    // Generate transaction inside a DB transaction so stock decrement,
    // ID sequence and transaction creation are atomic. Retry on ID collision
    // (two concurrent requests may compute the same sequence number).
    let transaction: any = null
    let attempts = 0
    const maxAttempts = 5

    while (!transaction && attempts < maxAttempts) {
      attempts++

      try {
        transaction = await prisma.$transaction(async (tx) => {
          const now = new Date()
          const datePrefix = `TRX-${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear().toString().substring(2)}-`

          const latestTrxToday = await tx.transaction.findFirst({
            where: { id: { startsWith: datePrefix } },
            orderBy: { createdAt: 'desc' }
          })

          let nextSeq = 1
          if (latestTrxToday) {
            const parts = latestTrxToday.id.split('-')
            const lastNumber = parseInt(parts[parts.length - 1], 10)
            if (!isNaN(lastNumber)) {
              nextSeq = lastNumber + 1
            }
          }

          const customId = formatTrxId(now, nextSeq)

          let total = 0
          const transactionDetails = []

          for (const item of data.details) {
            const product = await tx.product.findUnique({ where: { id: item.productId } })

            if (!product) {
              throw createError(errorResponse(event, 400, `Product with ID ${item.productId} not found`))
            }
            if (!product.isActive) {
              throw createError(errorResponse(event, 400, `Product ${product.name} is inactive and cannot be sold`))
            }
            if (product.stock < item.qty) {
              throw createError(errorResponse(event, 400, `Stok produk "${product.name}" tidak mencukupi (Tersisa: ${product.stock}, diminta: ${item.qty})`))
            }

            const subtotal = product.price * item.qty
            total += subtotal

            transactionDetails.push({
              productId: product.id,
              snapshotPrice: product.price,
              qty: item.qty,
              subtotal
            })
          }

          const created = await tx.transaction.create({
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

          // Decrement stock inside the same DB transaction:
          // if this fails, everything above is rolled back
          for (const item of data.details) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.qty } }
            })
          }

          return created
        })
      } catch (e: any) {
        // P2002 = duplicate primary key (ID collision), P2034 = write conflict
        if ((e.code === 'P2002' || e.code === 'P2034') && attempts < maxAttempts) {
          continue
        }
        throw e
      }
    }

    return successResponse(transaction, 'Transaction created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})