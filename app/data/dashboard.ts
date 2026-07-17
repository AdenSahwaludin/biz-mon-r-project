export interface DashboardData {
  bisnis: string
  slug: string
  icon: string
  color: string
  omzet_hari_ini: number
  omzet_minggu_ini: number
  omzet_bulan_ini: number
  jumlah_transaksi_hari_ini: number
  jumlah_transaksi_bulan_ini: number
  produk_terlaris: { nama: string; terjual: number }[]
  perubahan_omzet_harian: number
  grafik_penjualan_7_hari: { hari: string; omzet: number }[]
}

export const initialDashboardData: Record<string, DashboardData> = {
  wonton: {
    bisnis: 'Wonton',
    slug: 'wonton',
    icon: 'Soup',
    color: '#F97316',
    omzet_hari_ini: 850000,
    omzet_minggu_ini: 5200000,
    omzet_bulan_ini: 22500000,
    jumlah_transaksi_hari_ini: 32,
    jumlah_transaksi_bulan_ini: 456,
    produk_terlaris: [
      { nama: 'Wonton Ayam Original', terjual: 145 },
      { nama: 'Wonton Udang Spesial', terjual: 98 },
      { nama: 'Wonton Kuah Ayam', terjual: 87 },
      { nama: 'Wonton Kuah Pedas', terjual: 65 },
      { nama: 'Pangsit Goreng Keju', terjual: 42 },
    ],
    perubahan_omzet_harian: 12,
    grafik_penjualan_7_hari: [
      { hari: 'Sen', omzet: 680000 },
      { hari: 'Sel', omzet: 720000 },
      { hari: 'Rab', omzet: 550000 },
      { hari: 'Kam', omzet: 890000 },
      { hari: 'Jum', omzet: 760000 },
      { hari: 'Sab', omzet: 830000 },
      { hari: 'Min', omzet: 850000 },
    ],
  },
  'es-teh-cabang-1': {
    bisnis: 'Es Teh - Cabang 1',
    slug: 'es-teh-cabang-1',
    icon: 'CupSoda',
    color: '#14B8A6',
    omzet_hari_ini: 420000,
    omzet_minggu_ini: 2000000,
    omzet_bulan_ini: 8200000,
    jumlah_transaksi_hari_ini: 45,
    jumlah_transaksi_bulan_ini: 600,
    produk_terlaris: [
      { nama: 'Es Teh Manis Original', terjual: 180 },
      { nama: 'Es Teh Lemon', terjual: 90 },
      { nama: 'Es Teh Tarik', terjual: 85 },
      { nama: 'Es Teh Jumbo', terjual: 45 },
      { nama: 'Teh Hangat Jahe', terjual: 20 },
    ],
    perubahan_omzet_harian: -2,
    grafik_penjualan_7_hari: [
      { hari: 'Sen', omzet: 380000 },
      { hari: 'Sel', omzet: 450000 },
      { hari: 'Rab', omzet: 420000 },
      { hari: 'Kam', omzet: 500000 },
      { hari: 'Jum', omzet: 480000 },
      { hari: 'Sab', omzet: 440000 },
      { hari: 'Min', omzet: 420000 },
    ],
  },
  'es-teh-cabang-2': {
    bisnis: 'Es Teh - Cabang 2',
    slug: 'es-teh-cabang-2',
    icon: 'CupSoda',
    color: '#0D9488',
    omzet_hari_ini: 200000,
    omzet_minggu_ini: 1800000,
    omzet_bulan_ini: 8000000,
    jumlah_transaksi_hari_ini: 33,
    jumlah_transaksi_bulan_ini: 520,
    produk_terlaris: [
      { nama: 'Es Teh Manis Original', terjual: 140 },
      { nama: 'Es Teh Lemon', terjual: 90 },
      { nama: 'Es Teh Tarik', terjual: 60 },
      { nama: 'Es Teh Jumbo', terjual: 50 },
      { nama: 'Teh Hangat Jahe', terjual: 40 },
    ],
    perubahan_omzet_harian: 3,
    grafik_penjualan_7_hari: [
      { hari: 'Sen', omzet: 200000 },
      { hari: 'Sel', omzet: 200000 },
      { hari: 'Rab', omzet: 200000 },
      { hari: 'Kam', omzet: 200000 },
      { hari: 'Jum', omzet: 200000 },
      { hari: 'Sab', omzet: 200000 },
      { hari: 'Min', omzet: 200000 },
    ],
  },
  dimsum: {
    bisnis: 'Dimsum',
    slug: 'dimsum',
    icon: 'Utensils',
    color: '#F43F5E',
    omzet_hari_ini: 1200000,
    omzet_minggu_ini: 7500000,
    omzet_bulan_ini: 31000000,
    jumlah_transaksi_hari_ini: 45,
    jumlah_transaksi_bulan_ini: 580,
    produk_terlaris: [
      { nama: 'Siomay Ayam', terjual: 210 },
      { nama: 'Hakau Udang', terjual: 155 },
      { nama: 'Lumpia Udang', terjual: 130 },
      { nama: 'Bakpao Ayam', terjual: 95 },
      { nama: 'Ceker Ayam Saus Tiram', terjual: 72 },
    ],
    perubahan_omzet_harian: 8,
    grafik_penjualan_7_hari: [
      { hari: 'Sen', omzet: 980000 },
      { hari: 'Sel', omzet: 1100000 },
      { hari: 'Rab', omzet: 1050000 },
      { hari: 'Kam', omzet: 1250000 },
      { hari: 'Jum', omzet: 1180000 },
      { hari: 'Sab', omzet: 1300000 },
      { hari: 'Min', omzet: 1200000 },
    ],
  }
}

export const initialBusinessList = [
  { nama: 'Wonton', slug: 'wonton', icon: 'Soup', color: '#F97316', isActive: true },
  { nama: 'Es Teh - Cabang 1', slug: 'es-teh-cabang-1', icon: 'CupSoda', color: '#14B8A6', isActive: true },
  { nama: 'Es Teh - Cabang 2', slug: 'es-teh-cabang-2', icon: 'CupSoda', color: '#0D9488', isActive: true },
  { nama: 'Dimsum', slug: 'dimsum', icon: 'Utensils', color: '#F43F5E', isActive: true },
]
