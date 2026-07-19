import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  
  const query = getQuery(event)
  const businessId = query.businessId as string | undefined
  const branchId = query.branchId as string | undefined
  const paymentMethod = query.paymentMethod as string | undefined

  const where: any = {}
  if (branchId) {
    where.branchId = branchId
  } else if (businessId) {
    where.branch = { businessId }
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod
  }

  const transactions = await prisma.transaction.findMany({
    where,
    select: { total: true, createdAt: true, paymentMethod: true, branch: { select: { id: true, name: true, business: { select: { id: true, name: true } } } } }
  })

  let totalOmzet = 0
  const omzetPerBusiness: Record<string, { name: string, total: number }> = {}
  const timeseries: Record<string, { tanggal: string, transaksi: number, omzet: number }> = {}

  const now = new Date()
  let daily = 0
  let weekly = 0
  let monthly = 0

  transactions.forEach(t => {
    totalOmzet += t.total

    // By business
    const bizId = t.branch.business.id
    if (!omzetPerBusiness[bizId]) {
      omzetPerBusiness[bizId] = { name: t.branch.business.name, total: 0 }
    }
    omzetPerBusiness[bizId].total += t.total

    // Time ranges
    const tDate = new Date(t.createdAt)
    const diffTime = Math.abs(now.getTime() - tDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 1) daily += t.total
    if (diffDays <= 7) weekly += t.total
    if (diffDays <= 30) monthly += t.total

    // Timeseries
    const dateStr = tDate.toISOString().split('T')[0]
    if (!timeseries[dateStr]) {
      timeseries[dateStr] = { tanggal: dateStr, transaksi: 0, omzet: 0 }
    }
    timeseries[dateStr].transaksi += 1
    timeseries[dateStr].omzet += t.total
  })

  return successResponse({
    summary: { daily, weekly, monthly, totalOmzet, transactionCount: transactions.length },
    byBusiness: Object.values(omzetPerBusiness),
    timeseries: Object.values(timeseries).sort((a, b) => a.tanggal.localeCompare(b.tanggal))
  })
})
