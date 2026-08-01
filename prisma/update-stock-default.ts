import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

async function updateStockInDatabase() {
  console.log('📦 Starting product stock default update (Setting stock to 9999999)...')

  // 1. Update Local SQLite Database
  console.log('\n--- 1. Local SQLite Database ---')
  const localPrisma = new PrismaClient()
  try {
    const localResult = await localPrisma.product.updateMany({
      data: {
        stock: 9999999
      }
    })
    console.log(`✅ Local DB: Successfully updated stock to 9999999 for ${localResult.count} products.`)
  } catch (err) {
    console.error('❌ Failed to update local DB:', err)
  } finally {
    await localPrisma.$disconnect()
  }

  // 2. Update Production Turso Cloud Database (if configured)
  console.log('\n--- 2. Production Turso Cloud Database ---')
  let tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const rawToken = process.env.TURSO_AUTH_TOKEN
  const authToken = rawToken ? rawToken.replace(/\s+/g, '') : undefined

  if (tursoUrl) {
    if (tursoUrl.startsWith('libsql://')) {
      tursoUrl = tursoUrl.replace('libsql://', 'https://')
    }

    try {
      const libsql = createClient({ url: tursoUrl, authToken })
      const adapter = new PrismaLibSQL(libsql)
      const tursoPrisma = new PrismaClient({ adapter } as any)

      const tursoResult = await tursoPrisma.product.updateMany({
        data: {
          stock: 9999999
        }
      })
      console.log(`✅ Production Turso DB: Successfully updated stock to 9999999 for ${tursoResult.count} products.`)
      await tursoPrisma.$disconnect()
    } catch (err) {
      console.error('❌ Failed to update Turso production DB:', err)
    }
  } else {
    console.log('⚠️ TURSO_DATABASE_URL is not set in .env, skipping Turso update.')
  }

  console.log('\n🎉 Finished updating product stock defaults!')
}

updateStockInDatabase()
