import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  ClipboardList,
  ShoppingBag,
  Hotel,
  Car,
  Wrench,
  BriefcaseBusiness,
  Sparkles,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const BUSINESS_TYPES = [
  { label: 'Shops & retail', icon: ShoppingBag, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { label: 'Hotels & BnBs', icon: Hotel, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { label: 'Car rentals', icon: Car, color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  { label: 'Garages', icon: Wrench, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
  { label: 'Service businesses', icon: BriefcaseBusiness, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
]

const SUMMARY = [
  { label: 'Sales today', value: 'KES 48,250', icon: BarChart3, badge: '+18% today', tone: 'text-emerald-400' },
  { label: 'Expenses', value: 'KES 12,400', icon: ClipboardList, badge: 'Logged', tone: 'text-amber-400' },
  { label: 'Net profit', value: 'KES 35,850', icon: CircleDollarSign, badge: 'Real margin', tone: 'text-teal-300' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-transparent text-white pt-10 pb-20 sm:pb-28">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-10 left-[-10%] h-[400px] w-[400px] rounded-full bg-teal-500/8 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">

          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-6 space-y-6">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded bg-emerald-700/10 backdrop-blur-md">
              <Sparkles size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-300 tracking-wide">
                Unified Commerce & Space OS
              </span>
            </div>

            <h1 className="max-w-2xl text-[2.5rem] font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.6rem] font-ubuntu">
              Know how your business is doing,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                without chasing the numbers.
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg font-medium">
              Keep track of sales, stock, expenses, and net profit in one clean place.
              From retail POS to BnB StayPages, Hlynk turns daily operations into transparent numbers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600/50 to-[#0D4A3E] hover:from-emerald-500 hover:to-emerald-700/50 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#who"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 backdrop-blur-md transition-all active:scale-95"
              >
                Explore Business Types
              </a>
            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                14 days full live access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                No credit card needed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-400" />
                Instant setup in 2 mins
              </span>
            </div>
          </div>

          {/* Right Column: Glassmorphic Product Preview with 3D Accents */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-[560px]">

              {/* Floating 3D Accent Badge (Top Right) */}
              <div className="absolute -top-6 -right-4 z-20 hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#141A1E]/90 border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/60 animate-bounce duration-1000">
                <img src="/assets/3d/bell.png" alt="Bell" className="w-7 h-7 object-contain drop-shadow" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 leading-none">Instant Alert</p>
                  <p className="text-xs font-bold text-white mt-0.5 leading-none">New Order: "Bright Sun"</p>
                </div>
              </div>

              {/* Glowing Outline Effect */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent blur-xl pointer-events-none" />

              {/* Main Preview Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141A1E]/75 backdrop-blur-xl shadow-2xl shadow-black/80">

                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 text-xs font-bold text-slate-300">Live Business Overview</span>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Real-time
                  </div>
                </div>

                {/* Dashboard summary */}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Today's Financial Snapshot
                    </p>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      KES Currency
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {SUMMARY.map((item) => {
                      const Icon = item.icon

                      return (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 backdrop-blur-sm hover:border-white/15 transition-all group"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-emerald-400 border border-white/10 group-hover:scale-105 transition-transform">
                              <Icon size={16} />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          </div>

                          <p className="text-[11px] font-medium text-slate-400">
                            {item.label}
                          </p>

                          <p className={`mt-1 whitespace-nowrap text-base font-extrabold tracking-tight ${item.tone} font-mono`}>
                            {item.value}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Operational Activity Stream */}
                  <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
                    <div className="border-b border-white/5 px-4 py-2.5 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-200">
                        Operational Flow
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">Automatic Reconciliation</span>
                    </div>

                    <div className="divide-y divide-white/5">
                      {[
                        {
                          title: 'Point of Sale & M-Pesa Checkout',
                          desc: 'Stock automatically adjusts on every sale or order.',
                          time: 'Just now',
                        },
                        {
                          title: 'Expense & Margin Tracking',
                          desc: 'Know your exact net profit after supplier and staff costs.',
                          time: 'Automated',
                        },
                        {
                          title: 'StayPage & Room Orders',
                          desc: 'Guests order extras via QR code without downloading an app.',
                          time: '24/7',
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Check size={12} />
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-200">
                                {item.title}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 truncate">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-3.5 text-center text-[10px] text-slate-500">
                    Real-time multi-tenant dashboard with automatic M-Pesa & audit logging.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business types bar */}
        <div className="mt-20 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                Tailored for every Kenyan business model
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Whether you operate retail shops, BnBs, car washes, or service centres.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((business) => {
                const Icon = business.icon

                return (
                  <span
                    key={business.label}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all cursor-default backdrop-blur-sm"
                  >
                    <Icon size={14} className="text-emerald-400" />
                    {business.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
