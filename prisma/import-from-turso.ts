import 'dotenv/config'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('🚀 Starting import process from Turso to Local SQLite...')

  let tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const rawToken = process.env.TURSO_AUTH_TOKEN
  const authToken = rawToken ? rawToken.replace(/\s+/g, '') : undefined

  if (!tursoUrl || (!tursoUrl.startsWith('libsql://') && !tursoUrl.startsWith('https://'))) {
    console.error('❌ TURSO_DATABASE_URL must be defined in .env and start with libsql:// or https://')
    process.exit(1)
  }

  if (tursoUrl.startsWith('libsql://')) {
    tursoUrl = tursoUrl.replace('libsql://', 'https://')
  }

  // Client 1: Turso Production DB
  console.log('📡 Connecting to Turso Production DB...')
  const libsql = createClient({ url: tursoUrl, authToken })
  const adapter = new PrismaLibSQL(libsql)
  const tursoPrisma = new PrismaClient({ adapter } as any)

  // Client 2: Local SQLite DB
  const localDbUrl = process.env.DATABASE_URL || 'file:./dev.db'
  console.log(`🏠 Connecting to Local SQLite DB (${localDbUrl})...`)
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: localDbUrl
      }
    }
  })

  try {
    // 1. Fetch data from Turso
    console.log('📥 Fetching data from Turso...')
    const businesses = await tursoPrisma.business.findMany()
    const branches = await tursoPrisma.branch.findMany()
    const categories = await tursoPrisma.category.findMany()
    const products = await tursoPrisma.product.findMany()
    const users = await tursoPrisma.user.findMany()
    const transactions = await tursoPrisma.transaction.findMany()
    const transactionDetails = await tursoPrisma.transactionDetail.findMany()

    console.log(`📊 Summary of data fetched from Turso:`)
    console.log(`   - Business: ${businesses.length}`)
    console.log(`   - Branch: ${branches.length}`)
    console.log(`   - Category: ${categories.length}`)
    console.log(`   - Product: ${products.length}`)
    console.log(`   - User: ${users.length}`)
    console.log(`   - Transaction: ${transactions.length}`)
    console.log(`   - TransactionDetail: ${transactionDetails.length}`)

    // 2. Clear local database in reverse FK dependency order
    console.log('🧹 Clearing local SQLite database tables...')
    await localPrisma.transactionDetail.deleteMany()
    await localPrisma.transaction.deleteMany()
    await localPrisma.product.deleteMany()
    await localPrisma.category.deleteMany()
    await localPrisma.user.deleteMany()
    await localPrisma.branch.deleteMany()
    await localPrisma.business.deleteMany()

    // 3. Insert data into local database
    console.log('📤 Inserting data into local SQLite database...')
    if (businesses.length > 0) {
      await localPrisma.business.createMany({ data: businesses })
      console.log(`   ✅ Business: ${businesses.length} records inserted`)
    }

    if (branches.length > 0) {
      await localPrisma.branch.createMany({ data: branches })
      console.log(`   ✅ Branch: ${branches.length} records inserted`)
    }

    if (categories.length > 0) {
      await localPrisma.category.createMany({ data: categories })
      console.log(`   ✅ Category: ${categories.length} records inserted`)
    }

    if (users.length > 0) {
      await localPrisma.user.createMany({ data: users })
      console.log(`   ✅ User: ${users.length} records inserted`)
    }

    if (products.length > 0) {
      await localPrisma.product.createMany({ data: products })
      console.log(`   ✅ Product: ${products.length} records inserted`)
    }

    if (transactions.length > 0) {
      await localPrisma.transaction.createMany({ data: transactions })
      console.log(`   ✅ Transaction: ${transactions.length} records inserted`)
    }

    if (transactionDetails.length > 0) {
      await localPrisma.transactionDetail.createMany({ data: transactionDetails })
      console.log(`   ✅ TransactionDetail: ${transactionDetails.length} records inserted`)
    }

    console.log('🎉 Database successfully imported from Turso to local SQLite!')
  } catch (error) {
    console.error('❌ Failed to import database from Turso:', error)
    process.exitCode = 1
  } finally {
    await tursoPrisma.$disconnect()
    await localPrisma.$disconnect()
  }
}

main()
