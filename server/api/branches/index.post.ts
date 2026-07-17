import { z } from 'zod'
import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  name: z.string().min(1),
  businessId: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    const business = await prisma.business.findUnique({ where: { id: data.businessId } })
    if (!business) {
      throw createError(errorResponse(event, 404, 'Business not found'))
    }

    const branch = await prisma.branch.create({
      data: {
        name: data.name,
        businessId: data.businessId,
        isActive: true
      }
    })

    return successResponse(branch, 'Branch created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
