import { z } from 'zod'
import bcrypt from 'bcrypt'
import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'KARYAWAN']),
  branchId: z.string().optional().nullable(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  try {
    requireAdmin(event)
    const body = await readBody(event)
    const data = createSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { username: data.username } })
    if (existing) {
      throw createError(errorResponse(event, 400, 'Username already exists'))
    }

    if (data.role === 'KARYAWAN' && !data.branchId) {
      throw createError(errorResponse(event, 400, 'Karyawan must be assigned to a branch'))
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
        branchId: data.role === 'KARYAWAN' ? data.branchId : null,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    })

    const { password, ...rest } = user
    return successResponse(rest, 'User created successfully')
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return errorResponse(event, 400, 'Validation Error', error.errors)
    }
    throw error
  }
})
