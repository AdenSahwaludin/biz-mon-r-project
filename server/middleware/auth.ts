import { verifyToken } from '../utils/jwt'
import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  let token: string | undefined

  // Check Authorization header first
  const authHeader = getHeader(event, 'authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else {
    // Fallback to auth_token cookie
    token = getCookie(event, 'auth_token')
  }

  if (token) {
    const decoded: any = verifyToken(token)
    if (decoded && typeof decoded === 'object' && decoded.id) {
      // Revalidasi ke DB: user yang dihapus/dinonaktifkan langsung kehilangan akses
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, isActive: true, role: true }
        })
        if (!dbUser || !dbUser.isActive) {
          return
        }
        // Pakai role fresh dari DB agar perubahan role langsung berlaku
        event.context.user = { ...decoded, role: dbUser.role }
      } catch {
        return
      }
    }
  }
})
