import 'dotenv/config'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

async function main() {
  console.log('🧹 Starting cleanup of Turso Database...')

  let tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const rawToken = process.env.TURSO_AUTH_TOKEN
  const authToken = rawToken ? rawToken.replace(/\s+/g, '') : undefined

  if (!tursoUrl || (!tursoUrl.startsWith('libsql://') && !tursoUrl.startsWith('https://'))) {
    console.error('❌ TURSO_DATABASE_URL must be defined in .env')
    process.exit(1)
  }

  if (tursoUrl.startsWith('libsql://')) {
    tursoUrl = tursoUrl.replace('libsql://', 'https://')
  }

  const libsql = createClient({ url: tursoUrl, authToken })
  const adapter = new PrismaLibSQL(libsql)
  const tursoPrisma = new PrismaClient({ adapter } as any)

  try {
    // 1. Delete all TransactionDetails & Transactions
    console.log('🗑️ Deleting all dummy transactions and details...')
    const deletedDetails = await tursoPrisma.transactionDetail.deleteMany()
    console.log(`   - TransactionDetails deleted: ${deletedDetails.count}`)

    const deletedTrx = await tursoPrisma.transaction.deleteMany()
    console.log(`   - Transactions deleted: ${deletedTrx.count}`)

    // 2. Delete non-Sembako products
    console.log('🗑️ Deleting dummy products outside Warung Sembako...')
    const deletedProducts = await tursoPrisma.product.deleteMany({
      where: {
        business: {
          slug: { not: 'sembako' }
        }
      }
    })
    console.log(`   - Dummy Products deleted: ${deletedProducts.count}`)

    // 3. Delete non-Sembako categories
    console.log('🗑️ Deleting dummy categories outside Warung Sembako...')
    const deletedCategories = await tursoPrisma.category.deleteMany({
      where: {
        business: {
          slug: { not: 'sembako' }
        }
      }
    })
    console.log(`   - Dummy Categories deleted: ${deletedCategories.count}`)

    // 4. Delete dummy users except 'ravidgumelar'
    console.log('🗑️ Deleting dummy users except ravidgumelar...')
    const deletedUsers = await tursoPrisma.user.deleteMany({
      where: {
        username: { not: 'ravidgumelar' }
      }
    })
    console.log(`   - Users deleted: ${deletedUsers.count}`)

    // 5. Ensure ravidgumelar exists and is ADMIN with no branch restriction
    const ravid = await tursoPrisma.user.findUnique({ where: { username: 'ravidgumelar' } })
    if (ravid) {
      await tursoPrisma.user.update({
        where: { id: ravid.id },
        data: { role: 'ADMIN', branchId: null, isActive: true }
      })
      console.log('✅ User ravidgumelar updated to active ADMIN.')
    } else {
      console.log('⚠️ User ravidgumelar not found in Turso DB!')
    }

    // 6. Report remaining counts
    const remainingUsers = await tursoPrisma.user.count()
    const remainingProducts = await tursoPrisma.product.count()
    const remainingCategories = await tursoPrisma.category.count()
    const remainingTransactions = await tursoPrisma.transaction.count()

    console.log('\n📊 Summary of Turso Database after cleanup:')
    console.log(`   - Remaining Users: ${remainingUsers}`)
    console.log(`   - Remaining Products (Sembako): ${remainingProducts}`)
    console.log(`   - Remaining Categories (Sembako): ${remainingCategories}`)
    console.log(`   - Remaining Transactions: ${remainingTransactions}`)

    console.log('\n🎉 Turso DB cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Failed to clean Turso DB:', error)
    process.exitCode = 1
  } finally {
    await tursoPrisma.$disconnect()
  }
}

main()
