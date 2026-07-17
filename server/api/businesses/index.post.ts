import { z } from 'zod'
import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string(),
  color: z.string()
})

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    // Check if slug exists
    const existing = await prisma.business.findUnique({ where: { slug: data.slug } })
    if (existing) {
      throw createError(errorResponse(event, 400, 'Business slug already exists'))
    }

    const business = await prisma.business.create({
      data: {
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        isActive: true
      }
    })

    return successResponse(business, 'Business created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
