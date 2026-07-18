import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL)?.trim()
  const rawToken = process.env.TURSO_AUTH_TOKEN
  const authToken = rawToken ? rawToken.replace(/\s+/g, '') : undefined

  if (url && (url.startsWith('libsql://') || url.startsWith('https://'))) {
    const libsql = createClient({
      url,
      authToken
    })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as any)
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
