import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw createError(errorResponse(event, 400, 'User ID is required'))

    // Prevent deleting admin
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: { transactions: true }
    })
    if (user?.role === 'ADMIN') {
      throw createError(errorResponse(event, 400, 'Cannot delete admin user'))
    }
    
    if (user && user.transactions.length > 0) {
      throw createError(errorResponse(event, 400, 'Cannot delete user because they have recorded transactions'))
    }

    await prisma.user.delete({
      where: { id }
    })

    return successResponse(null, 'User deleted successfully')
  } catch (error: any) {
    throw error
  }
})
