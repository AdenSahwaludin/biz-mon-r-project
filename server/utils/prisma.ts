import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Deteksi jenis database dari DATABASE_URL:
 *   - "file:./dev.db"          → SQLite lokal (Prisma default)
 *   - "libsql://..." / "https://..." → Turso Cloud (pakai TURSO_AUTH_TOKEN)
 */
function createPrismaClient(): PrismaClient {
  const rawUrl = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '')

  const isTurso = rawUrl.startsWith('libsql://') || rawUrl.startsWith('https://')

  if (isTurso) {
    const rawToken = process.env.TURSO_AUTH_TOKEN
    const authToken = rawToken
      ? rawToken.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '')
      : undefined

    // LibSQL client needs https:// URL
    let url = rawUrl
    if (url.startsWith('libsql://')) {
      url = url.replace('libsql://', 'https://')
    }

    try {
      const libsql = createClient({ url, authToken })
      const adapter = new PrismaLibSQL(libsql)
      console.log('[prisma] Connected to Turso Cloud DB:', rawUrl)
      return new PrismaClient({ adapter } as any)
    } catch (e) {
      console.error('[prisma] Failed to initialize Turso adapter, falling back to default:', e)
    }
  }

  // SQLite lokal atau fallback
  console.log('[prisma] Using local SQLite database:', rawUrl || '(default)')
  return new PrismaClient()
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient()
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient()
  }
  prisma = global.__prisma
}

export { prisma }
