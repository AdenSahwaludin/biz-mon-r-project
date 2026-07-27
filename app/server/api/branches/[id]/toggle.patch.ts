import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw createError(errorResponse(event, 400, 'Branch ID is required'))

    const branch = await prisma.branch.findUnique({ where: { id } })
    if (!branch) throw createError(errorResponse(event, 404, 'Branch not found'))

    const updated = await prisma.branch.update({
      where: { id },
      data: { isActive: !branch.isActive }
    })

    return successResponse(updated, `Branch ${updated.isActive ? 'activated' : 'deactivated'} successfully`)
  } catch (error: any) {
    throw error
  }
})
