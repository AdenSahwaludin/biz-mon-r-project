export function useFormatCurrency() {
  const format = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatShort = (value: number): string => {
    if (value >= 1_000_000_000) {
      return `Rp ${(value / 1_000_000_000).toFixed(1)}M`
    }
    if (value >= 1_000_000) {
      return `Rp ${(value / 1_000_000).toFixed(1)}jt`
    }
    if (value >= 1_000) {
      return `Rp ${(value / 1_000).toFixed(0)}rb`
    }
    return format(value)
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatDateShort = (dateStr: string): string => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(date)
  }

  return { format, formatShort, formatDate, formatDateTime, formatTime, formatDateShort }
}
