import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Branch ID is required'))
  }

  const body = await readBody(event)
  if (!body || !body.name) {
    throw createError(errorResponse(event, 400, 'Nama cabang wajib diisi'))
  }

  const branch = await prisma.branch.findUnique({
    where: { id }
  })

  if (!branch) {
    throw createError(errorResponse(event, 404, 'Cabang tidak ditemukan'))
  }

  const updated = await prisma.branch.update({
    where: { id },
    data: {
      name: body.name
    }
  })

  return successResponse(updated, 'Cabang berhasil diperbarui')
})
