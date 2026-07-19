import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

function getPrisma(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (url && (url.startsWith('libsql://') || url.startsWith('https://'))) {
    const libsql = createClient({ url, authToken })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

const prisma = getPrisma()

const WONTON_DATA = {
  name: 'Wonton',
  slug: 'wonton',
  icon: 'Soup',
  color: 'bg-orange-100 text-orange-600',
  categories: [
    {
      name: 'Wonton Kuah',
      products: [
        { barcode: 'WT-001', name: 'Wonton Chili Oil', price: 18000, unit: 'porsi' },
        { barcode: 'WT-002', name: 'Wonton Kuah Rempah Pedas', price: 18000, unit: 'porsi' },
        { barcode: 'WT-003', name: 'Wonton Kuah Kaldu Sapi', price: 19000, unit: 'porsi' },
        { barcode: 'WT-004', name: 'Wonton Tomyam Pedas Gurih', price: 20000, unit: 'porsi' },
      ]
    },
    {
      name: 'Wonton Goreng',
      products: [
        { barcode: 'WT-005', name: 'Wonton Goreng Crispy Original', price: 18000, unit: 'porsi' },
        { barcode: 'WT-006', name: 'Wonton Goreng Keju Leleh', price: 22000, unit: 'porsi' },
        { barcode: 'WT-007', name: 'Wonton Goreng Mayonaise', price: 20000, unit: 'porsi' },
      ]
    },
    {
      name: 'Minuman',
      products: [
        { barcode: 'WT-008', name: 'Es Teh Manis Jumbo', price: 5000, unit: 'cup' },
        { barcode: 'WT-009', name: 'Es Jeruk Peras', price: 7000, unit: 'cup' },
        { barcode: 'WT-010', name: 'Es Lemon Tea', price: 8000, unit: 'cup' },
        { barcode: 'WT-011', name: 'Air Mineral 600ml', price: 4000, unit: 'botol' },
      ]
    },
    {
      name: 'Extra & Topping',
      products: [
        { barcode: 'WT-012', name: 'Extra Chili Oil Secret', price: 3000, unit: 'pcs' },
        { barcode: 'WT-013', name: 'Extra Topping Keju', price: 4000, unit: 'pcs' },
        { barcode: 'WT-014', name: 'Extra Pangsit Goreng', price: 5000, unit: 'pcs' },
      ]
    }
  ]
}

const ESTEH_DATA = {
  name: 'Es Teh',
  slug: 'esteh',
  icon: 'CupSoda',
  color: 'bg-amber-100 text-amber-600',
  categories: [
    {
      name: 'Teh Klasik',
      products: [
        { barcode: 'ET-001', name: 'Es Teh Original Jumbo', price: 5000, unit: 'cup' },
        { barcode: 'ET-002', name: 'Es Teh Melati Solo', price: 5000, unit: 'cup' },
        { barcode: 'ET-003', name: 'Teh Tawar Dingin', price: 4000, unit: 'cup' },
      ]
    },
    {
      name: 'Teh Buah',
      products: [
        { barcode: 'ET-004', name: 'Es Teh Lemon Tea', price: 8000, unit: 'cup' },
        { barcode: 'ET-005', name: 'Es Teh Lychee Fresh', price: 10000, unit: 'cup' },
        { barcode: 'ET-006', name: 'Es Teh Mangga Sweet', price: 10000, unit: 'cup' },
        { barcode: 'ET-007', name: 'Es Teh Passion Fruit', price: 10000, unit: 'cup' },
      ]
    },
    {
      name: 'Teh Susu & Flavored',
      products: [
        { barcode: 'ET-008', name: 'Es Teh Milk Tea Boba', price: 12000, unit: 'cup' },
        { barcode: 'ET-009', name: 'Es Teh Thai Tea Creamy', price: 12000, unit: 'cup' },
        { barcode: 'ET-010', name: 'Es Teh Green Tea Matcha', price: 13000, unit: 'cup' },
        { barcode: 'ET-011', name: 'Es Teh Taro Special', price: 13000, unit: 'cup' },
      ]
    },
    {
      name: 'Topping Tambahan',
      products: [
        { barcode: 'ET-012', name: 'Extra Boba Chewy', price: 3000, unit: 'porsi' },
        { barcode: 'ET-013', name: 'Extra Grass Jelly', price: 3000, unit: 'porsi' },
        { barcode: 'ET-014', name: 'Extra Cheese Foam', price: 4000, unit: 'porsi' },
      ]
    }
  ]
}

const DIMSUM_DATA = {
  name: 'Dimsum',
  slug: 'dimsum',
  icon: 'Utensils',
  color: 'bg-rose-100 text-rose-600',
  categories: [
    {
      name: 'Dimsum Kukus',
      products: [
        { barcode: 'DS-001', name: 'Siomay Ayam Original 4pcs', price: 15000, unit: 'porsi' },
        { barcode: 'DS-002', name: 'Siomay Udang Premium 4pcs', price: 18000, unit: 'porsi' },
        { barcode: 'DS-003', name: 'Siomay Nori Rumput Laut 4pcs', price: 17000, unit: 'porsi' },
        { barcode: 'DS-004', name: 'Siomay Mozzarella 4pcs', price: 18000, unit: 'porsi' },
        { barcode: 'DS-005', name: 'Hakau Udang Transparan 4pcs', price: 20000, unit: 'porsi' },
      ]
    },
    {
      name: 'Dimsum Goreng',
      products: [
        { barcode: 'DS-006', name: 'Lumpia Kulit Tahu Goreng 3pcs', price: 16000, unit: 'porsi' },
        { barcode: 'DS-007', name: 'Pangsit Goreng Udang 3pcs', price: 18000, unit: 'porsi' },
        { barcode: 'DS-008', name: 'Kumis Naga Goreng Crispy 3pcs', price: 17000, unit: 'porsi' },
      ]
    },
    {
      name: 'Paket Combo',
      products: [
        { barcode: 'DS-009', name: 'Paket Dimsum Combo Mix 10pcs', price: 42000, unit: 'paket' },
        { barcode: 'DS-010', name: 'Paket Dimsum Party Box 20pcs', price: 80000, unit: 'paket' },
      ]
    },
    {
      name: 'Minuman',
      products: [
        { barcode: 'DS-011', name: 'Es Teh Manis', price: 5000, unit: 'cup' },
        { barcode: 'DS-012', name: 'Badak Sarsaparilla', price: 12000, unit: 'botol' },
        { barcode: 'DS-013', name: 'Air Mineral 600ml', price: 4000, unit: 'botol' },
      ]
    }
  ]
}

const SEMBAKO_DATA = {
  name: 'Warung Sembako',
  slug: 'sembako',
  icon: 'Store',
  color: 'bg-emerald-100 text-emerald-600',
  categories: [
    {
      name: 'Rokok',
      products: [
        { barcode: 'RK-001', name: 'ANDALAN BARU 16', price: 12000, unit: 'pcs' },
        { barcode: 'RK-002', name: 'APEL BESAR 76', price: 16000, unit: 'pcs' },
        { barcode: 'RK-003', name: 'CAMEL 16', price: 27000, unit: 'pcs' },
        { barcode: 'RK-004', name: 'DJARUM SUPER', price: 25000, unit: 'pcs' },
        { barcode: 'RK-005', name: 'DJI SAM SOE', price: 21000, unit: 'pcs' },
        { barcode: 'RK-006', name: 'GG FILTER', price: 27500, unit: 'pcs' },
        { barcode: 'RK-007', name: 'SAMPOERNA MILD MERAH', price: 37000, unit: 'pcs' }
      ]
    },
    {
      name: 'Bahan Pokok & Dapur',
      products: [
        { barcode: 'BP-001', name: 'BAWANG PUTIH', price: 38000, unit: 'kg' },
        { barcode: 'BP-002', name: 'GULA ROSE BRAND 1KG', price: 19000, unit: 'kg' },
        { barcode: 'BP-003', name: 'KECAP BANGO 700G', price: 25000, unit: 'pcs' },
        { barcode: 'BP-004', name: 'TEPUNG TERIGU SEGITIGA BIRU 1KG', price: 13000, unit: 'kg' },
        { barcode: 'BP-005', name: 'BERAS PANDAN WANGI 5KG', price: 75000, unit: 'pcs' }
      ]
    },
    {
      name: 'Minyak & Olahan',
      products: [
        { barcode: 'MY-001', name: 'MINYAK GORENG RESTO 1L', price: 19000, unit: 'liter' },
        { barcode: 'MY-002', name: 'MINYAK GORENG BIMOLI 2L', price: 38000, unit: 'pcs' },
        { barcode: 'MY-003', name: 'PALMIA MARGARIN', price: 7000, unit: 'pcs' }
      ]
    },
    {
      name: 'Minuman & Susu',
      products: [
        { barcode: 'MN-001', name: 'AQUA BOTOL BESAR 1DUS', price: 55000, unit: 'dus' },
        { barcode: 'MN-002', name: 'LE MINERALE 600ML 1DUS', price: 47000, unit: 'dus' },
        { barcode: 'MN-003', name: 'KOPI KAPAL API 60GR', price: 10000, unit: 'pcs' },
        { barcode: 'MN-004', name: 'SUSU KOTAK ULTRA MILK 1L', price: 20000, unit: 'pcs' }
      ]
    },
    {
      name: 'Makanan & Snack',
      products: [
        { barcode: 'SN-001', name: 'INDOMIE GORENG 1 DUS', price: 115000, unit: 'dus' },
        { barcode: 'SN-002', name: 'MIE SEDAAP GORENG 1 DUS', price: 110000, unit: 'dus' },
        { barcode: 'SN-003', name: 'ROMA KELAPA BOX', price: 18000, unit: 'box' }
      ]
    }
  ]
}

async function main() {
  console.log('🚀 Starting Unified Master Seeder with Formatted Transaction IDs (TRX-DDMMYY-XXXX)...')

  // 1. Rename any existing "Pusat" branch to "Samarkrombeng"
  console.log('🔄 Updating any existing branch named "Pusat" to "Samarkrombeng"...')
  await prisma.branch.updateMany({
    where: { name: 'Pusat' },
    data: { name: 'Samarkrombeng' }
  })

  // 2. Ensure Core Admin & Users
  const passwordHash = await bcrypt.hash('admin123', 10)
  const karyawanPassHash = await bcrypt.hash('karyawan123', 10)

  let adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        username: 'admin',
        password: passwordHash,
        role: 'ADMIN'
      }
    })
  }

  let adenUser = await prisma.user.findUnique({ where: { username: 'aden' } })
  if (!adenUser) {
    adenUser = await prisma.user.create({
      data: {
        name: 'Ravid Gumelar',
        username: 'aden',
        password: passwordHash,
        role: 'ADMIN'
      }
    })
  }

  const businessConfigs = [WONTON_DATA, ESTEH_DATA, DIMSUM_DATA, SEMBAKO_DATA]
  const targetBusinesses: any[] = []

  // 3. Create or Update Businesses & Branches ("Samarkrombeng")
  for (const bData of businessConfigs) {
    let biz = await prisma.business.findUnique({ where: { slug: bData.slug } })
    if (!biz) {
      biz = await prisma.business.create({
        data: {
          name: bData.name,
          slug: bData.slug,
          icon: bData.icon,
          color: bData.color,
          branches: {
            create: { name: 'Samarkrombeng' }
          }
        }
      })
    }

    let branch = await prisma.branch.findFirst({
      where: { businessId: biz.id, name: 'Samarkrombeng' }
    })
    if (!branch) {
      branch = await prisma.branch.create({
        data: { name: 'Samarkrombeng', businessId: biz.id }
      })
    }

    targetBusinesses.push({ biz, branch, data: bData })
  }

  // 4. Create Cashier Users for Each Business
  const cashierSpecs = [
    { username: 'siti', name: 'Siti Nurhaliza', slug: 'wonton' },
    { username: 'budi', name: 'Budi Santoso', slug: 'esteh' },
    { username: 'rina', name: 'Rina Wati', slug: 'dimsum' },
    { username: 'dedi', name: 'Dedi Kurniawan', slug: 'sembako' },
  ]

  const cashiersMap: Record<string, any> = {}

  for (const cSpec of cashierSpecs) {
    const target = targetBusinesses.find(tb => tb.biz.slug === cSpec.slug)
    if (target) {
      let cashier = await prisma.user.findUnique({ where: { username: cSpec.username } })
      if (!cashier) {
        cashier = await prisma.user.create({
          data: {
            name: cSpec.name,
            username: cSpec.username,
            password: karyawanPassHash,
            role: 'KARYAWAN',
            branchId: target.branch.id
          }
        })
      } else {
        // Ensure cashier is linked to Samarkrombeng branch
        await prisma.user.update({
          where: { id: cashier.id },
          data: { branchId: target.branch.id }
        })
      }
      cashiersMap[cSpec.slug] = cashier
    }
  }

  // 5. Seed Categories & Products for Each Business
  console.log('📦 Seeding Categories and Products...')
  const allProductsByBiz: Record<string, any[]> = {}

  for (const tb of targetBusinesses) {
    allProductsByBiz[tb.biz.id] = []

    for (const catItem of tb.data.categories) {
      let cat = await prisma.category.findFirst({
        where: { name: catItem.name, businessId: tb.biz.id }
      })
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: catItem.name, businessId: tb.biz.id }
        })
      }

      for (const pItem of catItem.products) {
        let prod = await prisma.product.findFirst({
          where: { barcode: pItem.barcode, businessId: tb.biz.id }
        })

        if (!prod) {
          prod = await prisma.product.create({
            data: {
              barcode: pItem.barcode,
              name: pItem.name,
              price: pItem.price,
              unit: pItem.unit,
              stock: 250,
              businessId: tb.biz.id,
              categoryId: cat.id
            }
          })
        }
        allProductsByBiz[tb.biz.id].push(prod)
      }
    }
    console.log(`  └─ ${tb.biz.name}: ${allProductsByBiz[tb.biz.id].length} produk aktif.`)
  }

  // 6. Clear ALL existing transactions to replace with formatted TRX-DDMMYY-XXXX IDs
  console.log('🧹 Clearing all previous transactions from database to standardize transaction IDs...')
  await prisma.transactionDetail.deleteMany({})
  await prisma.transaction.deleteMany({})

  // 7. Generate Daily Transactions from July 1, 2026 up to NOW with formatted ID: TRX-DDMMYY-XXXX
  const startDate = new Date(2026, 6, 1, 8, 0, 0) // 1 Juli 2026
  const endDate = new Date() // Current execution date & time

  console.log(`🗓️ Generating transactions with format TRX-DDMMYY-XXXX from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`)

  const paymentMethods = ['Tunai', 'QRIS', 'Transfer']
  let totalTransactionsCount = 0

  // Track daily sequence counter per date string (DDMMYY)
  const dailySeqMap: Record<string, number> = {}

  const curr = new Date(startDate)

  while (curr <= endDate) {
    const isToday = curr.toDateString() === endDate.toDateString()

    // Format DDMMYY for transaction ID
    const dStr = curr.getDate().toString().padStart(2, '0')
    const mStr = (curr.getMonth() + 1).toString().padStart(2, '0')
    const yStr = curr.getFullYear().toString().substring(2)
    const dateKey = `${dStr}${mStr}${yStr}`

    // Initialize sequence counter for this date
    if (!dailySeqMap[dateKey]) {
      dailySeqMap[dateKey] = 1
    }

    // Collect all transactions to create for today across all businesses so we can sort them chronologically
    const dailyTxItems: any[] = []

    for (const tb of targetBusinesses) {
      const products = allProductsByBiz[tb.biz.id]
      if (!products || products.length === 0) continue

      const cashier = cashiersMap[tb.biz.slug] || adenUser

      // Generate 3 to 10 transactions per day per business
      const dailyTxCount = Math.floor(Math.random() * 8) + 3

      for (let i = 0; i < dailyTxCount; i++) {
        const maxHour = isToday ? endDate.getHours() : 21
        const hour = Math.floor(Math.random() * (Math.max(maxHour - 9, 1))) + 9
        const minute = Math.floor(Math.random() * 60)
        const second = Math.floor(Math.random() * 60)

        const txDate = new Date(curr)
        txDate.setHours(hour, minute, second, 0)

        if (txDate > endDate) continue

        const itemsCount = Math.floor(Math.random() * 3) + 1
        const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, itemsCount)

        let total = 0
        const detailsData: any[] = []

        for (const prod of selectedProducts) {
          const qty = Math.floor(Math.random() * 3) + 1
          const subtotal = prod.price * qty
          total += subtotal
          detailsData.push({
            productId: prod.id,
            snapshotPrice: prod.price,
            qty,
            subtotal
          })
        }

        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]

        dailyTxItems.push({
          txDate,
          total,
          cashierId: cashier.id,
          branchId: tb.branch.id,
          paymentMethod,
          detailsData
        })
      }
    }

    // Sort today's transactions chronologically by txDate
    dailyTxItems.sort((a, b) => a.txDate.getTime() - b.txDate.getTime())

    // Assign TRX-DDMMYY-XXXX IDs in chronological order
    for (const item of dailyTxItems) {
      const seqNum = dailySeqMap[dateKey]
      const seqStr = seqNum.toString().padStart(4, '0')
      const customId = `TRX-${dateKey}-${seqStr}`
      dailySeqMap[dateKey] = seqNum + 1

      await prisma.transaction.create({
        data: {
          id: customId,
          total: item.total,
          cashierId: item.cashierId,
          branchId: item.branchId,
          paymentMethod: item.paymentMethod,
          createdAt: item.txDate,
          details: {
            create: item.detailsData
          }
        }
      })
      totalTransactionsCount++
    }

    // Advance to next day
    curr.setDate(curr.getDate() + 1)
  }

  console.log(`✅ Success! Generated ${totalTransactionsCount} transactions formatted as TRX-DDMMYY-XXXX for all businesses including Warung Sembako at branch 'Samarkrombeng'!`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error executing seeder:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
