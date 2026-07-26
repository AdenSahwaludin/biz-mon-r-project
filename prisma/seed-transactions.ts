import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Transaction Seeder for Warung Sembako...')

  // 1. Get Warung Sembako business
  const business = await prisma.business.findFirst({
    where: {
      OR: [
        { slug: 'sembako' },
        { name: 'Warung Sembako' }
      ]
    },
    include: { branches: true }
  })

  if (!business) {
    console.error('❌ Business Warung Sembako not found!')
    process.exit(1)
  }

  const branch = business.branches[0]
  if (!branch) {
    console.error('❌ No branch found for Warung Sembako!')
    process.exit(1)
  }

  // 2. Get Products of Warung Sembako
  const products = await prisma.product.findMany({
    where: { businessId: business.id, isActive: true }
  })

  if (products.length === 0) {
    console.error('❌ No products found for Warung Sembako!')
    process.exit(1)
  }

  // 3. Get User (Cashier)
  let cashier = await prisma.user.findFirst({
    where: { username: 'ravidgumelar' }
  })
  if (!cashier) {
    cashier = await prisma.user.findFirst()
  }
  if (!cashier) {
    console.error('❌ No user found to act as cashier!')
    process.exit(1)
  }

  console.log(`📌 Seeding transactions for:`)
  console.log(`   - Business: ${business.name}`)
  console.log(`   - Branch: ${branch.name}`)
  console.log(`   - Cashier: ${cashier.name} (@${cashier.username})`)
  console.log(`   - Available Products: ${products.length}`)

  // 4. Calculate Date Range: July 1 to Today (Dynamic)
  const now = new Date()
  const currentYear = now.getFullYear()
  const startDate = new Date(currentYear, 6, 1) // July 1st (Month 6 = July)
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  console.log(`📅 Date Range: ${startDate.toISOString().split('T')[0]} to ${now.toISOString().split('T')[0]}`)

  let createdCount = 0
  let totalOmzet = 0
  let totalCash = 0
  let totalQris = 0

  // Loop day by day
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const formattedDateForInv = dateStr.replace(/-/g, '')

    // Random 8 to 18 transactions per day
    const transactionsCount = Math.floor(Math.random() * 11) + 8

    for (let i = 0; i < transactionsCount; i++) {
      // Random hour between 08:00 and 21:00
      const hour = Math.floor(Math.random() * 14) + 8
      const minute = Math.floor(Math.random() * 60)
      const second = Math.floor(Math.random() * 60)

      const trxDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hour, minute, second)

      // Random 1 to 4 distinct products per transaction
      const numProducts = Math.floor(Math.random() * 4) + 1
      const shuffled = [...products].sort(() => 0.5 - Math.random())
      const selectedProducts = shuffled.slice(0, numProducts)

      let trxTotal = 0
      const detailsData = []

      for (const prod of selectedProducts) {
        // Random qty 1 to 3
        const qty = Math.floor(Math.random() * 3) + 1
        const subtotal = prod.price * qty
        trxTotal += subtotal

        detailsData.push({
          productId: prod.id,
          qty: qty,
          snapshotPrice: prod.price,
          subtotal: subtotal
        })
      }

      // Random payment method: 60% Tunai, 40% QRIS
      const isQris = Math.random() < 0.4
      const paymentMethod = isQris ? 'QRIS' : 'Tunai'

      const invCode = `INV/${formattedDateForInv}/${String(i + 1).padStart(4, '0')}`

      await prisma.transaction.create({
        data: {
          id: invCode,
          branchId: branch.id,
          cashierId: cashier.id,
          total: trxTotal,
          paymentMethod: paymentMethod,
          createdAt: trxDate,
          details: {
            create: detailsData
          }
        }
      })

      createdCount++
      totalOmzet += trxTotal
      if (isQris) totalQris += trxTotal
      else totalCash += trxTotal
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1)
  }

  console.log(`\n🎉 Transaction Seeding Completed Successfully!`)
  console.log(`📊 Seeding Results:`)
  console.log(`   - Total Transactions Created: ${createdCount}`)
  console.log(`   - Total Omzet: Rp ${totalOmzet.toLocaleString('id-ID')}`)
  console.log(`   - Pendapatan Tunai: Rp ${totalCash.toLocaleString('id-ID')}`)
  console.log(`   - Pendapatan QRIS: Rp ${totalQris.toLocaleString('id-ID')}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding transactions:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
