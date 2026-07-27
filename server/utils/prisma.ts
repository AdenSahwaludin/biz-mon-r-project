import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const isProduction = process.env.NODE_ENV === 'production'
  const useTursoExplicit = process.env.USE_TURSO === 'true'
  const useTurso = useTursoExplicit || (isProduction && Boolean(process.env.TURSO_DATABASE_URL))

  if (useTurso && process.env.TURSO_DATABASE_URL) {
    let rawUrl = process.env.TURSO_DATABASE_URL.trim().replace(/^["']|["']$/g, '')
    const rawToken = process.env.TURSO_AUTH_TOKEN
    const authToken = rawToken ? rawToken.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '') : undefined

    let url = rawUrl
    if (url.startsWith('libsql://')) {
      url = url.replace('libsql://', 'https://')
    }

    try {
      const libsql = createClient({
        url,
        authToken
      })
      const adapter = new PrismaLibSQL(libsql)
      return new PrismaClient({ adapter } as any)
    } catch (e) {
      console.error('Failed to initialize Prisma LibSQL adapter:', e)
    }
  }

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
