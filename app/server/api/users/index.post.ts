import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

const createSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'KARYAWAN']),
  branchId: z.string().optional().nullable(),
  branchIds: z.array(z.string()).optional(),
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

    const branchIds = data.branchIds && data.branchIds.length > 0
      ? data.branchIds
      : (data.branchId ? [data.branchId] : [])

    if (data.role === 'KARYAWAN' && branchIds.length === 0) {
      throw createError(errorResponse(event, 400, 'Karyawan must be assigned to at least one branch'))
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)
    const primaryBranchId = data.role === 'KARYAWAN' ? (data.branchId || branchIds[0]) : null

    const user = await prisma.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
        branchId: primaryBranchId,
        isActive: data.isActive !== undefined ? data.isActive : true,
        ...(data.role === 'KARYAWAN' && branchIds.length > 0 && {
          branches: {
            connect: branchIds.map(id => ({ id }))
          }
        })
      },
      include: {
        branch: { include: { business: true } },
        branches: { include: { business: true } }
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
