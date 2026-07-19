import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'admin' }
  })

  if (!adminExists) {
    const password = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        username: 'admin',
        password,
        role: 'ADMIN'
      }
    })
    console.log('✅ Admin user created: admin / admin123')
  } else {
    console.log('✅ Admin user already exists')
  }

  // Seed Default Businesses
  const defaultBusinesses = [
    { name: 'Wonton', slug: 'wonton', icon: 'Soup', color: 'bg-orange-100 text-orange-600' },
    { name: 'Es Teh', slug: 'esteh', icon: 'CupSoda', color: 'bg-amber-100 text-amber-600' },
    { name: 'Dimsum', slug: 'dimsum', icon: 'Utensils', color: 'bg-rose-100 text-rose-600' },
    { name: 'Warung Sembako', slug: 'sembako', icon: 'Store', color: 'bg-emerald-100 text-emerald-600' }
  ]

  for (const biz of defaultBusinesses) {
    const existing = await prisma.business.findUnique({ where: { slug: biz.slug } })
    if (!existing) {
      const createdBiz = await prisma.business.create({
        data: {
          ...biz,
          branches: {
            create: { name: 'Samarkrombeng' }
          }
        }
      })
      console.log(`✅ Business '${createdBiz.name}' created with default branch 'Samarkrombeng'`)
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
