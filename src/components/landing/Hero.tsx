
import {
  ArrowRight,
  Check,
  ShoppingBag,
  Hotel,
  Car,
  Wrench,
  BriefcaseBusiness,
  Sparkles,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScrollFade } from '../../components/shared/ScrollFade'

const BUSINESS_TYPES = [
  {
    label: 'Shops & retail',
    icon: ShoppingBag,
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  {
    label: 'Hotels & BnBs',
    icon: Hotel,
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    label: 'Car rentals',
    icon: Car,
    color: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  },
  {
    label: 'Garages',
    icon: Wrench,
    color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  },
  {
    label: 'Service businesses',
    icon: BriefcaseBusiness,
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-transparent min-h-screen flex items-center text-white">


      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-10 left-[-10%] h-[400px] w-[400px] rounded-full bg-teal-500/[0.08] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 flex flex-col justify-center h-full">


        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">

          {/* Left Column: Heading & Value Proposition */}
          <ScrollFade className="space-y-6 lg:col-span-6">

            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded bg-emerald-700/10 px-3.5 py-1.5 backdrop-blur-md">

              <span className="text-xs font-bold tracking-wide text-emerald-300">
                Unified Commerce & Space OS
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="max-w-2xl font-ubuntu text-[2.5rem] font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
              Know how your business is doing,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                without chasing the numbers.
              </span>
            </h1>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">

              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600/50 to-[#0D4A3E] px-7 py-3.5 text-sm font-bold tracking-wide text-white shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] hover:from-emerald-500 hover:to-emerald-700/50 active:scale-95"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#who"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 active:scale-95"
              >
                Explore Business Types
              </a>

            </div>

            {/* Trust Points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 text-xs font-medium text-slate-400">

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
          </ScrollFade>

          {/* Right Column: Responsive Device Mockups */}
          <ScrollFade className="lg:col-span-6">

            <div className="relative mx-auto w-full max-w-[620px]">

              {/* Ambient Device Glow */}
              <div className="pointer-events-none absolute -inset-8 rounded-full bg-emerald-500/10 blur-[90px]" />

              {/* Desktop & Tablet: Laptop Display */}
              <motion.div
                className="relative z-10 hidden sm:block"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <img
                  src="/assets/hero/hlynk-laptop.png"
                  alt="Hlynk business management dashboard displayed on a laptop"
                  className="h-auto w-full object-contain drop-shadow-2xl"
                  fetchPriority="high"
                />
              </motion.div>

              {/* Mobile: iPhone 13 Display */}
              <motion.div
                className="relative z-10 flex justify-center py-5 sm:hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <div className="pointer-events-none absolute inset-0 m-auto h-72 w-72 rounded-full bg-emerald-500/10 blur-[65px]" />

                <img
                  src="/assets/hero/hlynk-iphone13.png"
                  alt="Hlynk mobile business dashboard displayed on an iPhone 13"
                  className="relative z-10 h-auto max-h-[490px] w-[235px] object-contain drop-shadow-2xl"
                  fetchPriority="high"
                />
              </motion.div>

            </div>
          </ScrollFade>

        </div>

        {/* Business Types Bar */}
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

            {/* Business Categories */}
            <div className="flex flex-wrap gap-2">

              {BUSINESS_TYPES.map((business) => {
                const Icon = business.icon

                return (
                  <span
                    key={business.label}
                    className={`inline-flex cursor-default items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold backdrop-blur-sm transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-white ${business.color}`}
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
