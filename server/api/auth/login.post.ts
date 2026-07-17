import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../../utils/prisma'
import { signToken } from '../../utils/jwt'
import { successResponse, errorResponse } from '../../utils/response'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const data = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { username: data.username },
      include: { branch: { include: { business: true } } }
    })

    if (!user) {
      throw createError(errorResponse(event, 401, 'Invalid username or password'))
    }

    if (!user.isActive) {
      throw createError(errorResponse(event, 403, 'Akun Anda telah dinonaktifkan'))
    }

    const isMatch = await bcrypt.compare(data.password, user.password)
    if (!isMatch) {
      throw createError(errorResponse(event, 401, 'Invalid username or password'))
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      branchId: user.branchId,
      businessId: user.branch?.businessId
    }

    const token = signToken(payload)

    return successResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null,
        business: user.branch?.business ? { id: user.branch.business.id, name: user.branch.business.name } : null
      }
    }, 'Login successful')

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
