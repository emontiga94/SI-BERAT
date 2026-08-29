import React, { useMemo, useState } from 'react'

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function toDateOnly(str) {
  if (!str) return null
  const d = new Date(`${str}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function inRange(day, start, end) {
  if (!start || !end) return false
  return day >= start && day <= end
}

/**
 * Kalender bulanan yang menandai rentang tanggal alat tertentu sudah
 * dibooking oleh transaksi sewa lain (bookings), dan menyorot rentang yang
 * sedang diisi user di form (selectedStart/selectedEnd) untuk memudahkan
 * memilih tanggal yang masih kosong.
 */
export default function AvailabilityCalendar({ bookings = [], selectedStart, selectedEnd }) {
  const initialMonthRef = toDateOnly(selectedStart) || new Date()
  const [viewYear, setViewYear] = useState(initialMonthRef.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialMonthRef.getMonth())

  const selStart = toDateOnly(selectedStart)
  const selEnd = toDateOnly(selectedEnd)

  const bookedRanges = useMemo(
    () =>
      bookings
        .map((b) => ({
          start: toDateOnly(b.tanggal_mulai),
          end: toDateOnly(b.tanggal_selesai),
          nama: b.nama_penyewa,
        }))
        .filter((b) => b.start && b.end),
    [bookings]
  )

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1)
    const startOffset = firstOfMonth.getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const list = []
    for (let i = 0; i < startOffset; i++) list.push(null)
    for (let d = 1; d <= daysInMonth; d++) list.push(new Date(viewYear, viewMonth, d))
    return list
  }, [viewYear, viewMonth])

  function shiftMonth(delta) {
    let m = viewMonth + delta
    let y = viewYear
    if (m < 0) {
      m = 11
      y -= 1
    } else if (m > 11) {
      m = 0
      y += 1
    }
    setViewMonth(m)
    setViewYear(y)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-700 hover:bg-slate-100"
          aria-label="Bulan sebelumnya"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-xs font-semibold text-navy-950">
          {BULAN[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-700 hover:bg-slate-100"
          aria-label="Bulan berikutnya"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI.map((h) => (
          <span key={h} className="text-2xs font-semibold text-navy-900/35">
            {h}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`empty-${i}`} />
          const booking = bookedRanges.find((b) => inRange(date, b.start, b.end))
          const isSelected = inRange(date, selStart, selEnd)
          const isToday = date.getTime() === today.getTime()
          return (
            <div
              key={date.toISOString()}
              title={booking ? `Terpakai: ${booking.nama}` : undefined}
              className={`relative flex h-7 w-7 items-center justify-center rounded-lg text-2xs font-medium mx-auto ${
                booking
                  ? 'bg-red-100 text-red-700'
                  : isSelected
                  ? 'bg-amber-gradient text-navy-950'
                  : 'text-navy-900/70'
              } ${isToday && !booking && !isSelected ? 'ring-1 ring-inset ring-navy-900/25' : ''}`}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-2.5 text-2xs text-navy-900/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-100 ring-1 ring-inset ring-red-300" /> Sudah terpakai
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-gradient" /> Tanggal dipilih
        </span>
      </div>
    </div>
  )
}
