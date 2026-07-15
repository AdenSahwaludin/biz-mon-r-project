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

export const dashboardData: Record<string, DashboardData> = {
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
  'es-teh': {
    bisnis: 'Es Teh',
    slug: 'es-teh',
    icon: 'CupSoda',
    color: '#14B8A6',
    omzet_hari_ini: 620000,
    omzet_minggu_ini: 3800000,
    omzet_bulan_ini: 16200000,
    jumlah_transaksi_hari_ini: 78,
    jumlah_transaksi_bulan_ini: 1120,
    produk_terlaris: [
      { nama: 'Es Teh Manis Original', terjual: 320 },
      { nama: 'Es Teh Lemon', terjual: 180 },
      { nama: 'Es Teh Tarik', terjual: 145 },
      { nama: 'Es Teh Jumbo', terjual: 95 },
      { nama: 'Teh Hangat Jahe', terjual: 60 },
    ],
    perubahan_omzet_harian: -5,
    grafik_penjualan_7_hari: [
      { hari: 'Sen', omzet: 580000 },
      { hari: 'Sel', omzet: 650000 },
      { hari: 'Rab', omzet: 620000 },
      { hari: 'Kam', omzet: 700000 },
      { hari: 'Jum', omzet: 680000 },
      { hari: 'Sab', omzet: 640000 },
      { hari: 'Min', omzet: 620000 },
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
  },
  'warung-sembako': {
    bisnis: 'Warung Sembako',
    slug: 'warung-sembako',
    icon: 'Store',
    color: '#22C55E',
    omzet_hari_ini: 3500000,
    omzet_minggu_ini: 21000000,
    omzet_bulan_ini: 89000000,
    jumlah_transaksi_hari_ini: 65,
    jumlah_transaksi_bulan_ini: 890,
    produk_terlaris: [
      { nama: 'Beras Premium 5kg', terjual: 180 },
      { nama: 'Minyak Goreng 2L', terjual: 150 },
      { nama: 'Indomie Goreng', terjual: 420 },
      { nama: 'Telur Ayam 1kg', terjual: 110 },
      { nama: 'Gula Pasir 1kg', terjual: 95 },
    ],
    perubahan_omzet_harian: 3,
    grafik_penjualan_7_hari: [
      { hari: 'Sen', omzet: 3200000 },
      { hari: 'Sel', omzet: 3400000 },
      { hari: 'Rab', omzet: 2900000 },
      { hari: 'Kam', omzet: 3600000 },
      { hari: 'Jum', omzet: 3300000 },
      { hari: 'Sab', omzet: 3700000 },
      { hari: 'Min', omzet: 3500000 },
    ],
  },
}

export const businessList = [
  { nama: 'Wonton', slug: 'wonton', icon: 'Soup', color: '#F97316' },
  { nama: 'Es Teh', slug: 'es-teh', icon: 'CupSoda', color: '#14B8A6' },
  { nama: 'Dimsum', slug: 'dimsum', icon: 'Utensils', color: '#F43F5E' },
  { nama: 'Warung Sembako', slug: 'warung-sembako', icon: 'Store', color: '#22C55E' },
]
