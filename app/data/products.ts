export interface Product {
  id: string
  barcode: string
  nama: string
  kategori: string
  harga: number
  stok: number
  satuan: string
  bisnis: string
  status: 'Aktif' | 'Nonaktif'
}

export const products: Product[] = [
  // === WONTON ===
  { id: 'WNT-001', barcode: '8991234001', nama: 'Wonton Ayam Original', kategori: 'Wonton Goreng', harga: 15000, stok: 120, satuan: 'porsi', bisnis: 'Wonton', status: 'Aktif' },
  { id: 'WNT-002', barcode: '8991234002', nama: 'Wonton Udang Spesial', kategori: 'Wonton Goreng', harga: 20000, stok: 85, satuan: 'porsi', bisnis: 'Wonton', status: 'Aktif' },
  { id: 'WNT-003', barcode: '8991234003', nama: 'Wonton Kuah Ayam', kategori: 'Wonton Kuah', harga: 18000, stok: 60, satuan: 'porsi', bisnis: 'Wonton', status: 'Aktif' },
  { id: 'WNT-004', barcode: '8991234004', nama: 'Wonton Kuah Pedas', kategori: 'Wonton Kuah', harga: 18000, stok: 45, satuan: 'porsi', bisnis: 'Wonton', status: 'Aktif' },
  { id: 'WNT-005', barcode: '8991234005', nama: 'Pangsit Goreng Keju', kategori: 'Pangsit', harga: 22000, stok: 30, satuan: 'porsi', bisnis: 'Wonton', status: 'Nonaktif' },

  // === ES TEH ===
  { id: 'ETH-001', barcode: '8991235001', nama: 'Es Teh Manis Original', kategori: 'Es Teh', harga: 5000, stok: 500, satuan: 'gelas', bisnis: 'Es Teh', status: 'Aktif' },
  { id: 'ETH-002', barcode: '8991235002', nama: 'Es Teh Lemon', kategori: 'Es Teh', harga: 7000, stok: 350, satuan: 'gelas', bisnis: 'Es Teh', status: 'Aktif' },
  { id: 'ETH-003', barcode: '8991235003', nama: 'Es Teh Tarik', kategori: 'Es Teh', harga: 8000, stok: 200, satuan: 'gelas', bisnis: 'Es Teh', status: 'Aktif' },
  { id: 'ETH-004', barcode: '8991235004', nama: 'Teh Hangat Jahe', kategori: 'Teh Hangat', harga: 6000, stok: 150, satuan: 'gelas', bisnis: 'Es Teh', status: 'Aktif' },
  { id: 'ETH-005', barcode: '8991235005', nama: 'Es Teh Jumbo', kategori: 'Es Teh', harga: 10000, stok: 100, satuan: 'gelas', bisnis: 'Es Teh', status: 'Aktif' },

  // === DIMSUM ===
  { id: 'DMS-001', barcode: '8991236001', nama: 'Siomay Ayam', kategori: 'Kukus', harga: 12000, stok: 90, satuan: 'porsi (4 pcs)', bisnis: 'Dimsum', status: 'Aktif' },
  { id: 'DMS-002', barcode: '8991236002', nama: 'Hakau Udang', kategori: 'Kukus', harga: 18000, stok: 60, satuan: 'porsi (4 pcs)', bisnis: 'Dimsum', status: 'Aktif' },
  { id: 'DMS-003', barcode: '8991236003', nama: 'Lumpia Udang', kategori: 'Goreng', harga: 15000, stok: 75, satuan: 'porsi (3 pcs)', bisnis: 'Dimsum', status: 'Aktif' },
  { id: 'DMS-004', barcode: '8991236004', nama: 'Ceker Ayam Saus Tiram', kategori: 'Kukus', harga: 14000, stok: 40, satuan: 'porsi', bisnis: 'Dimsum', status: 'Aktif' },
  { id: 'DMS-005', barcode: '8991236005', nama: 'Bakpao Ayam', kategori: 'Kukus', harga: 10000, stok: 50, satuan: 'pcs', bisnis: 'Dimsum', status: 'Aktif' },

  // === WARUNG SEMBAKO ===
  { id: 'SMB-001', barcode: '8991237001', nama: 'Beras Premium 5kg', kategori: 'Beras', harga: 75000, stok: 30, satuan: 'karung', bisnis: 'Warung Sembako', status: 'Aktif' },
  { id: 'SMB-002', barcode: '8991237002', nama: 'Minyak Goreng 2L', kategori: 'Minyak', harga: 36000, stok: 45, satuan: 'botol', bisnis: 'Warung Sembako', status: 'Aktif' },
  { id: 'SMB-003', barcode: '8991237003', nama: 'Gula Pasir 1kg', kategori: 'Gula', harga: 18000, stok: 60, satuan: 'pack', bisnis: 'Warung Sembako', status: 'Aktif' },
  { id: 'SMB-004', barcode: '8991237004', nama: 'Telur Ayam 1kg', kategori: 'Telur', harga: 28000, stok: 25, satuan: 'kg', bisnis: 'Warung Sembako', status: 'Aktif' },
  { id: 'SMB-005', barcode: '8991237005', nama: 'Indomie Goreng', kategori: 'Mie Instan', harga: 3500, stok: 200, satuan: 'pcs', bisnis: 'Warung Sembako', status: 'Aktif' },
  { id: 'SMB-006', barcode: '8991237006', nama: 'Kecap Manis ABC 275ml', kategori: 'Bumbu', harga: 12000, stok: 35, satuan: 'botol', bisnis: 'Warung Sembako', status: 'Aktif' },
]
