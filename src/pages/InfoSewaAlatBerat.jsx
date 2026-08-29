import React from 'react'
import { Link } from 'react-router-dom'

const WHATSAPP_NUMBER = '6285239398785'
const EMAIL = 'pjjbmpuprntt@gmail.com'

const ALAT = [
  { key: 'excavator', nama: 'Excavator', img: '/assets/alat/excavator.jpg' },
  { key: 'bulldozer', nama: 'Bulldozer', img: '/assets/alat/bulldozer.jpg' },
  { key: 'wheel-loader', nama: 'Wheel Loader', img: '/assets/alat/wheel-loader.jpg' },
  { key: 'vibro-roller', nama: 'Vibro Roller', img: '/assets/alat/vibro-roller.jpg' },
  { key: 'motor-grader', nama: 'Motor Grader', img: '/assets/alat/motor-grader.jpg' },
  { key: 'water-tanker', nama: 'Water Tanker', img: '/assets/alat/water-tanker.jpg' },
  { key: 'asphalt-roller', nama: 'Asphalt Roller', img: '/assets/alat/asphalt-roller.jpg' },
  { key: 'backhoe-loader', nama: 'Backhoe Loader', img: '/assets/alat/backhoe-loader.jpg' },
]

function waLink(namaAlat) {
  const pesan = `Halo, saya ingin menanyakan ketersediaan sewa alat berat ${namaAlat} dari Dinas PUPR Provinsi NTT.`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`
}

export default function InfoSewaAlatBerat() {
  const marqueeItems = [...ALAT, ...ALAT] // digandakan agar loop mulus

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-navy-950">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <img src="/assets/logo-pupr-icon.png" alt="Logo PUPR" className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">DINAS PUPR PROVINSI NTT</p>
            <p className="text-xs text-white/60">Bidang Bina Marga &middot; Sewa Alat Berat</p>
          </div>
          <Link
            to="/login"
            className="ml-auto rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Masuk Petugas
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-950 px-6 py-14 text-center sm:py-20">
        <img
          src="/assets/logo-pupr-slogan.png"
          alt="Sigap Membangun Negeri"
          className="mx-auto mb-6 h-10 w-auto opacity-90 sm:h-12"
        />
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          SEWA ALAT BERAT
        </h1>
        <p className="mx-auto mt-3 inline-block rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-navy-950 sm:text-base">
          DINAS PUPR PROVINSI NTT
        </p>
        <p className="mx-auto mt-5 max-w-xl text-sm italic text-white/70 sm:text-base">
          &ldquo;Mendukung Pembangunan Infrastruktur untuk NTT yang Maju dan Terhubung&rdquo;
        </p>
      </section>

      {/* Marquee running text alat berat */}
      <section className="border-y border-navy-900 bg-navy-900 py-6">
        <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-amber-400">
          Jenis Alat Berat yang Disewakan
        </p>
        <div className="group relative overflow-hidden">
          <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
            {marqueeItems.map((alat, i) => (
              <div
                key={`${alat.key}-${i}`}
                className="w-44 flex-none overflow-hidden rounded-xl border border-white/10 bg-white shadow-sm sm:w-52"
              >
                <img src={alat.img} alt={alat.nama} className="h-28 w-full object-cover sm:h-32" />
                <p className="py-2 text-center text-xs font-bold text-navy-950 sm:text-sm">{alat.nama}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kartu tiap alat + tombol hubungi */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h2 className="mb-6 text-center text-lg font-bold text-navy-950 sm:text-xl">
          Pilih Alat Berat &amp; Hubungi Kami
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ALAT.map((alat) => (
            <div
              key={alat.key}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <img src={alat.img} alt={alat.nama} className="h-32 w-full object-cover sm:h-36" />
              <div className="flex flex-1 flex-col p-3">
                <p className="text-center text-sm font-bold text-navy-950">{alat.nama}</p>
                <a
                  href={waLink(alat.nama)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                  Hubungi Kami
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kontak */}
      <section className="bg-amber-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-navy-950 text-white">
              <PhoneIcon className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-navy-950">HUBUNGI KAMI</p>
              <p className="text-xs text-navy-950/70">Bidang Bina Marga &middot; Dinas PUPR Provinsi NTT</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-sm font-medium text-navy-950 sm:items-end">
            <a
              href={waLink('alat berat')}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              WhatsApp: 0852-3939-8785
            </a>
            <a href={`mailto:${EMAIL}`} className="hover:underline">
              Email: {EMAIL}
            </a>
            <span>Jl. W.J. Lalamentik, Oebobo &ndash; Kupang, Nusa Tenggara Timur</span>
          </div>
        </div>
      </section>
    </div>
  )
}

function WhatsAppIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.9.53 3.66 1.44 5.17L2 22l5.09-1.53a9.9 9.9 0 0 0 4.95 1.33c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.19c-.24.68-1.4 1.31-1.94 1.35-.5.04-1.03.26-3.5-.73-2.97-1.19-4.86-4.15-5.01-4.34-.15-.2-1.2-1.6-1.2-3.05 0-1.46.77-2.17 1.04-2.47.27-.3.59-.37.78-.37.2 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.83 1.99.9 2.14.07.15.12.32.02.51-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.24.66-.14.27.1 1.7.8 1.99.94.29.15.48.22.55.34.07.13.07.75-.17 1.43Z" />
    </svg>
  )
}

function PhoneIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
