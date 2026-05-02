import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { FadeUp } from './Animations'

const pricingPlans = [
  {
    id: "STARTER",
    name: "Starter Plan",
    monthlyPrice: "1,500",
    yearlyPrice: "16,200",
    monthlyEquivalent: "1,350",
    desc: "Perfect for small vendors who want to track their money and expenses clearly.",
    color: "bg-[#F472B6]", // Pink
    features: [
      "14-Day Free Trial",
      "Record sales in seconds",
      "Daily revenue & profit",
      "Track daily expenses",
      "Basic dashboard",
      "Secure cloud backup"
    ],
    buttonText: "Start Free Trial"
  },
  {
    id: "GROWTH",
    name: "Growth Plan",
    monthlyPrice: "2,500",
    yearlyPrice: "27,000",
    monthlyEquivalent: "2,250",
    desc: "The complete toolkit for scaling businesses with full inventory and automated payments.",
    color: "bg-[#2DD4BF]", // Teal/Emerald
    features: [
      "Everything in Starter",
      "Auto Stock Deduction",
      "Low Stock Alerts",
      "M-Pesa STK Push",
      "Customer Tracking",
      "Weekly charts"
    ],
    buttonText: "Scale My Shop"
  },
  {
    id: "PRO",
    name: "Pro Plan",
    monthlyPrice: "5,000",
    yearlyPrice: "54,000",
    monthlyEquivalent: "4,500",
    desc: "Advanced business intelligence and staff management for professional operations.",
    color: "bg-[#818CF8]", // Indigo/Purple
    features: [
      "Everything in Growth",
      "Multi-User (Staff)",
      "Audit Logs",
      "Advanced Insights",
      "Inventory Valuations",
      "Priority Support"
    ],
    buttonText: "Go Pro"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
          {pricingPlans.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.1}>
              <div className={`${p.color} p-8 md:p-10 rounded-3xl flex flex-col min-h-[680px] transition-all hover:scale-[1.02] duration-500 shadow-2xl relative overflow-hidden group`}>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all duration-700">
                  <Check size={120} strokeWidth={1} />
                </div>

                <div className="mb-12 relative z-10">
                  <div className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 opacity-70">{p.name}</div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter hl-mono opacity-40">KES</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tighter font-ubuntu italic leading-none">
                      {billingCycle === 'monthly' ? p.monthlyPrice : p.yearlyPrice}
                    </span>
                    <span className="text-sm font-black text-slate-900/30 hl-mono">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-[10px] font-black text-slate-900/50 mb-6 hl-mono uppercase tracking-widest">
                      Equivalent to KES {p.monthlyEquivalent}/month
                    </p>
                  )}
                  <p className="text-[15px] font-bold text-slate-900/60 leading-snug">{p.desc}</p>
                </div>

                <div className="flex-1 space-y-5 mb-12 relative z-10">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-4 text-[13px] font-black text-slate-900 tracking-tight leading-tight">
                      <div className="h-5 w-5 bg-black rounded-full flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Check size={10} strokeWidth={5} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className="w-full py-5 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-center hover:bg-slate-900 transition-all shadow-2xl shadow-black/20 active:scale-95 relative z-10"
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
