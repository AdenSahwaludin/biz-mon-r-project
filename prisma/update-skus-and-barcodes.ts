import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { generateReadableSku } from '../server/utils/skuGenerator'

async function updateProductsSkuAndClearBarcodes(prisma: PrismaClient, dbLabel: string) {
  console.log(`\n🔄 Updating SKUs and clearing barcodes for ${dbLabel}...`)

  const businesses = await prisma.business.findMany({
    include: {
      categories: true,
      products: true
    }
  })

  let totalUpdated = 0

  for (const biz of businesses) {
    const categoryMap = new Map<string, string>()
    biz.categories.forEach(c => categoryMap.set(c.id, c.name))

    const assignedSkusInBiz = new Set<string>()

    for (const prod of biz.products) {
      const catName = prod.categoryId ? categoryMap.get(prod.categoryId) || '' : ''
      const baseSku = generateReadableSku(prod.name, biz.slug || biz.name, catName)

      let candidateSku = baseSku
      let counter = 1

      while (assignedSkusInBiz.has(candidateSku)) {
        counter++
        candidateSku = `${baseSku}-${String(counter).padStart(2, '0')}`
      }

      assignedSkusInBiz.add(candidateSku)

      await prisma.product.update({
        where: { id: prod.id },
        data: {
          sku: candidateSku,
          barcode: null // Kosongkan barcode untuk semua produk sesuai instruksi
        }
      })

      totalUpdated++
    }

    console.log(`   └─ ${biz.name}: ${biz.products.length} produk di-update SKU-nya & barcode dikosongkan.`)
  }

  console.log(`✅ Total produk di-update di ${dbLabel}: ${totalUpdated}`)
}

async function main() {
  console.log('🚀 Starting SKU Update and Barcode Clearance script...')

  // 1. Local SQLite DB
  const localPrisma = new PrismaClient()
  try {
    await updateProductsSkuAndClearBarcodes(localPrisma, 'Local SQLite Database')
  } catch (err) {
    console.error('❌ Failed updating local DB:', err)
  } finally {
    await localPrisma.$disconnect()
  }

  // 2. Production Turso DB
  let tursoUrl = process.env.TURSO_DATABASE_URL?.trim()
  const rawToken = process.env.TURSO_AUTH_TOKEN
  const authToken = rawToken ? rawToken.replace(/\s+/g, '') : undefined

  if (tursoUrl) {
    if (tursoUrl.startsWith('libsql://')) {
      tursoUrl = tursoUrl.replace('libsql://', 'https://')
    }

    try {
      const libsql = createClient({ url: tursoUrl, authToken })

      // Fix barcode column constraint in Turso if it was NOT NULL
      try {
        console.log('🔄 Checking/fixing Turso Product.barcode column nullability...')
        await libsql.execute(`DROP INDEX IF EXISTS "Product_barcode_businessId_key";`)
        await libsql.execute(`ALTER TABLE "Product" DROP COLUMN "barcode";`)
        await libsql.execute(`ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;`)
        await libsql.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "Product_barcode_businessId_key" ON "Product"("barcode", "businessId");`)
        console.log('   ✅ Turso Product.barcode column is now NULLABLE.')
      } catch (e: any) {
        console.log('   Notice:', e.message || e)
      }

      const adapter = new PrismaLibSQL(libsql)
      const tursoPrisma = new PrismaClient({ adapter } as any)

      await updateProductsSkuAndClearBarcodes(tursoPrisma, 'Production Turso Cloud Database')
      await tursoPrisma.$disconnect()
    } catch (err) {
      console.error('❌ Failed updating production Turso DB:', err)
    }
  } else {
    console.log('⚠️ TURSO_DATABASE_URL is not configured in .env')
  }

  console.log('\n🎉 Finished updating SKUs and clearing barcodes!')
}

main()
