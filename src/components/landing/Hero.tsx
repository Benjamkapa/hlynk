import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, PackageSearch, Receipt, Users, TrendingUp, BarChart3, ArrowRight, ShieldCheck } from 'lucide-react'
import { FadeUp } from './Animations'
import { motion, AnimatePresence } from 'framer-motion'

function MockCursorAnimation() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => (s + 1) % 4)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // Positions are relative to the content area (flex-1 div after the sidebar).
  //
  // Layout breakdown of the content area (MockCursorAnimation fills it):
  //   p-8 (32px) padding all sides
  //   Row 1  — top bar: KES amount left, "+ New Sale" button right     → y ≈ 14%
  //   Row 2  — two cards side-by-side, each ~44% wide with a gap       → y ≈ 48–56%
  //     Card 1 centre  → x ≈ 28%
  //     Card 2 centre  → x ≈ 72%
  //   Row 3  — bottom panel with the green "Sale Recorded" bar         → y ≈ 87%
  //     Green bar is full-width inside the panel, centred              → x ≈ 50%
  //   "+ New Sale" button sits right-aligned with ~32px right padding  → x ≈ 83%

  const cursorPositions = [
    { x: "83%", y: "14%" }, // Step 0 → clicks "+ New Sale" button (top-right)
    { x: "28%", y: "52%" }, // Step 1 → clicks Product card 1 (left card, cube icon)
    { x: "72%", y: "52%" }, // Step 2 → clicks Product card 2 (right card, chart icon)
    { x: "50%", y: "87%" }, // Step 3 → clicks "SALE RECORDED" green bar (bottom centre)
  ]

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden font-ubuntu">
      {/* Moving Cursor */}
      <motion.div
        animate={cursorPositions[step]}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute z-50"
        style={{ translateX: "-50%", translateY: "-50%" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="drop-shadow-lg">
          <path d="M1 1L8.5 19L11.5 11.5L19 8.5L1 1Z" fill="black" stroke="white" strokeWidth="2" />
        </svg>
        {step === 3 && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 bg-emerald-500/30 rounded-full"
          />
        )}
      </motion.div>

      {/* Mock Content */}
      <div className="p-8 space-y-8 relative h-full">
        {/* Row 1 — header bar */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="h-2 w-12 bg-slate-200 rounded" />
            <div className="text-xl font-black text-slate-900 hl-mono">KES 12,450</div>
          </div>
          <motion.div
            animate={{
              scale: step === 0 ? 1.05 : 1,
              backgroundColor: step === 0 ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.6)",
              borderColor: step === 0 ? "rgba(16,185,129,0.5)" : "rgba(16,185,129,0.2)",
            }}
            className="px-4 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest text-emerald-600"
          >
            + New Sale
          </motion.div>
        </div>

        {/* Row 2 — product cards */}
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <motion.div
              key={i}
              animate={{
                borderColor:
                  (step === 1 && i === 1) || (step === 2 && i === 2)
                    ? "rgba(16,185,129,0.5)"
                    : "rgba(255,255,255,0.4)",
                scale:
                  (step === 1 && i === 1) || (step === 2 && i === 2) ? 1.02 : 1,
              }}
              className="bg-white/60 p-6 rounded-xl border border-white/40 shadow-sm space-y-3"
            >
              <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                {i === 1 ? <PackageSearch size={16} /> : <TrendingUp size={16} />}
              </div>
              <div className="space-y-1">
                <div className="h-2 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-10 bg-slate-900/10 rounded" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Row 3 — bottom panel with sale confirmation */}
        <div className="bg-white/60 p-6 rounded-xl border border-white/40 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div className="h-3 w-24 bg-slate-900/5 rounded" />
            <div className="h-3 w-12 bg-emerald-500/20 rounded" />
          </div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex justify-between items-center opacity-40">
                <div className="flex gap-3 items-center">
                  <div className="h-6 w-6 bg-slate-100 rounded" />
                  <div className="h-2 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-2 w-8 bg-slate-900/10 rounded" />
              </div>
            ))}
          </div>

          <AnimatePresence>
            {step === 3 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="absolute inset-x-6 bottom-6 py-3 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest text-center shadow-xl shadow-emerald-900/20"
              >
                Sale Recorded! + KES 450 Profit
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-transparent">
      <img
        src="/img.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover blur-[3px] z-0 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24 text-left">

          {/* Left — copy */}
          <div className="flex-1 space-y-8 max-w-2xl">
            <FadeUp delay={0.1}>
              <h1 className="text-5xl md:text-6xl xl:text-8xl font-black text-slate-100 tracking-tighter leading-[0.95] font-ubuntu">
                Run your business.<br />
                <span className="text-[#0D4A3E]">Know your profit.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-lg md:text-xl font-medium leading-relaxed bg-[#0D4A3E] max-w-xl text-slate-100 italic p-2">
                Stop guessing your numbers. hlynk is the simple, powerful management portal that helps you
                track sales, inventory, and real-time profit in one place.
              </p>
            </FadeUp>

            <FadeUp delay={0.3} className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="px-10 py-5 rounded-xl bg-[#0D4A3E] text-white text-sm font-black uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2 group"
              >
                Start Free Trial
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-10 py-5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg shadow-slate-200/20"
              >
                Learn More
              </a>
            </FadeUp>
          </div>

          {/* Right — animated dashboard mockup */}
          <FadeUp delay={0.5} className="flex-1 relative w-full lg:max-w-none max-w-3xl">
            <div className="absolute -inset-10 bg-emerald-500/5 blur-[120px] rounded pointer-events-none" />
            <div className="relative bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-2xl overflow-hidden ring-1 ring-black/5">

              {/* Browser chrome */}
              <div className="bg-white/60 px-6 py-4 flex items-center gap-3 border-b border-white/20">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                </div>
                <div className="flex-1 text-center text-[9px] font-black tracking-[0.2em] text-slate-400 font-mono">
                  portal.hlynk.co.ke
                </div>
              </div>

              <div className="flex h-[450px]">
                {/* Mini sidebar */}
                <div className="w-20 bg-white/40 border-r border-white/20 p-6 space-y-8 flex flex-col items-center flex-shrink-0">
                  <img src="/fav.png" alt="" className="h-6 w-6 opacity-40" />
                  <div className="space-y-4">
                    {[LayoutDashboard, PackageSearch, Receipt, Users].map((Icon, i) => (
                      <div
                        key={i}
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          i === 0 ? 'bg-emerald-600/10 text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content area — cursor positions are relative to this div */}
                <div className="flex-1 relative overflow-hidden">
                  <MockCursorAnimation />
                </div>
              </div>
            </div>
          </FadeUp>

        </div>
      </div>
    </section>
  )
}