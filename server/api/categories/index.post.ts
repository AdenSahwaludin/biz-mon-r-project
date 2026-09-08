import { z } from 'zod'
import { requireAuth, assertBusinessAccess } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  name: z.string().min(1),
  businessId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)
    await assertBusinessAccess(event, user, data.businessId)

    const business = await prisma.business.findUnique({ where: { id: data.businessId } })
    if (!business) {
      throw createError(errorResponse(event, 404, 'Business not found'))
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        businessId: data.businessId
      }
    })

    return successResponse(category, 'Category created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
