import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { FadeUp } from './Animations'

const pricingPlans = [
  {
    name: "Solo Shop",
    monthlyPrice: "1,000",
    yearlyPrice: "10,800",
    monthlyEquivalent: "900",
    desc: "Simple daily recording for one shop owner who wants to know profit and control expenses.",
    color: "bg-[#F472B6]",
    features: [
      "Record sales in seconds",
      "Track daily expenses",
      "See profit instantly",
      "Basic stock tracking",
      "Secure cloud backup"
    ],
    buttonText: "Start Free Trial"
  },
  {
    name: "Busy Shop",
    monthlyPrice: "2,500",
    yearlyPrice: "27,000",
    monthlyEquivalent: "2,250",
    desc: "For shops with many products or staff who need better stock and daily control.",
    color: "bg-[#2DD4BF]",
    features: [
      "Everything in Solo Shop",
      "Full inventory management",
      "Low stock alerts",
      "Multiple staff accounts",
      "Monthly business reports"
    ],
    buttonText: "Upgrade My Shop"
  },
  {
    name: "Multi-Shop",
    monthlyPrice: "5,000",
    yearlyPrice: "54,000",
    monthlyEquivalent: "4,500",
    desc: "Manage multiple branches and monitor performance from one dashboard.",
    color: "bg-[#FBBF24]",
    features: [
      "Everything in Busy Shop",
      "Multiple shop locations",
      "Central performance dashboard",
      "Data export to Excel / PDF",
      "Priority support"
    ],
    buttonText: "Talk to Us"
  }
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-24">
          <FadeUp delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-black font-thin text-slate-900 tracking-tighter mb-16 font-ubuntu">
              Pricing
            </h2>

            {/* Toggle Container */}
            <div className="flex items-center justify-center gap-6 mb-8 relative">
              <span className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-300'}`}>Monthly</span>

              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                className="w-16 h-8 bg-slate-100 rounded-full p-1 relative transition-all hover:bg-slate-200 border border-slate-200"
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-xl border border-slate-200/50 ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'}`} />
              </button>

              <div className="flex items-center gap-4">
                <span className={`text-sm font-black uppercase tracking-widest transition-colors duration-300 ${billingCycle === 'yearly' ? 'text-slate-900' : 'text-slate-300'}`}>Yearly</span>

                {/* Handwritten Annotation */}
                <div className="hidden sm:flex items-center gap-3 absolute left-[calc(50%+100px)] pl-5 top-9 -translate-y-1/2">
                  <svg width="45" height="25" viewBox="0 0 45 25" fill="none" className="text-emerald-500/40 scale-y-100 rotate-12">
                    <path d="M1 1C6 12 18 18 42 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M36 6L42 12L36 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span
                    className="text-emerald-600 text-2xl"
                    style={{ fontFamily: "'Caveat', cursive", transform: "rotate(-15deg)" }}
                  >
                    (Save 10%)
                  </span>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {pricingPlans.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.1}>
              <div className={`${p.color} p-10 md:p-14 rounded-2xl flex flex-col min-h-[700px] transition-all hover:scale-[1.02] duration-500 shadow-2xl`}>
                <div className="mb-14">
                  <div className="text-base font-black text-slate-900 uppercase tracking-[0.2em] mb-12 opacity-80">{p.name}</div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-black text-slate-900 tracking-tighter hl-mono opacity-50">KES</span>
                    <span className="text-6xl font-black text-slate-900 tracking-tighter font-ubuntu italic leading-none">
                      {billingCycle === 'monthly' ? p.monthlyPrice : p.yearlyPrice}
                    </span>
                    <span className="text-base font-black text-slate-900/40 hl-mono">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs font-black text-slate-900/60 mb-6 hl-mono uppercase tracking-widest">
                      Equivalent to KES {p.monthlyEquivalent}/month
                    </p>
                  )}
                  <p className="text-base font-bold text-slate-900/60 max-w-[200px] leading-snug">{p.desc}</p>
                </div>

                <div className="flex-1 space-y-6 mb-16">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-4 text-[15px] font-black text-slate-900 tracking-tight leading-tight">
                      <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Check size={14} strokeWidth={4} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className="w-full py-6 bg-black text-white rounded-xl text-sm font-black uppercase tracking-widest text-center hover:bg-slate-900 transition-all shadow-2xl shadow-black/20 active:scale-95"
                >
                  {p.buttonText}
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
