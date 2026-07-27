import 'dotenv/config'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaClient } from '@prisma/client'

const DIMSUM_WONTON_DATA = {
  name: 'Dimsum & Xie Wonton',
  slug: 'dimsum-xie-wonton',
  icon: 'Soup',
  color: '#F43F5E',
  branches: ['Samakrombeng', 'Sabrang Wetan'],
  categories: [
    {
      name: 'Dimsum Original',
      products: [
        { barcode: 'DXW-001', name: 'Dimsum Original (4pcs Mini)', price: 6000, unit: 'porsi', stock: 100 },
        { barcode: 'DXW-002', name: 'Dimsum Original (7pcs Mini)', price: 10000, unit: 'porsi', stock: 100 },
        { barcode: 'DXW-003', name: 'Dimsum Original (4pcs Jumbo)', price: 10000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Dimsum Mentai',
      products: [
        { barcode: 'DXW-004', name: 'Dimsum Mentai (5pcs Mini)', price: 15000, unit: 'porsi', stock: 100 },
        { barcode: 'DXW-005', name: 'Dimsum Mentai (7pcs Mini)', price: 20000, unit: 'porsi', stock: 100 },
        { barcode: 'DXW-006', name: 'Dimsum Mentai (4pcs Jumbo)', price: 20000, unit: 'porsi', stock: 100 },
        { barcode: 'DXW-007', name: 'Dimsum Mentai (6pcs Jumbo)', price: 28000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Wonton',
      products: [
        { barcode: 'DXW-008', name: 'Wonton Spicy / Kuah (isi 4pcs)', price: 10000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Bakso',
      products: [
        { barcode: 'DXW-009', name: 'Bakso Ayam / Sapi / Ikan', price: 1000, unit: 'pcs', stock: 200 },
      ]
    },
    {
      name: 'Dimsum Udang',
      products: [
        { barcode: 'DXW-010', name: 'Dimsum Udang (1 Pcs)', price: 4000, unit: 'pcs', stock: 100 },
        { barcode: 'DXW-011', name: 'Dimsum Udang (isi 3pcs)', price: 10000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Ekado',
      products: [
        { barcode: 'DXW-012', name: 'Ekado (1 Pcs)', price: 4000, unit: 'pcs', stock: 100 },
        { barcode: 'DXW-013', name: 'Ekado (isi 3pcs)', price: 10000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Rollade Nori Salmon',
      products: [
        { barcode: 'DXW-014', name: 'Rollade Dimsum Nori Salmon (1 Pcs)', price: 4000, unit: 'pcs', stock: 100 },
        { barcode: 'DXW-015', name: 'Rollade Dimsum Nori Salmon (isi 3pcs)', price: 10000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Lumpia Kulit Tahu',
      products: [
        { barcode: 'DXW-016', name: 'Lumpia Dimsum Kulit Tahu (1 Pcs)', price: 4000, unit: 'pcs', stock: 100 },
        { barcode: 'DXW-017', name: 'Lumpia Dimsum Kulit Tahu (isi 3pcs)', price: 10000, unit: 'porsi', stock: 100 },
      ]
    },
    {
      name: 'Mie',
      products: [
        { barcode: 'DXW-018', name: 'Mie Sakura', price: 4000, unit: 'pcs', stock: 100 },
      ]
    }
  ]
}

async function seedToTarget(prisma: PrismaClient, name: string) {
  console.log(`\n🌱 Seeding '${DIMSUM_WONTON_DATA.name}' to ${name}...`)

  // Find or create business
  let biz = await prisma.business.findFirst({
    where: {
      OR: [
        { slug: DIMSUM_WONTON_DATA.slug },
        { name: { contains: 'Dimsum' } }
      ]
    }
  })

  if (!biz) {
    biz = await prisma.business.create({
      data: {
        name: DIMSUM_WONTON_DATA.name,
        slug: DIMSUM_WONTON_DATA.slug,
        icon: DIMSUM_WONTON_DATA.icon,
        color: DIMSUM_WONTON_DATA.color
      }
    })
    console.log(`  ✅ Business created: ${biz.name}`)
  } else {
    // Update name to Dimsum & Xie Wonton if needed
    biz = await prisma.business.update({
      where: { id: biz.id },
      data: { name: DIMSUM_WONTON_DATA.name, icon: DIMSUM_WONTON_DATA.icon, color: DIMSUM_WONTON_DATA.color }
    })
    console.log(`  ℹ️ Business found & updated: ${biz.name}`)
  }

  // Ensure branches exist
  for (const bName of DIMSUM_WONTON_DATA.branches) {
    const branchExists = await prisma.branch.findFirst({
      where: { businessId: biz.id, name: bName }
    })
    if (!branchExists) {
      await prisma.branch.create({
        data: { name: bName, businessId: biz.id }
      })
      console.log(`  ✅ Branch created: ${bName}`)
    }
  }

  // Create Categories and Products
  let totalProds = 0
  for (const catData of DIMSUM_WONTON_DATA.categories) {
    let cat = await prisma.category.findFirst({
      where: { businessId: biz.id, name: catData.name }
    })
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: catData.name, businessId: biz.id }
      })
    }

    for (const prod of catData.products) {
      const existingProd = await prisma.product.findFirst({
        where: {
          businessId: biz.id,
          OR: [
            { barcode: prod.barcode },
            { name: prod.name }
          ]
        }
      })

      if (existingProd) {
        await prisma.product.update({
          where: { id: existingProd.id },
          data: {
            name: prod.name,
            price: prod.price,
            unit: prod.unit,
            stock: prod.stock,
            categoryId: cat.id
          }
        })
      } else {
        await prisma.product.create({
          data: {
            barcode: prod.barcode,
            sku: prod.barcode,
            name: prod.name,
            price: prod.price,
            unit: prod.unit,
            stock: prod.stock,
            businessId: biz.id,
            categoryId: cat.id
          }
        })
      }
      totalProds++
    }
  }

  console.log(`  🎉 Finished! Total products seeded: ${totalProds}`)
}

async function main() {
  console.log('🚀 Starting Dimsum & Xie Wonton Data Seeding...')

  // 1. Seed to Turso Cloud DB
  if (process.env.TURSO_DATABASE_URL) {
    try {
      const rawUrl = process.env.TURSO_DATABASE_URL.trim().replace('libsql://', 'https://')
      const rawToken = process.env.TURSO_AUTH_TOKEN
      const authToken = rawToken ? rawToken.trim().replace(/\s+/g, '') : undefined
      const libsql = createClient({ url: rawUrl, authToken })
      const adapter = new PrismaLibSQL(libsql)
      const tursoPrisma = new PrismaClient({ adapter } as any)

      await seedToTarget(tursoPrisma, 'Turso Cloud DB')
      await tursoPrisma.$disconnect()
    } catch (e: any) {
      console.error('❌ Failed to seed Turso Cloud DB:', e.message)
    }
  }

  // 2. Seed to Local SQLite DB
  try {
    const localPrisma = new PrismaClient()
    await seedToTarget(localPrisma, 'Local SQLite DB')
    await localPrisma.$disconnect()
  } catch (e: any) {
    console.error('❌ Failed to seed Local SQLite DB:', e.message)
  }

  console.log('\n✅ ALL SEEDING COMPLETED SUCCESSFULLY!')
}

main()
