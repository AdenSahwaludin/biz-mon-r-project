import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)
  const businessId = query.businessId as string | undefined
  const branchId = query.branchId as string | undefined
  const paymentMethod = query.paymentMethod as string | undefined
  const startDateStr = (query.startDate || query.date) as string | undefined
  const endDateStr = (query.endDate || query.date) as string | undefined

  const where: any = {}
  if (branchId) {
    where.branchId = branchId
  } else if (businessId) {
    where.branch = { businessId }
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod
  }

  if (startDateStr || endDateStr) {
    where.createdAt = {}
    if (startDateStr) {
      where.createdAt.gte = new Date(`${startDateStr}T00:00:00.000Z`)
    }
    if (endDateStr) {
      where.createdAt.lte = new Date(`${endDateStr}T23:59:59.999Z`)
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      total: true,
      createdAt: true,
      paymentMethod: true,
      branch: {
        select: {
          id: true,
          name: true,
          business: { select: { id: true, name: true } }
        }
      }
    }
  })

  let totalOmzet = 0
  let cashRevenue = 0
  let qrisRevenue = 0
  let daily = 0
  let dailyCash = 0
  let dailyQris = 0
  let weekly = 0
  let monthly = 0

  const omzetPerBusiness: Record<string, { name: string, total: number }> = {}
  const timeseries: Record<string, { tanggal: string, transaksi: number, omzet: number, cash: number, qris: number }> = {}

  const now = new Date()
  const startOfTodayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const past7DaysMs = startOfTodayMs - (6 * 24 * 60 * 60 * 1000)
  const past30DaysMs = startOfTodayMs - (29 * 24 * 60 * 60 * 1000)

  transactions.forEach(t => {
    totalOmzet += t.total
    const isTunai = t.paymentMethod === 'Tunai'
    const isQris = t.paymentMethod === 'QRIS'

    if (isTunai) cashRevenue += t.total
    if (isQris) qrisRevenue += t.total

    // By business
    const bizId = t.branch.business.id
    if (!omzetPerBusiness[bizId]) {
      omzetPerBusiness[bizId] = { name: t.branch.business.name, total: 0 }
    }
    omzetPerBusiness[bizId].total += t.total

    // Time ranges
    const tDate = new Date(t.createdAt)
    const tTime = tDate.getTime()

    if (tTime >= startOfTodayMs) {
      daily += t.total
      if (isTunai) dailyCash += t.total
      if (isQris) dailyQris += t.total
    }
    if (tTime >= past7DaysMs) weekly += t.total
    if (tTime >= past30DaysMs) monthly += t.total

    // Timeseries
    const dateStr = tDate.toISOString().split('T')[0]
    if (!timeseries[dateStr]) {
      timeseries[dateStr] = { tanggal: dateStr, transaksi: 0, omzet: 0, cash: 0, qris: 0 }
    }
    timeseries[dateStr].transaksi += 1
    timeseries[dateStr].omzet += t.total
    if (isTunai) timeseries[dateStr].cash += t.total
    if (isQris) timeseries[dateStr].qris += t.total
  })

  return successResponse({
    summary: { daily, dailyCash, dailyQris, weekly, monthly, totalOmzet, cashRevenue, qrisRevenue, transactionCount: transactions.length },
    byBusiness: Object.values(omzetPerBusiness),
    timeseries: Object.values(timeseries).sort((a, b) => a.tanggal.localeCompare(b.tanggal))
  })
})
