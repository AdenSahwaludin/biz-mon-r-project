import { requireAuth, getUserBusinessIds } from '../../utils/authGuard'
import { prisma } from '../../utils/prisma'
import { successResponse, errorResponse } from '../../utils/response'
import { generateReadableSku } from '../../utils/skuGenerator'

const MAX_IMPORT_ITEMS = 500

export default defineEventHandler(async (event) => {
  try {
    const user = requireAuth(event)
    const body = await readBody(event)
    const items = body.products || body

    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(event, 400, 'Data produk tidak ditemukan atau kosong')
    }

    if (items.length > MAX_IMPORT_ITEMS) {
      return errorResponse(event, 400, `Maksimal ${MAX_IMPORT_ITEMS} produk per import`)
    }

    // Scope karyawan: hanya boleh import ke bisnis cabangnya
    let allowedBizIds: Set<string> | null = null
    if (user.role !== 'ADMIN') {
      allowedBizIds = await getUserBusinessIds(user.id)
      if (allowedBizIds.size === 0) {
        return errorResponse(event, 403, 'Forbidden: tidak ada cabang yang ditugaskan')
      }
    }

    // Pre-fetch all active businesses & categories
    const allBusinesses = await prisma.business.findMany({
      include: {
        categories: true
      }
    })

    if (allBusinesses.length === 0) {
      return errorResponse(event, 400, 'Belum ada bisnis terdaftar di sistem')
    }

    const businessMap = new Map<string, any>()
    allBusinesses.forEach(b => {
      businessMap.set(b.id, b)
      businessMap.set(b.name.toLowerCase().trim(), b)
    })

    let createdCount = 0
    let skippedCount = 0
    const skippedDetails: { name: string; reason: string }[] = []

    for (const item of items) {
      const rawName = String(item.name || item.nama || item['Nama Produk'] || '').trim()
      if (!rawName) continue

      // Determine Target Business
      let targetBiz: any = null
      const bizName = String(item.businessName || item.bisnis || item.Bisnis || '').trim()
      if (bizName) {
        targetBiz = businessMap.get(bizName.toLowerCase())
      }
      if (!targetBiz && item.businessId) {
        targetBiz = businessMap.get(item.businessId)
      }
      if (!targetBiz) {
        skippedCount++
        skippedDetails.push({
          name: rawName,
          reason: 'Bisnis tidak ditemukan — isi businessName/businessId yang valid'
        })
        continue
      }

      if (allowedBizIds && !allowedBizIds.has(targetBiz.id)) {
        skippedCount++
        skippedDetails.push({
          name: rawName,
          reason: `Bukan bisnis cabang Anda — dilewati (${targetBiz.name})`
        })
        continue
      }

      const bizId = targetBiz.id
      const skuStr = String(item.sku || item.SKU || '').trim()
      const barcodeStr = String(item.barcode || item.Barcode || item.barcodeFisik || '').trim()

      // Check for duplicate in the target business
      let existing: any = null

      if (skuStr) {
        existing = await prisma.product.findFirst({
          where: {
            businessId: bizId,
            sku: skuStr
          }
        })
      }

      if (!existing && barcodeStr) {
        existing = await prisma.product.findFirst({
          where: {
            businessId: bizId,
            barcode: barcodeStr
          }
        })
      }

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
          reason: `Sudah ada di bisnis ${targetBiz.name} (SKU: ${existing.sku || existing.barcode || '—'})`
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

      // Generate SKU if empty
      let finalSku = skuStr
      if (!finalSku) {
        let catName = ''
        if (categoryId) {
          const foundCat = targetBiz.categories?.find((c: any) => c.id === categoryId)
          if (foundCat) catName = foundCat.name
        }
        let baseSku = generateReadableSku(rawName, targetBiz.slug || targetBiz.name, catName)
        let candidate = baseSku
        let counter = 1
        while (await prisma.product.findFirst({ where: { sku: candidate, businessId: bizId } })) {
          counter++
          candidate = `${baseSku}-${String(counter).padStart(2, '0')}`
        }
        finalSku = candidate
      }

      const finalPrice = Math.max(0, parseInt(String(item.price || item.harga || item.Harga || 0).replace(/[^0-9]/g, '')) || 0)
      const rawStockVal = item.stock ?? item.stok ?? item.Stok
      const finalStock = rawStockVal !== undefined && rawStockVal !== null && String(rawStockVal).trim() !== ''
        ? Math.max(0, parseInt(String(rawStockVal).replace(/[^0-9]/g, '')) || 0)
        : 9999999
      const finalUnit = String(item.unit || item.satuan || 'pcs').trim() || 'pcs'
      const finalIsActive = item.isActive !== undefined ? Boolean(item.isActive) : true

      // Create product
      await prisma.product.create({
        data: {
          name: rawName,
          sku: finalSku,
          barcode: barcodeStr || null,
          price: finalPrice,
          stock: finalStock,
          unit: finalUnit,
          isActive: finalIsActive,
          categoryId,
          businessId: bizId
        }
      })

      createdCount++
    }

    return successResponse(
      {
        createdCount,
        skippedCount,
        skippedDetails
      },
      `Import selesai: ${createdCount} dibuat, ${skippedCount} dilewati`
    )
  } catch (error: any) {
    console.error('[import products]', error)
    return errorResponse(event, 500, 'Gagal memproses import produk')
  }
})
