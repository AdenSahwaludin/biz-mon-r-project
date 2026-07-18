import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(6).optional().nullable(),
  role: z.enum(['ADMIN', 'KARYAWAN']).optional(),
  branchId: z.string().optional().nullable(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const id = getRouterParam(event, 'id')
    if (!id) throw createError(errorResponse(event, 400, 'User ID is required'))

    const body = await readBody(event)
    const data = updateSchema.parse(body)

    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, id: { not: id } }
      })
      if (existing) {
        throw createError(errorResponse(event, 400, 'Username already exists'))
      }
    }

    if (data.role === 'KARYAWAN' && !data.branchId) {
      throw createError(errorResponse(event, 400, 'Karyawan must be assigned to a branch'))
    }

    const updateData: any = {
      name: data.name,
      username: data.username,
      role: data.role,
      isActive: data.isActive
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    if (data.role !== undefined) {
      updateData.branchId = data.role === 'KARYAWAN' ? data.branchId : null
    }

    // Clean up undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    const { password, ...rest } = user
    return successResponse(rest, 'User updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
