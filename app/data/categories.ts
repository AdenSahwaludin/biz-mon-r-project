export interface Category {
  id: string
  nama: string
  bisnis: string
  jumlah_produk: number
}

export const categories: Category[] = [
  // Wonton
  { id: 'CAT-001', nama: 'Wonton Goreng', bisnis: 'Wonton', jumlah_produk: 2 },
  { id: 'CAT-002', nama: 'Wonton Kuah', bisnis: 'Wonton', jumlah_produk: 2 },
  { id: 'CAT-003', nama: 'Pangsit', bisnis: 'Wonton', jumlah_produk: 1 },

  // Es Teh
  { id: 'CAT-004', nama: 'Es Teh', bisnis: 'Es Teh', jumlah_produk: 4 },
  { id: 'CAT-005', nama: 'Teh Hangat', bisnis: 'Es Teh', jumlah_produk: 1 },
  { id: 'CAT-006', nama: 'Minuman Spesial', bisnis: 'Es Teh', jumlah_produk: 0 },

  // Dimsum
  { id: 'CAT-007', nama: 'Kukus', bisnis: 'Dimsum', jumlah_produk: 4 },
  { id: 'CAT-008', nama: 'Goreng', bisnis: 'Dimsum', jumlah_produk: 1 },
  { id: 'CAT-009', nama: 'Spesial', bisnis: 'Dimsum', jumlah_produk: 0 },

  // Warung Sembako
  { id: 'CAT-010', nama: 'Beras', bisnis: 'Warung Sembako', jumlah_produk: 1 },
  { id: 'CAT-011', nama: 'Minyak', bisnis: 'Warung Sembako', jumlah_produk: 1 },
  { id: 'CAT-012', nama: 'Gula', bisnis: 'Warung Sembako', jumlah_produk: 1 },
  { id: 'CAT-013', nama: 'Telur', bisnis: 'Warung Sembako', jumlah_produk: 1 },
  { id: 'CAT-014', nama: 'Mie Instan', bisnis: 'Warung Sembako', jumlah_produk: 1 },
  { id: 'CAT-015', nama: 'Bumbu', bisnis: 'Warung Sembako', jumlah_produk: 1 },
  { id: 'CAT-016', nama: 'Minuman', bisnis: 'Warung Sembako', jumlah_produk: 0 },
  { id: 'CAT-017', nama: 'Snack', bisnis: 'Warung Sembako', jumlah_produk: 0 },
]

export const categoriesByBisnis: Record<string, string[]> = {
  'Wonton': ['Wonton Goreng', 'Wonton Kuah', 'Pangsit'],
  'Es Teh': ['Es Teh', 'Teh Hangat', 'Minuman Spesial'],
  'Dimsum': ['Kukus', 'Goreng', 'Spesial'],
  'Warung Sembako': ['Beras', 'Minyak', 'Gula', 'Telur', 'Mie Instan', 'Bumbu', 'Minuman', 'Snack'],
}
