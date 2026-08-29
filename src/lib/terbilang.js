const SATUAN = [
  '',
  'Satu',
  'Dua',
  'Tiga',
  'Empat',
  'Lima',
  'Enam',
  'Tujuh',
  'Delapan',
  'Sembilan',
  'Sepuluh',
  'Sebelas',
]

function terbilangAngka(n) {
  n = Math.floor(n)
  if (n < 12) return SATUAN[n]
  if (n < 20) return `${terbilangAngka(n - 10)} Belas`
  if (n < 100) return `${terbilangAngka(Math.floor(n / 10))} Puluh ${terbilangAngka(n % 10)}`.trim()
  if (n < 200) return `Seratus ${terbilangAngka(n - 100)}`.trim()
  if (n < 1000) return `${terbilangAngka(Math.floor(n / 100))} Ratus ${terbilangAngka(n % 100)}`.trim()
  if (n < 2000) return `Seribu ${terbilangAngka(n - 1000)}`.trim()
  if (n < 1000000) return `${terbilangAngka(Math.floor(n / 1000))} Ribu ${terbilangAngka(n % 1000)}`.trim()
  if (n < 1000000000)
    return `${terbilangAngka(Math.floor(n / 1000000))} Juta ${terbilangAngka(n % 1000000)}`.trim()
  return `${terbilangAngka(Math.floor(n / 1000000000))} Miliar ${terbilangAngka(n % 1000000000)}`.trim()
}

/** Convert a number to Indonesian words, e.g. 75180000 -> "Tujuh Puluh Lima Juta Seratus Delapan Puluh Ribu Rupiah" */
export function terbilang(value) {
  const n = Math.round(Number(value || 0))
  if (n === 0) return 'Nol Rupiah'
  const words = terbilangAngka(n).replace(/\s+/g, ' ').trim()
  return `${words} Rupiah`
}
