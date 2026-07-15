export interface TransactionItem {
  produk: string
  qty: number
  harga: number
  subtotal: number
}

export interface Transaction {
  id: string
  bisnis: string
  tanggal: string
  kasir: string
  items: TransactionItem[]
  total: number
  bayar: number
  kembalian: number
  metode_pembayaran: 'Tunai' | 'QRIS'
  status: 'Selesai' | 'Batal'
}

export const transactions: Transaction[] = [
  {
    id: 'TRX-20260715-001',
    bisnis: 'Wonton',
    tanggal: '2026-07-15 09:30:00',
    kasir: 'Siti Nurhaliza',
    items: [
      { produk: 'Wonton Ayam Original', qty: 3, harga: 15000, subtotal: 45000 },
      { produk: 'Wonton Udang Spesial', qty: 2, harga: 20000, subtotal: 40000 },
    ],
    total: 85000,
    bayar: 100000,
    kembalian: 15000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260715-002',
    bisnis: 'Es Teh',
    tanggal: '2026-07-15 10:15:00',
    kasir: 'Budi Santoso',
    items: [
      { produk: 'Es Teh Manis Original', qty: 5, harga: 5000, subtotal: 25000 },
      { produk: 'Es Teh Lemon', qty: 3, harga: 7000, subtotal: 21000 },
    ],
    total: 46000,
    bayar: 50000,
    kembalian: 4000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260715-003',
    bisnis: 'Dimsum',
    tanggal: '2026-07-15 11:00:00',
    kasir: 'Rina Wati',
    items: [
      { produk: 'Siomay Ayam', qty: 2, harga: 12000, subtotal: 24000 },
      { produk: 'Hakau Udang', qty: 2, harga: 18000, subtotal: 36000 },
      { produk: 'Lumpia Udang', qty: 1, harga: 15000, subtotal: 15000 },
    ],
    total: 75000,
    bayar: 75000,
    kembalian: 0,
    metode_pembayaran: 'QRIS',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260715-004',
    bisnis: 'Warung Sembako',
    tanggal: '2026-07-15 13:45:00',
    kasir: 'Dedi Kurniawan',
    items: [
      { produk: 'Beras Premium 5kg', qty: 1, harga: 75000, subtotal: 75000 },
      { produk: 'Minyak Goreng 2L', qty: 2, harga: 36000, subtotal: 72000 },
      { produk: 'Telur Ayam 1kg', qty: 1, harga: 28000, subtotal: 28000 },
      { produk: 'Indomie Goreng', qty: 10, harga: 3500, subtotal: 35000 },
    ],
    total: 210000,
    bayar: 250000,
    kembalian: 40000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260714-005',
    bisnis: 'Wonton',
    tanggal: '2026-07-14 14:20:00',
    kasir: 'Siti Nurhaliza',
    items: [
      { produk: 'Wonton Kuah Pedas', qty: 4, harga: 18000, subtotal: 72000 },
    ],
    total: 72000,
    bayar: 72000,
    kembalian: 0,
    metode_pembayaran: 'QRIS',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260714-006',
    bisnis: 'Es Teh',
    tanggal: '2026-07-14 15:00:00',
    kasir: 'Budi Santoso',
    items: [
      { produk: 'Es Teh Manis Original', qty: 10, harga: 5000, subtotal: 50000 },
      { produk: 'Es Teh Tarik', qty: 5, harga: 8000, subtotal: 40000 },
    ],
    total: 90000,
    bayar: 100000,
    kembalian: 10000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260714-007',
    bisnis: 'Dimsum',
    tanggal: '2026-07-14 12:30:00',
    kasir: 'Rina Wati',
    items: [
      { produk: 'Bakpao Ayam', qty: 6, harga: 10000, subtotal: 60000 },
      { produk: 'Siomay Ayam', qty: 3, harga: 12000, subtotal: 36000 },
    ],
    total: 96000,
    bayar: 100000,
    kembalian: 4000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260713-008',
    bisnis: 'Warung Sembako',
    tanggal: '2026-07-13 08:15:00',
    kasir: 'Dedi Kurniawan',
    items: [
      { produk: 'Beras Premium 5kg', qty: 2, harga: 75000, subtotal: 150000 },
      { produk: 'Gula Pasir 1kg', qty: 3, harga: 18000, subtotal: 54000 },
      { produk: 'Kecap Manis ABC 275ml', qty: 2, harga: 12000, subtotal: 24000 },
    ],
    total: 228000,
    bayar: 230000,
    kembalian: 2000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260713-009',
    bisnis: 'Wonton',
    tanggal: '2026-07-13 16:45:00',
    kasir: 'Siti Nurhaliza',
    items: [
      { produk: 'Wonton Ayam Original', qty: 5, harga: 15000, subtotal: 75000 },
      { produk: 'Wonton Kuah Ayam', qty: 3, harga: 18000, subtotal: 54000 },
    ],
    total: 129000,
    bayar: 130000,
    kembalian: 1000,
    metode_pembayaran: 'Tunai',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260712-010',
    bisnis: 'Es Teh',
    tanggal: '2026-07-12 09:00:00',
    kasir: 'Budi Santoso',
    items: [
      { produk: 'Es Teh Jumbo', qty: 8, harga: 10000, subtotal: 80000 },
    ],
    total: 80000,
    bayar: 80000,
    kembalian: 0,
    metode_pembayaran: 'QRIS',
    status: 'Selesai',
  },
  {
    id: 'TRX-20260715-011',
    bisnis: 'Wonton',
    tanggal: '2026-07-15 08:00:00',
    kasir: 'Siti Nurhaliza',
    items: [
      { produk: 'Pangsit Goreng Keju', qty: 2, harga: 22000, subtotal: 44000 },
    ],
    total: 44000,
    bayar: 50000,
    kembalian: 6000,
    metode_pembayaran: 'Tunai',
    status: 'Batal',
  },
]
