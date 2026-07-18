import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireAuth } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  oldPassword: z.string().optional(),
  password: z.string().min(6).optional().nullable(),
})

export default defineEventHandler(async (event) => {
  try {
    const currentUser = requireAuth(event)
    const body = await readBody(event)
    const data = updateSchema.parse(body)

    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, id: { not: currentUser.id } }
      })
      if (existing) {
        throw createError(errorResponse(event, 400, 'Username already exists'))
      }
    }

    const updateData: any = {
      name: data.name,
      username: data.username,
    }

    if (data.password) {
      if (!data.oldPassword) {
        throw createError(errorResponse(event, 400, 'Old password is required to set a new password'))
      }
      
      const user = await prisma.user.findUnique({ where: { id: currentUser.id } })
      if (!user) throw createError(errorResponse(event, 404, 'User not found'))

      const isValid = await bcrypt.compare(data.oldPassword, user.password)
      if (!isValid) {
        throw createError(errorResponse(event, 400, 'Password lama tidak sesuai'))
      }

      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Clean up undefined
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData
    })

    const { password, ...rest } = user
    return successResponse(rest, 'Profile updated successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
