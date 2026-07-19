export interface User {
  id: string
  nama: string
  email: string
  password: string
  role: 'Admin' | 'Karyawan'
  bisnis?: string
  status: 'Aktif' | 'Nonaktif'
  tanggal_bergabung: string
}

export const users: User[] = [
  {
    id: 'USR-001',
    nama: 'Aden Sahwaludin',
    email: 'aden@pantaubisnis.com',
    password: 'admin123',
    role: 'Admin',
    status: 'Aktif',
    tanggal_bergabung: '2025-01-10',
  },
  {
    id: 'USR-002',
    nama: 'Siti Nurhaliza',
    email: 'siti@pantaubisnis.com',
    password: 'karyawan123',
    role: 'Karyawan',
    bisnis: 'Wonton',
    status: 'Aktif',
    tanggal_bergabung: '2025-03-15',
  },
  {
    id: 'USR-003',
    nama: 'Budi Santoso',
    email: 'budi@pantaubisnis.com',
    password: 'karyawan123',
    role: 'Karyawan',
    bisnis: 'Es Teh',
    status: 'Aktif',
    tanggal_bergabung: '2025-04-01',
  },
  {
    id: 'USR-004',
    nama: 'Rina Wati',
    email: 'rina@pantaubisnis.com',
    password: 'karyawan123',
    role: 'Karyawan',
    bisnis: 'Dimsum',
    status: 'Nonaktif',
    tanggal_bergabung: '2025-05-20',
  },
  {
    id: 'USR-005',
    nama: 'Dedi Kurniawan',
    email: 'dedi@pantaubisnis.com',
    password: 'karyawan123',
    role: 'Karyawan',
    bisnis: 'Warung Sembako',
    status: 'Aktif',
    tanggal_bergabung: '2025-06-10',
  },
]
