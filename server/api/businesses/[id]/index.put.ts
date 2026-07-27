import { requireAdmin } from '../../../utils/authGuard'
import { prisma } from '../../../utils/prisma'
import { successResponse, errorResponse } from '../../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError(errorResponse(event, 400, 'Business ID is required'))
  }

  const body = await readBody(event)
  if (!body || !body.name) {
    throw createError(errorResponse(event, 400, 'Nama bisnis wajib diisi'))
  }

  const business = await prisma.business.findUnique({
    where: { id }
  })

  if (!business) {
    throw createError(errorResponse(event, 404, 'Bisnis tidak ditemukan'))
  }

  const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const updated = await prisma.business.update({
    where: { id },
    data: {
      name: body.name,
      slug,
      icon: body.icon || business.icon,
      color: body.color || business.color
    }
  })

  return successResponse(updated, 'Bisnis berhasil diperbarui')
})
