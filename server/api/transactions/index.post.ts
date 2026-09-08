import { z } from 'zod'
import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const detailSchema = z.object({
  productId: z.string().min(1),
  qty: z.number().int('Qty harus bilangan bulat').min(1, 'Qty minimal 1').max(1000, 'Qty maksimal 1000')
})

const createSchema = z.object({
  branchId: z.string().min(1),
  paymentMethod: z.enum(['Tunai', 'QRIS', 'CASH', 'Transfer', 'EDC']).default('Tunai'),
  details: z.array(detailSchema).min(1).max(100),
  clientMutationId: z.string().max(64).optional()
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

          // Merge duplicate productId agar decrement atomik benar
          const merged = new Map<string, number>()
          for (const item of data.details) {
            merged.set(item.productId, (merged.get(item.productId) || 0) + item.qty)
          }

          let total = 0
          const transactionDetails = []

          for (const [productId, qty] of merged) {
            const product = await tx.product.findUnique({ where: { id: productId } })

            if (!product) {
              throw createError(errorResponse(event, 400, `Product with ID ${productId} not found`))
            }
            if (!product.isActive) {
              throw createError(errorResponse(event, 400, `Product ${product.name} is inactive and cannot be sold`))
            }
            // Validasi produk satu bisnis dengan cabang transaksi
            if (product.businessId !== branch.businessId) {
              throw createError(errorResponse(event, 400, `Produk "${product.name}" bukan milik bisnis cabang ini`))
            }

            const subtotal = product.price * qty
            total += subtotal

            transactionDetails.push({
              productId: product.id,
              snapshotPrice: product.price,
              qty,
              subtotal
            })
          }

          const normalizedPayment = data.paymentMethod === 'CASH' ? 'Tunai' : data.paymentMethod

          const created = await tx.transaction.create({
            data: {
              id: customId,
              total,
              paymentMethod: normalizedPayment,
              cashierId: user.id,
              branchId: data.branchId,
              details: {
                create: transactionDetails
              }
            },
            include: { details: true }
          })

          // Decrement atomik dengan guard stok: gagal jika stok kurang (cegah oversell konkuren)
          for (const [productId, qty] of merged) {
            const dec = await tx.product.updateMany({
              where: { id: productId, stock: { gte: qty } },
              data: { stock: { decrement: qty } }
            })
            if (dec.count === 0) {
              throw createError(errorResponse(event, 400, 'Stok produk tidak mencukupi (transaksi bersamaan, silakan ulangi)'))
            }
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