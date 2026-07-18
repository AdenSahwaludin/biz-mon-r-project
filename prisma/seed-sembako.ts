import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

function getPrisma(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (url && (url.startsWith('libsql://') || url.startsWith('https://'))) {
    const libsql = createClient({ url, authToken })
    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as any)
  }
  return new PrismaClient()
}

const prisma = getPrisma()

const categoriesWithProducts = [
  {
    name: 'Rokok',
    products: [
      { barcode: 'RK-001', name: 'ANDALAN BARU 16', price: 12000, unit: 'pcs' },
      { barcode: 'RK-002', name: 'APEL BESAR 76', price: 16000, unit: 'pcs' },
      { barcode: 'RK-003', name: 'APEL ROYAL', price: 16000, unit: 'pcs' },
      { barcode: 'RK-004', name: 'BALAI EMAS', price: 17000, unit: 'pcs' },
      { barcode: 'RK-005', name: 'BHUMI', price: 10000, unit: 'pcs' },
      { barcode: 'RK-006', name: 'CAMEL 12', price: 21000, unit: 'pcs' },
      { barcode: 'RK-007', name: 'CAMEL 16', price: 27000, unit: 'pcs' },
      { barcode: 'RK-008', name: 'CLAS MILD PUTIH', price: 30000, unit: 'pcs' },
      { barcode: 'RK-009', name: 'CLAS MILD UNGU', price: 30000, unit: 'pcs' },
      { barcode: 'RK-010', name: 'DJARUM 76 APEL', price: 15000, unit: 'pcs' },
      { barcode: 'RK-011', name: 'DJARUM 76 MANGGA', price: 16000, unit: 'pcs' },
      { barcode: 'RK-012', name: 'DJARUM COKLAT', price: 18000, unit: 'pcs' },
      { barcode: 'RK-013', name: 'DJARUM SUPER', price: 25000, unit: 'pcs' },
      { barcode: 'RK-014', name: 'DJARUM SUPER KRETEK', price: 18000, unit: 'pcs' },
      { barcode: 'RK-015', name: 'DJI SAM SOE', price: 21000, unit: 'pcs' },
      { barcode: 'RK-016', name: 'DJI SAM SOE MAESTRO', price: 20000, unit: 'pcs' },
      { barcode: 'RK-017', name: 'DJI SAM SOE REFFIL', price: 29000, unit: 'pcs' },
      { barcode: 'RK-018', name: 'DJINGGO', price: 11000, unit: 'pcs' },
      { barcode: 'RK-019', name: 'GAJAH BARU 12', price: 18500, unit: 'pcs' },
      { barcode: 'RK-020', name: 'GAJAH BARU 16', price: 24000, unit: 'pcs' },
      { barcode: 'RK-021', name: 'GALANG BARU 12', price: 18000, unit: 'pcs' },
      { barcode: 'RK-022', name: 'GG FILTER', price: 27500, unit: 'pcs' },
      { barcode: 'RK-023', name: 'GG MERAH 16', price: 20000, unit: 'pcs' },
      { barcode: 'RK-024', name: 'GG MERAH KECIL', price: 17000, unit: 'pcs' },
      { barcode: 'RK-025', name: 'HS', price: 11000, unit: 'pcs' },
      { barcode: 'RK-026', name: 'MAGNUM FILTER', price: 27000, unit: 'pcs' },
      { barcode: 'RK-027', name: 'MAGNUM FILTER BINTANG', price: 25000, unit: 'pcs' },
      { barcode: 'RK-028', name: 'MAGNUM KRETEK', price: 16000, unit: 'pcs' },
      { barcode: 'RK-029', name: 'MAHAYANA 16', price: 12000, unit: 'pcs' },
      { barcode: 'RK-030', name: 'MARLONG 20', price: 40000, unit: 'pcs' },
      { barcode: 'RK-031', name: 'MARLONG HITAM 12', price: 26000, unit: 'pcs' },
      { barcode: 'RK-032', name: 'MARLONG HITAM 16', price: 33000, unit: 'pcs' },
      { barcode: 'RK-033', name: 'ON BOLD 12', price: 18000, unit: 'pcs' },
      { barcode: 'RK-034', name: 'ON BOLD 16', price: 23000, unit: 'pcs' },
      { barcode: 'RK-035', name: 'ON BOLD 20', price: 29000, unit: 'pcs' },
      { barcode: 'RK-036', name: 'ONLINE UNGU 16', price: 25000, unit: 'pcs' },
      { barcode: 'RK-037', name: 'SAMPOERNA KRETEK', price: 19000, unit: 'pcs' },
      { barcode: 'RK-038', name: 'SAMPOERNA MILD HIJAU', price: 36000, unit: 'pcs' },
      { barcode: 'RK-039', name: 'SAMPOERNA MILD MERAH', price: 37000, unit: 'pcs' },
      { barcode: 'RK-040', name: 'SAMPOERNA MIRA', price: 16000, unit: 'pcs' },
      { barcode: 'RK-041', name: 'SAMPOERNA PRIMA', price: 17000, unit: 'pcs' }
    ]
  },
  {
    name: 'Bahan Pokok & Dapur',
    products: [
      { barcode: 'BP-001', name: 'BAWANG PUTIH', price: 38000, unit: 'kg' },
      { barcode: 'BP-002', name: 'BIHUN JAGUNG', price: 4000, unit: 'pcs' },
      { barcode: 'BP-003', name: 'CUKA', price: 3000, unit: 'botol' },
      { barcode: 'BP-004', name: 'DESAKU KETUMBAR BUBUK 1RTG', price: 2000, unit: 'pcs' },
      { barcode: 'BP-005', name: 'DESAKU KUNYIT BUBUK 1RTG', price: 1000, unit: 'pcs' },
      { barcode: 'BP-006', name: 'DESAKU MARINASI 1RTG', price: 2000, unit: 'pcs' },
      { barcode: 'BP-007', name: 'GARAM DAUN', price: 2000, unit: 'pcs' },
      { barcode: 'BP-008', name: 'GULA ROSE BRAND', price: 19000, unit: 'kg' },
      { barcode: 'BP-009', name: 'KECAP BANGO 700G', price: 25000, unit: 'pcs' },
      { barcode: 'BP-010', name: 'KECAP BANGO 1RTG', price: 11000, unit: 'rtg' },
      { barcode: 'BP-011', name: 'KECAP BANTAL', price: 5000, unit: 'pcs' },
      { barcode: 'BP-012', name: 'KECAP SEDAP', price: 2000, unit: 'pcs' },
      { barcode: 'BP-013', name: 'KECAP SEDAP 1RTG', price: 11000, unit: 'rtg' },
      { barcode: 'BP-014', name: 'KECAP SEDAP 725G', price: 22000, unit: 'pcs' },
      { barcode: 'BP-015', name: 'KELAPA CREAM BOX', price: 20000, unit: 'box' },
      { barcode: 'BP-016', name: 'KEMIRI 1KG', price: 54000, unit: 'kg' },
      { barcode: 'BP-017', name: 'LADAKU MERICA BUBUK 1RTG', price: 1000, unit: 'pcs' },
      { barcode: 'BP-018', name: 'MASAKO 1RTG', price: 5500, unit: 'rtg' },
      { barcode: 'BP-019', name: 'MI-WON 250GR', price: 12000, unit: 'pcs' },
      { barcode: 'BP-020', name: 'MIE KUNING', price: 17000, unit: 'pcs' },
      { barcode: 'BP-021', name: 'SARDEN', price: 7000, unit: 'kaleng' },
      { barcode: 'BP-022', name: 'TEPUNG BERAS ROSE BRAND', price: 9000, unit: 'pcs' },
      { barcode: 'BP-023', name: 'TEPUNG BOLED', price: 10500, unit: 'pcs' },
      { barcode: 'BP-024', name: 'TEPUNG KETAN HITAM', price: 11000, unit: 'pcs' },
      { barcode: 'BP-025', name: 'TEPUNG KETAN ROSE BRAND', price: 19000, unit: 'pcs' }
    ]
  },
  {
    name: 'Minyak & Olahan',
    products: [
      { barcode: 'MY-001', name: 'HEBAT HIJAU', price: 27000, unit: 'pcs' },
      { barcode: 'MY-002', name: 'HEBAT MERAH', price: 36000, unit: 'pcs' },
      { barcode: 'MY-003', name: 'MINYAK RESTO', price: 19000, unit: 'liter' },
      { barcode: 'MY-004', name: 'MINYAK TROBOS', price: 19000, unit: 'liter' },
      { barcode: 'MY-005', name: 'PALMIA', price: 7000, unit: 'pcs' }
    ]
  },
  {
    name: 'Minuman & Susu',
    products: [
      { barcode: 'MN-001', name: 'ANLENE', price: 27000, unit: 'box' },
      { barcode: 'MN-002', name: 'AQUA 600ML 1 DUS', price: 50000, unit: 'dus' },
      { barcode: 'MN-003', name: 'AQUA BOTOL BESAR 1DUS', price: 55000, unit: 'dus' },
      { barcode: 'MN-004', name: 'AQUVIVA', price: 24000, unit: 'dus' },
      { barcode: 'MN-005', name: 'BONTEH MATCHA / TEHTARIK', price: 26500, unit: 'dus' },
      { barcode: 'MN-006', name: 'CINGKU', price: 8000, unit: 'botol' },
      { barcode: 'MN-007', name: 'CLEO 1 LITER', price: 4000, unit: 'botol' },
      { barcode: 'MN-008', name: 'CLEO GALON', price: 21000, unit: 'galon' },
      { barcode: 'MN-009', name: 'DANCOW PUTIH/COKELAT', price: 40000, unit: 'box' },
      { barcode: 'MN-010', name: 'ENERGEN', price: 22500, unit: 'rtg' },
      { barcode: 'MN-011', name: 'ES TELER 1 DUS', price: 20000, unit: 'dus' },
      { barcode: 'MN-012', name: 'EXTRA JOSS', price: 13000, unit: 'rtg' },
      { barcode: 'MN-013', name: 'GALON LEMIN', price: 19000, unit: 'galon' },
      { barcode: 'MN-014', name: 'GOLDA', price: 40000, unit: 'dus' },
      { barcode: 'MN-015', name: 'GRANITA 1 DUS', price: 43000, unit: 'dus' },
      { barcode: 'MN-016', name: 'KOPI ABC', price: 17500, unit: 'rtg' },
      { barcode: 'MN-017', name: 'KOPI GOOD DAY FREEZE', price: 22000, unit: 'rtg' },
      { barcode: 'MN-018', name: 'KOPI GOOD DAY MOKACHINO/LATTE', price: 15000, unit: 'rtg' },
      { barcode: 'MN-019', name: 'KOPI INDOCAFE', price: 17500, unit: 'rtg' },
      { barcode: 'MN-020', name: 'KOPI KAPAL API', price: 17000, unit: 'rtg' },
      { barcode: 'MN-021', name: 'KOPI KAPAL API 60GR', price: 10000, unit: 'pcs' },
      { barcode: 'MN-022', name: 'KOPI LUWAK', price: 16000, unit: 'rtg' },
      { barcode: 'MN-023', name: 'KUKU BIMA ALL VARIANT', price: 6000, unit: 'rtg' },
      { barcode: 'MN-024', name: 'LARUTAN CAP BADAK', price: 26000, unit: 'pack' },
      { barcode: 'MN-025', name: 'LARUTAN KALENG', price: 8000, unit: 'kaleng' },
      { barcode: 'MN-026', name: 'LE MINERALE 600ML 1 DUS', price: 47000, unit: 'dus' },
      { barcode: 'MN-027', name: 'LE MINERALE 1.5L 1 DUS', price: 60000, unit: 'dus' },
      { barcode: 'MN-028', name: 'LE MINERALE GALON', price: 22000, unit: 'galon' },
      { barcode: 'MN-029', name: 'LEMINERAL MINI 330ML', price: 41000, unit: 'dus' },
      { barcode: 'MN-030', name: 'MILKU ALL VARIAN', price: 40000, unit: 'dus' },
      { barcode: 'MN-031', name: 'NUTRISARI', price: 12000, unit: 'rtg' },
      { barcode: 'MN-032', name: 'PIKOPI', price: 15000, unit: 'rtg' },
      { barcode: 'MN-033', name: 'POCARI', price: 8000, unit: 'botol' },
      { barcode: 'MN-034', name: 'QIANA BOTOL', price: 29000, unit: 'dus' },
      { barcode: 'MN-035', name: 'QIANA GELAS 1 DUS', price: 18000, unit: 'dus' },
      { barcode: 'MN-036', name: 'SUSU BENDERA SASET PUTIH/COKELAT', price: 8500, unit: 'rtg' },
      { barcode: 'MN-037', name: 'SUSU KOTAK BENDERA', price: 3000, unit: 'pcs' },
      { barcode: 'MN-038', name: 'SUSU KOTAK FRISIAN FLAG', price: 3500, unit: 'pcs' },
      { barcode: 'MN-039', name: 'SUSU ULTRA MIMI', price: 5000, unit: 'pcs' },
      { barcode: 'MN-040', name: 'TEAJUS 1 PAK', price: 19000, unit: 'pak' },
      { barcode: 'MN-041', name: 'TEH ARINDA', price: 20000, unit: 'pak' },
      { barcode: 'MN-042', name: 'TEH BOTOL 350GR 1 DUS', price: 50000, unit: 'dus' },
      { barcode: 'MN-043', name: 'TEH CELUP SOSRO SACHET', price: 9000, unit: 'box' },
      { barcode: 'MN-044', name: 'TEH PUCUK 1 DUS', price: 65000, unit: 'dus' },
      { barcode: 'MN-045', name: 'TEH RIO 1 DUS', price: 20000, unit: 'dus' },
      { barcode: 'MN-046', name: 'TEH SARI WANGI KOTAK BOX', price: 7000, unit: 'box' },
      { barcode: 'MN-047', name: 'TEH TARIK MAXTEA', price: 26500, unit: 'rtg' },
      { barcode: 'MN-048', name: 'TOP ICE ALL VARIAN', price: 3500, unit: 'rtg' },
      { barcode: 'MN-049', name: 'TORA CAFE', price: 15000, unit: 'rtg' },
      { barcode: 'MN-050', name: 'YAKULT MANGGA', price: 13000, unit: 'pack' },
      { barcode: 'MN-051', name: 'YAKULT ORIGINAL', price: 11000, unit: 'pack' },
      { barcode: 'MN-052', name: 'YOU C 1000', price: 8000, unit: 'botol' }
    ]
  },
  {
    name: 'Makanan & Snack',
    products: [
      { barcode: 'SN-001', name: 'ARDEN PACK KECIL', price: 7000, unit: 'pcs' },
      { barcode: 'SN-002', name: 'ASTOR BOX', price: 15000, unit: 'box' },
      { barcode: 'SN-003', name: 'BONITA', price: 22000, unit: 'box' },
      { barcode: 'SN-004', name: 'CHAMPION', price: 18000, unit: 'box' },
      { barcode: 'SN-005', name: 'CHOCOLATOS', price: 22500, unit: 'box' },
      { barcode: 'SN-006', name: 'CHOKI STIX BOX', price: 20000, unit: 'box' },
      { barcode: 'SN-007', name: 'FRUTTA GUMMY BOX', price: 18000, unit: 'box' },
      { barcode: 'SN-008', name: 'KACANG OLAH 1KG', price: 40000, unit: 'kg' },
      { barcode: 'SN-009', name: 'KALPA BOX', price: 20000, unit: 'box' },
      { barcode: 'SN-010', name: 'KERUPUK 1KG', price: 20000, unit: 'kg' },
      { barcode: 'SN-011', name: 'MALKIST ABON 1PCK', price: 9000, unit: 'pck' },
      { barcode: 'SN-012', name: 'MALKIST COKELAT', price: 9000, unit: 'pck' },
      { barcode: 'SN-013', name: 'MAXCORN 1RTG', price: 18000, unit: 'rtg' },
      { barcode: 'SN-014', name: 'NABATI BOX', price: 9000, unit: 'box' },
      { barcode: 'SN-015', name: 'NEXTAR BOX ALL VARIAN', price: 18000, unit: 'box' },
      { barcode: 'SN-016', name: 'PERMEN KISS ALL VARIAN 1PCK', price: 8000, unit: 'pck' },
      { barcode: 'SN-017', name: 'PERMEN KOPIKO 1PCK', price: 11000, unit: 'pck' },
      { barcode: 'SN-018', name: 'POP MIE DOER', price: 6000, unit: 'pcs' },
      { barcode: 'SN-019', name: 'ROMA ARDEN BOX', price: 20000, unit: 'box' },
      { barcode: 'SN-020', name: 'ROMA KELAPA BOX', price: 18000, unit: 'box' },
      { barcode: 'SN-021', name: 'ROMA SANDWICH COKLAT/KACANG', price: 8000, unit: 'box' },
      { barcode: 'SN-022', name: 'SARI GANDUM 1 PCK', price: 18000, unit: 'pck' },
      { barcode: 'SN-023', name: 'SARI GANDUM BOX', price: 20000, unit: 'box' },
      { barcode: 'SN-024', name: 'SAYANG BOX', price: 10000, unit: 'box' },
      { barcode: 'SN-025', name: 'SIIP 1RTG', price: 18000, unit: 'rtg' },
      { barcode: 'SN-026', name: 'SIIP BOX ALL VARIAN', price: 9000, unit: 'box' },
      { barcode: 'SN-027', name: 'SUPER STAR BOX', price: 18000, unit: 'box' },
      { barcode: 'SN-028', name: 'TARO 1RTG', price: 9000, unit: 'rtg' },
      { barcode: 'SN-029', name: 'TIC TIC 1RTG', price: 18000, unit: 'rtg' }
    ]
  },
  {
    name: 'Kebersihan & Perlengkapan',
    products: [
      { barcode: 'KB-001', name: 'AMPLOP', price: 18000, unit: 'pck' },
      { barcode: 'KB-002', name: 'AUTAN 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-003', name: 'BALSAM GELIGA KECIL', price: 7000, unit: 'pcs' },
      { barcode: 'KB-004', name: 'BAYCLIN', price: 8000, unit: 'botol' },
      { barcode: 'KB-005', name: 'CLING SEMPROT', price: 15000, unit: 'botol' },
      { barcode: 'KB-006', name: 'DAIA 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-007', name: 'DAIA 245GR', price: 5000, unit: 'pcs' },
      { barcode: 'KB-008', name: 'DAIA 800GR', price: 18000, unit: 'pcs' },
      { barcode: 'KB-009', name: 'DOWNY 22ML', price: 5000, unit: 'rtg' },
      { barcode: 'KB-010', name: 'EKONOMI NANAS 650ML', price: 10000, unit: 'pcs' },
      { barcode: 'KB-011', name: 'FRENEH FRISS 1RTG', price: 18000, unit: 'rtg' },
      { barcode: 'KB-012', name: 'GELAS PLASTIK', price: 8000, unit: 'pck' },
      { barcode: 'KB-013', name: 'GENTLE GEN GRATIS PIRING', price: 11000, unit: 'pcs' },
      { barcode: 'KB-014', name: 'GOLIATH', price: 6000, unit: 'pcs' },
      { barcode: 'KB-015', name: 'JOYO BOYO PLASTIK 15', price: 12000, unit: 'pck' },
      { barcode: 'KB-016', name: 'JOYO BOYO PLASTIK 24', price: 10000, unit: 'pck' },
      { barcode: 'KB-017', name: 'KAPAS SELECTION', price: 6000, unit: 'pcs' },
      { barcode: 'KB-018', name: 'KISPRAY 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-019', name: 'KORAN 1KG', price: 20000, unit: 'kg' },
      { barcode: 'KB-020', name: 'LAMPU 15WATT', price: 15000, unit: 'pcs' },
      { barcode: 'KB-021', name: 'LAMPU 20WATT', price: 18000, unit: 'pcs' },
      { barcode: 'KB-022', name: 'MINYAK KAYU PUTIH', price: 13000, unit: 'botol' },
      { barcode: 'KB-023', name: 'MIRANDA', price: 14000, unit: 'pcs' },
      { barcode: 'KB-024', name: 'OBAT NYAMUK KINGKONG', price: 6500, unit: 'pcs' },
      { barcode: 'KB-025', name: 'PEPSODENT 72GR', price: 5000, unit: 'pcs' },
      { barcode: 'KB-026', name: 'PLASTIK JOYO BOYO BESAR', price: 10000, unit: 'pck' },
      { barcode: 'KB-027', name: 'PLASTIK JOYO BOYO KECIL', price: 12000, unit: 'pck' },
      { barcode: 'KB-028', name: 'PLASTIK KEPUDANG', price: 7000, unit: 'pck' },
      { barcode: 'KB-029', name: 'PLASTIK SARI(11X25)', price: 13000, unit: 'pck' },
      { barcode: 'KB-030', name: 'PLASTIK SARI(9X25)', price: 15000, unit: 'pck' },
      { barcode: 'KB-031', name: 'RINSO 1000 1RTG', price: 5500, unit: 'rtg' },
      { barcode: 'KB-032', name: 'RINSO BUBUK 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-033', name: 'ROYALE 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-034', name: 'SABUN BIO+ 650ML', price: 10000, unit: 'botol' },
      { barcode: 'KB-035', name: 'SABUN BIORE 400ML', price: 20000, unit: 'botol' },
      { barcode: 'KB-036', name: 'SABUN BOOM', price: 5000, unit: 'pcs' },
      { barcode: 'KB-037', name: 'SABUN FRESS 800ML', price: 18000, unit: 'botol' },
      { barcode: 'KB-038', name: 'SABUN K 400ML', price: 19000, unit: 'botol' },
      { barcode: 'KB-039', name: "SABUN SHINZU'I", price: 5000, unit: 'pcs' },
      { barcode: 'KB-040', name: "SABUN SHINZU'I 85ML", price: 7000, unit: 'botol' },
      { barcode: 'KB-041', name: 'SEDOTAN', price: 5500, unit: 'pck' },
      { barcode: 'KB-042', name: 'SHAMPO REJOICE 1RTG', price: 10000, unit: 'rtg' },
      { barcode: 'KB-043', name: 'SHAMPO ZINK 1RTG', price: 10000, unit: 'rtg' },
      { barcode: 'KB-044', name: 'SIKAT FORMULA', price: 3000, unit: 'pcs' },
      { barcode: 'KB-045', name: 'SOFEL BENGKOANG 1RTG', price: 11000, unit: 'rtg' },
      { barcode: 'KB-046', name: 'SOFEL JERUK 1RTG', price: 5500, unit: 'rtg' },
      { barcode: 'KB-047', name: 'SOKLIN LANTAI 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-048', name: 'SOKLIN LIQUID 1RTG', price: 5000, unit: 'rtg' },
      { barcode: 'KB-049', name: 'SOKLIN LIQUID 525ML', price: 10000, unit: 'botol' },
      { barcode: 'KB-050', name: 'SUNLIGHT', price: 2000, unit: 'pcs' },
      { barcode: 'KB-051', name: 'SUPER PELL 100ML', price: 2000, unit: 'botol' },
      { barcode: 'KB-052', name: 'SUPER PELL 280ML', price: 5000, unit: 'botol' },
      { barcode: 'KB-053', name: 'TISU BASAH MITU BABY', price: 8000, unit: 'pack' },
      { barcode: 'KB-054', name: 'TISU JOLLY', price: 9000, unit: 'pack' },
      { barcode: 'KB-055', name: 'VANISH 1RTG', price: 4000, unit: 'rtg' },
      { barcode: 'KB-056', name: 'VIXAL', price: 5000, unit: 'botol' },
      { barcode: 'KB-057', name: 'WIPOL 190GR', price: 5000, unit: 'pcs' }
    ]
  }
]

