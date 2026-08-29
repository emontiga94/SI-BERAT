function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Unduh array of objects sebagai file CSV (bisa dibuka langsung di Excel).
 * columns: [{ key, label }]
 */
export function downloadCsv(filename, columns, rows) {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeCsvCell(c.format ? c.format(row) : row[c.key])).join(','))
    .join('\n')
  const csv = `\uFEFF${header}\n${body}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
