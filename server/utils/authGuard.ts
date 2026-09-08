import { H3Event } from 'h3'
import { errorResponse } from './response'
import { prisma } from './prisma'

export function requireAuth(event: H3Event) {
  if (!event.context.user) {
    throw createError(errorResponse(event, 401, 'Unauthorized'))
  }
  return event.context.user
}

export function requireAdmin(event: H3Event) {
  const user = requireAuth(event)
  if (user.role !== 'ADMIN') {
    throw createError(errorResponse(event, 403, 'Forbidden: Admin access required'))
  }
  return user
}

/** Kumpulan businessId dari cabang yang ditugaskan ke user (untuk scope KARYAWAN). */
export async function getUserBusinessIds(userId: string): Promise<Set<string>> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      branch: { select: { businessId: true } },
      branches: { select: { businessId: true } }
    }
  })
  const ids = new Set<string>()
  if ((dbUser as any)?.branch?.businessId) ids.add((dbUser as any).branch.businessId)
  if ((dbUser as any)?.branches) {
    for (const b of (dbUser as any).branches) {
      if (b?.businessId) ids.add(b.businessId)
    }
  }
  return ids
}

/**
 * Katalog (produk/kategori): ADMIN bebas semua bisnis,
 * KARYAWAN hanya bisnis dari cabangnya. Dipakai agar menu Kelola
 * tetap bisa dibuka karyawan tapi tidak bisa utak-atik bisnis lain.
 */
export async function assertBusinessAccess(event: H3Event, user: any, businessId: string | undefined | null) {
  if (user?.role === 'ADMIN') return
  if (!businessId) {
    throw createError(errorResponse(event, 403, 'Forbidden: no business access'))
  }
  const allowed = await getUserBusinessIds(user.id)
  if (!allowed.has(businessId)) {
    throw createError(errorResponse(event, 403, 'Forbidden: bukan bisnis cabang Anda'))
  }
}
