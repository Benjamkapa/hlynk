import { ArrowRight, ShoppingBag, Hotel, Car, Wrench, Droplets, ShieldCheck, Zap, Building2 } from 'lucide-react'
import { useState, useId } from 'react'

// NOTE: swap the two <a> tags below back to <Link to="..."> from 'react-router-dom'
// when you drop this into your app — plain anchors are used here only so the
// preview renders without a Router provider.

// function GoogleG() {
//   return (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17">
//       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//       <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//       <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//     </svg>
//   )
// }

const TRADES = [
  {
    id: 'retail',
    label: 'Duka & Retail',
    icon: ShoppingBag,
    swatch: '#E3A23C',
    metricLabel: "Today's Sales",
    metric: 'KES 48,250',
    tag: '+18.4%',
    rows: ['Barcode scan-out', 'Low-stock alert · Sugar 2kg'],
  },
  {
    id: 'lodging',
    label: 'BnB & Lodges',
    icon: Hotel,
    swatch: '#7FB89C',
    metricLabel: 'Occupancy Tonight',
    metric: '82%',
    tag: '14 filled',
    rows: ['Guest check-in · Rm 4', 'Housekeeping queue · 3 units'],
  },
  {
    id: 'rentals',
    label: 'Car Rentals',
    icon: Car,
    swatch: '#7C93B0',
    metricLabel: 'Fleet Out Today',
    metric: '9 / 12',
    tag: '3 due 6pm',
    rows: ['KDA 214B · due in 2h', 'Mileage log pending · 1'],
  },
  {
    id: 'garage',
    label: 'Garage & Workshop',
    icon: Wrench,
    swatch: '#D98B72',
    metricLabel: 'Jobs In Bay',
    metric: '5 active',
    tag: '2 awaiting parts',
    rows: ['Bay 2 · brake job, 40min left', 'Parts order · alternator'],
  },
  {
    id: 'carwash',
    label: 'Car Wash',
    icon: Droplets,
    swatch: '#6FADC7',
    metricLabel: 'Vehicles Today',
    metric: '31 washed',
    tag: 'KES 15,500',
    rows: ['Bay 1 · full valet, 12min', 'Loyalty punch · 4 issued'],
  },
]

export default function Hero() {
  const [activeId, setActiveId] = useState('retail')
  const active = TRADES.find((t) => t.id === activeId) ?? TRADES[0]
  const ActiveIcon = active.icon
  const svgId = useId()

  const iconMarkup = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="transition-transform">
    <defs>
      <linearGradient id={`gl-red-yellow-${svgId}`} x1="0%" y1="0%" x2="0%" y2="70%">
        <stop offset="0%" stopColor="#EA4335" />
        <stop offset="50%" stopColor="#EA4335" />
        <stop offset="100%" stopColor="#FBBC05" />
      </linearGradient>
      <linearGradient id={`gl-yellow-green-${svgId}`} x1="0%" y1="0%" x2="0%" y2="70%">
        <stop offset="0%" stopColor="#FBBC05" />
        <stop offset="50%" stopColor="#FBBC05" />
        <stop offset="100%" stopColor="#34A853" />
      </linearGradient>
      <linearGradient id={`gl-green-blue-${svgId}`} x1="0%" y1="0%" x2="70%" y2="0%">
        <stop offset="0%" stopColor="#34A853" />
        <stop offset="50%" stopColor="#34A853" />
        <stop offset="100%" stopColor="#4285F4" />
      </linearGradient>
    </defs>
    <path fill={`url(#gl-red-yellow-${svgId})`} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill={`url(#gl-yellow-green-${svgId})`} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill={`url(#gl-green-blue-${svgId})`} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
  </svg>
)

  return (
    <section className="relative pt-36 sm:pt-40 md:pt-44 pb-32 bg-[#14181A] text-[#F3EFE6] overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 blur-3xl pointer-events-none rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(227,162,60,0.12), transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 space-y-7 py-5">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black pt-5 font-ubuntu tracking-tight leading-[1.06]">
              Duka, lodge, fleet, or workshop —
              <br className="hidden sm:block" />
              <span className="text-[#E3A23C]"> run it all</span> from one board.
            </h1>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href="/register"
                className="px-7 py-3.5 rounded-full bg-[#E3A23C] hover:opacity-85 text-[#14181A] font-bold text-sm transition-all flex items-center gap-2.5 active:scale-95"
              >
                Start free trial <ArrowRight size={16} />
              </a>

              <a
                href="/login"
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 font-bold text-sm text-white/80 transition-all flex items-center gap-2.5 active:scale-95"
              >
                {iconMarkup} Sign in with Google
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-[11px] font-semibold text-white/50">
                <ShieldCheck size={13} className="text-[#7FB89C]" /> Google login
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-[11px] font-semibold text-white/50">
                <Zap size={13} className="text-[#7FB89C]" /> M-Pesa & KCB sync
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-[11px] font-semibold text-white/50">
                <Building2 size={13} className="text-[#7FB89C]" /> Switch trades anytime
              </span>
            </div>
          </div>

          {/* Right Column: Trade Board */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#1B212B] border border-white/5 rounded-[28px] overflow-hidden">

              {/* Trade tabs, pill style matching the billing toggle */}
              <div className="flex flex-wrap gap-1.5 p-4 pt-7">
                {TRADES.map((t) => {
                  const Icon = t.icon
                  const isActive = t.id === activeId
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveId(t.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold transition-all ${
                        isActive ? 'text-[#14181A]' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                      style={isActive ? { backgroundColor: t.swatch } : undefined}
                    >
                      <Icon size={13} strokeWidth={2.5} />
                      {t.label}
                    </button>
                  )
                })}
              </div>

              {/* Active panel — flat solid color, same treatment as the pricing cards */}
              <div className="px-4 pb-4">
                <div
                  style={{ backgroundColor: active.swatch }}
                  className="rounded-3xl p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-[#14181A]/12 flex items-center justify-center flex-shrink-0 text-[#14181A]">
                        <ActiveIcon size={17} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-[#14181A]/55 uppercase tracking-widest">{active.metricLabel}</p>
                        <p className="text-xl font-black text-[#14181A] hl-mono">{active.metric}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#14181A]/12 text-[10px] font-bold text-[#14181A] whitespace-nowrap">
                      {active.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {active.rows.map((row, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#14181A]/10 rounded-xl text-[11px] font-semibold text-[#14181A]">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#14181A]/50" />
                        {row}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-5 flex items-center justify-between text-[11px] text-white/40">
                <span className="font-medium">5 trades · more in settings</span>
                <span className="px-2.5 py-1 rounded-full bg-white/5 text-[#E3A23C] font-bold">Included free</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}