/**
 * Utility untuk membuat SKU otomatis yang human-readable (mudah dibaca & diingat)
 * Contoh: 
 * - Wonton Chili Oil -> WNT-CHILI-OIL
 * - Minyak Bimoli 2L -> MY-BML-2L
 * - Sampoerna Mild Merah 16 -> RK-SAM-MLD16
 */

export function generateReadableSku(
  productName: string,
  businessNameOrSlug?: string,
  categoryName?: string
): string {
  if (!productName || !productName.trim()) return 'PRD-001'

  const rawName = productName.trim()
  const bizStr = (businessNameOrSlug || '').toLowerCase().trim()
  const catStr = (categoryName || '').toLowerCase().trim()
  const nameLower = rawName.toLowerCase()

  // 1. Determine Business / Category Prefix
  let prefix = ''

  if (bizStr.includes('wonton')) {
    prefix = 'WNT'
  } else if (bizStr.includes('es teh') || bizStr.includes('esteh')) {
    prefix = 'ETH'
  } else if (bizStr.includes('dimsum')) {
    prefix = 'DMS'
  } else if (bizStr.includes('sembako') || bizStr.includes('warung')) {
    // Determine category / keyword prefix for sembako
    if (catStr.includes('rokok') || isRokokKeyword(nameLower)) {
      prefix = 'RK'
    } else if (catStr.includes('minyak') || nameLower.includes('minyak') || nameLower.includes('margarin') || nameLower.includes('palmia')) {
      prefix = 'MY'
    } else if (catStr.includes('bahan') || catStr.includes('dapur') || isBahanPokokKeyword(nameLower)) {
      prefix = 'BP'
    } else if (catStr.includes('minuman') || catStr.includes('susu') || isMinumanKeyword(nameLower)) {
      prefix = 'MN'
    } else if (catStr.includes('bersih') || catStr.includes('perlengkapan') || isKebersihanKeyword(nameLower)) {
      prefix = 'KB'
    } else if (catStr.includes('makanan') || catStr.includes('snack') || isSnackKeyword(nameLower)) {
      prefix = 'SN'
    } else {
      prefix = 'SMB'
    }
  } else if (businessNameOrSlug) {
    const words = businessNameOrSlug.trim().split(/\s+/)
    if (words.length >= 2) {
      prefix = words.map(w => w[0]).join('').toUpperCase().slice(0, 3)
    } else {
      prefix = businessNameOrSlug.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()
    }
  }

  if (!prefix) prefix = 'PRD'

  function isRokokKeyword(str: string) {
    return /sampoerna|djarum|dji sam soe|gg filter|gudang garam|camel|magnum|marlong|marlboro|clas mild|on bold|galang|gajah|bhumi|balai|andalan|76|hs|mahayana/i.test(str)
  }

  function isBahanPokokKeyword(str: string) {
    return /beras|gula|garam|terigu|tepung|bawang|kecap|masako|ladaku|desaku|cuka|bihun|sarden|kemiri|mi-won|boled/i.test(str)
  }

  function isMinumanKeyword(str: string) {
    return /aqua|le minerale|cleo|kopi|susu|anlene|dancow|energen|golda|granita|pikopi|pocari|yakult|pucuk|teh botol|teh celup|badak|ultra|milku/i.test(str)
  }

  function isKebersihanKeyword(str: string) {
    return /sabun|shampo|rinso|daia|soklin|sunlight|vixal|wipol|bayclin|cling|kispray|pepsodent|balsam|autan|tisu|tisue|amplop|lampu|plastik|selection/i.test(str)
  }

  function isSnackKeyword(str: string) {
    return /indomie|sedap|roma|choki|chocolatos|nabati|nextar|pop mie|tito|siip|superstar|taro|tic|kacang|kerupuk|malkist|kalpa|arden|bonita/i.test(str)
  }

  // 2. Extract Size/Volume/Unit Suffix
  let sizeSuffix = ''
  let cleanedName = rawName

  const sizeRegex = /\b(\d+(?:\.\d+)?\s*(?:l|liter|kg|gr|g|ml|pcs|pck|pack|dus|box|rtg|kaleng|galon))\b|\b(16|12|24|20)\b$/i
  const sizeMatch = cleanedName.match(sizeRegex)
  if (sizeMatch) {
    sizeSuffix = sizeMatch[0].replace(/\s+/g, '').toUpperCase()
    cleanedName = cleanedName.replace(sizeMatch[0], '').trim()
  }

  // Common Abbreviation Dictionary
  const dict: Record<string, string> = {
    'sampoerna': 'SAM',
    'djarum': 'DJR',
    'gudang': 'GDG',
    'garam': 'GRM',
    'bimoli': 'BML',
    'pandan': 'PDW',
    'wangi': '',
    'indomie': 'IDM',
    'chili': 'CHILI',
    'oil': 'OIL',
    'goreng': 'GRG',
    'kuah': 'KUAH',
    'kaldu': 'KLD',
    'siomay': 'SMY',
    'hakau': 'HKU',
    'lumpia': 'LMP',
    'ayam': 'AYM',
    'udang': 'UDG',
    'keju': 'KJU',
    'original': 'ORI',
    'jumbo': 'JMB',
    'lemon': 'LMN',
    'manis': 'MNS',
    'teh': 'TEA',
    'susu': 'SSU',
    'kopi': 'KOPI',
    'kapal': 'KPL',
    'api': 'API',
    'aqua': 'AQU',
    'biore': 'BIO',
    'shampoo': 'SHM',
    'sabun': 'SBN',
    'mild': 'MLD',
    'merah': 'MRH',
    'putih': 'PTH',
    'hitam': 'HTM',
    'kecap': 'KCP',
    'bango': 'BNG',
    'botol': 'BTL',
    'extra': 'EXT',
    'topping': 'TPG'
  }

  const words = cleanedName
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0)

  const codeParts: string[] = []

  for (const w of words) {
    const l = w.toLowerCase()
    if (dict[l] !== undefined) {
      if (dict[l]) codeParts.push(dict[l])
    } else if (w.length <= 4) {
      codeParts.push(w.toUpperCase())
    } else {
      const abbr = w.replace(/[aeiouAEIOU]/g, '').slice(0, 3).toUpperCase()
      codeParts.push(abbr.length >= 2 ? abbr : w.slice(0, 3).toUpperCase())
    }
  }

  let shortNameCode = codeParts.join('-')
  if (!shortNameCode) {
    shortNameCode = 'PRD'
  }

  let finalSku = `${prefix}-${shortNameCode}`
  if (sizeSuffix && !finalSku.endsWith(sizeSuffix)) {
    finalSku += `-${sizeSuffix}`
  }

  return finalSku.replace(/-+/g, '-').replace(/^-|-$/g, '')
}