async function seedSembako() {
  console.log('📦 Finding/Creating Warung Sembako business...')
  let sembakoBiz = await prisma.business.findUnique({
    where: { slug: 'sembako' }
  })

  if (!sembakoBiz) {
    sembakoBiz = await prisma.business.create({
      data: {
        name: 'Warung Sembako',
        slug: 'sembako',
        icon: 'Store',
        color: 'bg-emerald-100 text-emerald-600',
        branches: {
          create: { name: 'Pusat' }
        }
      }
    })
  }

  const allProductsToCreate: any[] = []

  for (const catData of categoriesWithProducts) {
    let category = await prisma.category.findFirst({
      where: { name: catData.name, businessId: sembakoBiz.id }
    })

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: catData.name,
          businessId: sembakoBiz.id
        }
      })
    }

    for (const prod of catData.products) {
      allProductsToCreate.push({
        id: 'smb-' + prod.barcode.toLowerCase(),
        barcode: prod.barcode,
        name: prod.name,
        price: prod.price,
        stock: 100,
        unit: prod.unit,
        businessId: sembakoBiz.id,
        categoryId: category.id,
        updatedAt: new Date()
      })
    }
  }

  console.log(`🧹 Clearing existing products for Warung Sembako...`)
  await prisma.product.deleteMany({
    where: { businessId: sembakoBiz.id }
  })

  console.log(`🚀 Bulk inserting ${allProductsToCreate.length} products into database...`)
  await prisma.product.createMany({
    data: allProductsToCreate
  })

  console.log(`🎉 Seed Sembako completed! ${allProductsToCreate.length} products ready.`)
}

seedSembako()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding Sembako:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
