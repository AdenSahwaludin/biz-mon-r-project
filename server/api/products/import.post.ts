import { requireAdmin } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)
  const { products, defaultBusinessId } = body || {}

  if (!Array.isArray(products) || products.length === 0) {
    return errorResponse(event, 'Data produk tidak boleh kosong', 400)
  }

  // Fetch all businesses & categories for matching
  const allBusinesses = await prisma.business.findMany({
    include: { categories: true }
  })
  
  if (allBusinesses.length === 0) {
    return errorResponse(event, 'Belum ada bisnis terdaftar di sistem', 400)
  }

  const businessMap = new Map<string, any>()
  const businessNameMap = new Map<string, any>()
  allBusinesses.forEach(b => {
    businessMap.set(b.id, b)
    businessNameMap.set(b.name.toLowerCase().trim(), b)
  })

  let createdCount = 0
  let skippedCount = 0
  const skippedDetails: { name: string; reason: string }[] = []
  const createdDetails: { name: string; business: string }[] = []

  for (const item of products) {
    const rawName = String(item.name || '').trim()
    if (!rawName) {
      skippedCount++
      skippedDetails.push({ name: 'Tanpa Nama', reason: 'Nama produk kosong' })
      continue
    }

    // Determine target business
    let targetBiz = defaultBusinessId ? businessMap.get(defaultBusinessId) : null
    if (item.businessName) {
      const matched = businessNameMap.get(String(item.businessName).toLowerCase().trim())
      if (matched) targetBiz = matched
    }
    if (!targetBiz && item.businessId) {
      targetBiz = businessMap.get(item.businessId)
    }
    if (!targetBiz) {
      targetBiz = allBusinesses[0]
    }

    const bizId = targetBiz.id
    const rawBarcode = item.barcode || item.sku || item.SKU || item.Barcode || ''
    const barcodeStr = String(rawBarcode).trim()

    // Check for duplicate in the target business
    // 1. By SKU/barcode if provided
    let existing: any = null
    if (barcodeStr) {
      existing = await prisma.product.findFirst({
        where: {
          businessId: bizId,
          barcode: barcodeStr
        }
      })
    }

    // 2. By Product Name if not found by barcode
    if (!existing) {
      existing = await prisma.product.findFirst({
        where: {
          businessId: bizId,
          name: {
            equals: rawName
          }
        }
      })
    }

    // If duplicate exists -> SKIP
    if (existing) {
      skippedCount++
      skippedDetails.push({
        name: rawName,
        reason: `Sudah ada di bisnis ${targetBiz.name} (SKU: ${existing.barcode})`
      })
      continue
    }

    // Handle Category
    let categoryId: string | null = null
    const catName = String(item.categoryName || item.kategori || item.Kategori || '').trim()
    if (catName) {
      let cat = targetBiz.categories.find(
        (c: any) => c.name.toLowerCase().trim() === catName.toLowerCase()
      )
      if (!cat) {
        // Create category on the fly
        cat = await prisma.category.create({
          data: {
            name: catName,
            businessId: bizId
          }
        })
        targetBiz.categories.push(cat)
      }
      categoryId = cat.id
    }

    // Generate Barcode if empty (e.g. ET-001 or WS-001)
    let finalBarcode = barcodeStr
    if (!finalBarcode) {
      const count = await prisma.product.count({ where: { businessId: bizId } })
      const rawPrefix = targetBiz.name ? targetBiz.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) : 'PRD'
      const prefix = rawPrefix.length > 0 ? rawPrefix : 'PRD'
      let candidate = `${prefix}-${String(count + 1).padStart(3, '0')}`
      let counter = count + 1
      while (await prisma.product.findFirst({ where: { barcode: candidate, businessId: bizId } })) {
        counter++
        candidate = `${prefix}-${String(counter).padStart(3, '0')}`
      }
      finalBarcode = candidate
    }
    const finalPrice = Math.max(0, parseInt(String(item.price || item.harga || item.Harga || 0).replace(/[^0-9]/g, '')) || 0)
    const finalStock = Math.max(0, parseInt(String(item.stock || item.stok || item.Stok || 0).replace(/[^0-9]/g, '')) || 0)
    const finalUnit = String(item.unit || item.satuan || 'pcs').trim() || 'pcs'
    const finalIsActive = item.isActive !== undefined ? Boolean(item.isActive) : true

    // Create product
    await prisma.product.create({
      data: {
        name: rawName,
        barcode: finalBarcode,
        price: finalPrice,
        stock: finalStock,
        unit: finalUnit,
        isActive: finalIsActive,
        categoryId,
        businessId: bizId
      }
    })

    createdCount++
    createdDetails.push({ name: rawName, business: targetBiz.name })
  }

  return successResponse({
    totalRows: products.length,
    createdCount,
    skippedCount,
    skippedDetails,
    createdDetails
  })
})
