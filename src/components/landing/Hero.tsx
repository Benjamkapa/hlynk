import { ArrowRight, ShoppingBag, Hotel, Car, Wrench, Droplets, ShieldCheck, Zap, Building2 } from 'lucide-react'
import { useState } from 'react'

// NOTE: swap the two <a> tags below back to <Link to="..."> from 'react-router-dom'
// when you drop this into your app — plain anchors are used here only so the
// preview renders without a Router provider.

function GoogleG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17">
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    </svg>
  )
}

const TRADES = [
  {
    id: 'retail',
    label: 'Duka & Retail',
    icon: ShoppingBag,
    swatch: '#E3A23C',
    metricLabel: "Today's Sales",
    metric: 'KES 48,250',
    tag: '+18.4% margin',
    rows: ['Barcode scan-out', 'Low-stock alert · Sugar 2kg'],
  },
  {
    id: 'lodging',
    label: 'BnB & Lodges',
    icon: Hotel,
    swatch: '#35897B',
    metricLabel: 'Occupancy Tonight',
    metric: '82%',
    tag: '14 rooms filled',
    rows: ['Guest check-in · Rm 4', 'Housekeeping queue · 3 units'],
  },
  {
    id: 'rentals',
    label: 'Car Rentals',
    icon: Car,
    swatch: '#4C7FE3',
    metricLabel: 'Fleet Out Today',
    metric: '9 / 12',
    tag: '3 returns due 6pm',
    rows: ['KDA 214B · due in 2h', 'Mileage log pending · 1'],
  },
  {
    id: 'garage',
    label: 'Garage & Workshop',
    icon: Wrench,
    swatch: '#C4573D',
    metricLabel: 'Jobs In Bay',
    metric: '5 active',
    tag: '2 awaiting parts',
    rows: ['Bay 2 · brake job, 40min left', 'Parts order · alternator'],
  },
  {
    id: 'carwash',
    label: 'Car Wash',
    icon: Droplets,
    swatch: '#3FA0C9',
    metricLabel: 'Vehicles Today',
    metric: '31 washed',
    tag: 'KES 15,500 taken',
    rows: ['Bay 1 · full valet, 12min', 'Loyalty punch · 4 issued'],
  },
]

export default function Hero() {
  const [activeId, setActiveId] = useState('retail')
  const active = TRADES.find((t) => t.id === activeId) ?? TRADES[0]
  const ActiveIcon = active.icon

  return (
    <section className="relative pt-36 sm:pt-40 md:pt-44 pb-32 bg-[#12161C] text-[#F3EFE6] overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 blur-3xl pointer-events-none rounded-full opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(227,162,60,0.12), transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column */}
          <div className="lg:col-span-7 py-2 space-y-7">
            {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E3A23C]/25 bg-[#E3A23C]/[0.06] text-[#E3A23C] text-[11px] font-bold uppercase tracking-[0.14em]">
              Built for every kind of Kenyan business
            </div> */}

            <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black font-ubuntu tracking-tight leading-[1.06]">
              Duka, lodge, fleet, or workshop —
              <br className="hidden sm:block" />
              <span className="text-[#E3A23C]">run it all</span> from one board.
            </h1>

            <p className="text-[#AAB0BC] text-base sm:text-lg leading-relaxed max-w-2xl">
              Hlynk isn't built for one trade — it's built for how business actually
              happens in Kenya. Ring up sales, take bookings, dispatch a fleet, or
              track a job card, all with the same clean dashboard and the same
              M-Pesa till underneath.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="/register"
                className="px-7 py-4 rounded-xl bg-[#E3A23C] hover:bg-[#EFAF4A] text-[#12161C] font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-black/30 active:scale-95"
              >
                Start Free Trial <ArrowRight size={16} />
              </a>

              <a
                href="/login"
                className="px-6 py-4 rounded-xl bg-[#1B212B] border border-[#2A3240] hover:border-[#3A4456] font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95"
              >
                <GoogleG /> Sign In with Google
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-3 text-xs font-semibold text-[#8B93A3]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[#35897B]" /> One-click Google login
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={15} className="text-[#35897B]" /> Real-time M-Pesa & KCB sync
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 size={15} className="text-[#35897B]" /> Switch trades anytime
              </span>
            </div>
          </div>

          {/* Right Column: Trade Board */}
          <div className="lg:col-span-5">
            <div className="bg-[#1B212B] border border-[#2A3240] rounded-2xl overflow-hidden shadow-2xl">

              {/* Board header, styled like a route/destination sign */}
              <div className="px-5 py-3 bg-[#12161C] border-b border-[#2A3240] flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B93A3]">
                  Live on Hlynk right now
                </span>
                <span className="w-2 h-2 rounded-full bg-[#35897B] animate-pulse" />
              </div>

              {/* Trade tabs, destination-board style */}
              <div className="flex overflow-x-auto no-scrollbar border-b border-[#2A3240]">
                {TRADES.map((t) => {
                  const Icon = t.icon
                  const isActive = t.id === activeId
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveId(t.id)}
                      className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3.5 border-b-2 transition-colors ${
                        isActive ? 'border-current' : 'border-transparent opacity-45 hover:opacity-75'
                      }`}
                      style={{ color: isActive ? t.swatch : undefined }}
                    >
                      <Icon size={17} strokeWidth={2.25} />
                      <span className="text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap text-[#DDE1E8]">
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Active panel */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#2A3240]" style={{ background: `${active.swatch}0D` }}>
                  <div className="flex items-center gap-3">
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: `${active.swatch}22`, color: active.swatch }}
                    >
                      <ActiveIcon size={17} />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold text-[#8B93A3] uppercase tracking-widest">{active.metricLabel}</p>
                      <p className="text-xl font-black hl-mono">{active.metric}</p>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase whitespace-nowrap"
                    style={{ background: `${active.swatch}22`, color: active.swatch }}
                  >
                    {active.tag}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#8B93A3] uppercase tracking-widest">On the board</p>
                  {active.rows.map((row, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 bg-[#12161C] rounded-lg border border-[#2A3240]/80 text-xs font-semibold text-[#DDE1E8]">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: active.swatch }} />
                      {row}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[#2A3240]/80 flex items-center justify-between text-[11px] text-[#8B93A3]">
                <span className="font-medium">5 trades shown · more in settings</span>
                <span className="text-[#E3A23C] font-bold">Included free</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}