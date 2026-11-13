
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
} from 'lucide-react'
import { Link } from 'react-router-dom'

const BUSINESS_TYPES = [
  { label: 'Shops & retail', icon: ShoppingBag },
  { label: 'Hotels & BnBs', icon: Hotel },
  { label: 'Car rentals', icon: Car },
  { label: 'Garages', icon: Wrench },
  { label: 'Service businesses', icon: BriefcaseBusiness },
]

const SUMMARY = [
  { label: 'Sales today', value: 'KES 48,250', icon: BarChart3 },
  { label: 'Expenses', value: 'KES 12,400', icon: ClipboardList },
  { label: 'Net profit', value: 'KES 35,850', icon: CircleDollarSign },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAF8] text-[#17231D]">
      {/* Subtle background detail */}
      <div className="pointer-events-none absolute -top-48 right-[-10%] h-[520px] w-[520px] rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-[-12%] h-[360px] w-[360px] rounded-full bg-emerald-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:px-12">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">

          {/* Main message */}
          <div className="lg:col-span-6">

            <h1 className="max-w-2xl text-[2.65rem] font-bold leading-[1.12] tracking-tight text-[#17231D] sm:text-5xl lg:text-[3.7rem]">
              Know how your business is doing,
              <span className="text-emerald-700"> without chasing the numbers.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Keep track of sales, expenses, customers and profit in one place.
              Hlynk makes it easier to understand your numbers and stay on top
              of your day-to-day operations.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-700" />
                14 days free
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-700" />
                No credit card required
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-700" />
                Set up at your own pace
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-[570px]">

              {/* Decorative background panel */}
              <div className="absolute -inset-4 rounded-3xl bg-emerald-100/60 rotate-2" />

              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">

                {/* Preview header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Business overview
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      A quick look at your business
                    </p>
                  </div>

                  <div className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                    Hlynk
                  </div>
                </div>

                {/* Dashboard summary */}
                <div className="p-5 sm:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Financial summary
                    </p>
                    <span className="text-[10px] text-slate-400">
                      Illustrative figures
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {SUMMARY.map((item) => {
                      const Icon = item.icon

                      return (
                        <div
                          key={item.label}
                          className="rounded-xl border border-slate-100 bg-[#FAFCFA] p-4"
                        >
                          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                            <Icon size={16} />
                          </div>

                          <p className="text-[11px] font-medium text-slate-500">
                            {item.label}
                          </p>

                          <p className="mt-1 whitespace-nowrap text-base font-bold tracking-tight text-slate-800">
                            {item.value}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Activity panel */}
                  <div className="mt-6 rounded-xl border border-slate-100">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-700">
                        Keep your business organised
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {[
                        {
                          title: 'Record your sales',
                          description: 'Keep every transaction accounted for.',
                        },
                        {
                          title: 'Track your expenses',
                          description: 'Know where your business money goes.',
                        },
                        {
                          title: 'Understand your profit',
                          description: 'See what remains after your expenses.',
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex items-start gap-3 px-4 py-3.5"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                            <Check size={14} />
                          </span>

                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {item.title}
                            </p>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-center text-[10px] text-slate-400">
                    Sample dashboard preview — actual figures depend on your business activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business types */}
        <div className="mt-20 border-t border-slate-200 pt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Made for businesses like yours
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Whether you sell products or provide services.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((business) => {
                const Icon = business.icon

                return (
                  <span
                    key={business.label}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-800"
                  >
                    <Icon size={14} className="text-emerald-700" />
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
