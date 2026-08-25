import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, CalendarCheck, Hotel, ShieldCheck, Zap, Sparkles, Building } from 'lucide-react'
import { useState } from 'react'

function GoogleG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    </svg>
  )
}

export default function Hero() {
  const [activePreview, setActivePreview] = useState<'POS' | 'RENTALS'>('POS')

  return (
    <section className="relative pt-28 pb-32 bg-slate-950 text-white overflow-hidden">
      {/* Soft background accents without heavy filter repaints */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-950/40 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Multi-Industry Business Operating System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-ubuntu tracking-tight leading-[1.08] text-slate-100">
              One platform for <br className="hidden sm:block" />
              <span className="text-emerald-400">Retail Sales</span> & <span className="text-teal-300">Bookings / Rentals.</span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
              Whether you operate a retail shop, supermarket, BnB units, car rental fleet, car wash, or service garage — Hlynk brings sales, inventory, reservations, and real-time profit tracking into one clean dashboard.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register"
                className="px-7 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 shadow-lg shadow-emerald-950/50 active:scale-95"
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>

              <Link
                to="/login"
                className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 active:scale-95"
              >
                <GoogleG /> Sign In with Google
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" /> One-Click Google Login
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={16} className="text-emerald-400" /> Real-time M-Pesa & KCB Sync
              </span>
              <span className="flex items-center gap-1.5">
                <Building size={16} className="text-emerald-400" /> Switch Modules Anytime
              </span>
            </div>
          </div>

          {/* Right Column: Clean Interactive Feature Preview */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              
              {/* Module Selector Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800/60">
                <button
                  onClick={() => setActivePreview('POS')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activePreview === 'POS'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag size={14} /> Retail & POS
                </button>
                <button
                  onClick={() => setActivePreview('RENTALS')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    activePreview === 'RENTALS'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Hotel size={14} /> Bookings & Rentals
                </button>
              </div>

              {/* Preview Body */}
              {activePreview === 'POS' ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Retail Sales</p>
                      <p className="text-xl font-black text-white hl-mono">KES 48,250</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-black uppercase">
                      +18.4% Margin
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
                        <span className="font-bold text-slate-200">Barcode Scanner</span>
                        <Zap size={14} className="text-emerald-400" />
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
                        <span className="font-bold text-slate-200">Low Stock Alerts</span>
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Occupancy & Bookings</p>
                      <p className="text-xl font-black text-emerald-400">82% Occupied</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[10px] font-black uppercase">
                      14 Active Stays/Fleet
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Operations & Tasks</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
                        <span className="font-bold text-slate-200">Guest Check-Ins</span>
                        <CalendarCheck size={14} className="text-emerald-400" />
                      </div>
                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between">
                        <span className="font-bold text-slate-200">Housekeeping Queue</span>
                        <Sparkles size={14} className="text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Feature Footer */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium">Self-service module toggle in settings</span>
                <span className="text-emerald-400 font-bold">Included Free</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
