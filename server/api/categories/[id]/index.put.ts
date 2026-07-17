import { z } from 'zod'
import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

const updateSchema = z.object({
  name: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError(errorResponse(event, 400, 'Category ID is required'))
    }

    const body = await readBody(event)
    const data = updateSchema.parse(body)

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      throw createError(errorResponse(event, 404, 'Category not found'))
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name: data.name }
    })

    return successResponse(updated, 'Category updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
