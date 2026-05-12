import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { FadeUp } from './Animations'

const pricingPlans = [
  {
    id: "LITE",
    name: "Lite Plan",
    monthlyPrice: "1,999",
    desc: "Simple digital control for everyday businesses like kiosks, salons, and mini shops.",
    color: "bg-[#F472B6]", // Pink
    features: [
      "7-Day Free Trial",
      "POS Checkout (Record Sales)",
      "Cash & M-Pesa Tracking",
      "Basic Inventory Tracking",
      "Up to 3 Staff Accounts",
      "Daily Sales Summary"
    ],
    buttonText: "Start Free Trial"
  },
  {
    id: "PLUS",
    name: "Plus Plan",
    monthlyPrice: "4,999",
    desc: "Built for growing businesses like minimarts, pharmacies, and hardware shops.",
    color: "bg-[#2DD4BF]", // Teal/Emerald
    features: [
      "Everything in Lite",
      "Net Profit & Expense Tracking",
      "Revenue Trend Charts",
      "Up to 15 Staff Accounts",
      "Staff Salaries & Commissions",
      "Security Activity Logs"
    ],
    buttonText: "Scale My Shop"
  },
  {
    id: "MAX",
    name: "Max Plan",
    monthlyPrice: "11,999",
    desc: "Full operational management for large retail, distributors, and institutions.",
    color: "bg-[#818CF8]", // Indigo/Purple
    features: [
      "Everything in Plus",
      "Unlimited Staff Accounts",
      "Advanced Audit Logs",
      "Full KPI Dashboard Access",
      "Premium Operational Tools",
      "Priority Technical Support"
    ],
    buttonText: "Go Pro"
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-24">
          <FadeUp delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-black font-thin text-slate-900 tracking-tighter mb-6 font-ubuntu">
              Pricing Plans
            </h2>
            <p className="text-slate-500 font-medium text-lg italic">
              "Know your real profit. Not just what came in — what stayed."
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start max-w-7xl mx-auto">
          {pricingPlans.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.1}>
              <div className={`${p.color} p-8 md:p-10 rounded-3xl flex flex-col min-h-[620px] transition-all hover:scale-[1.02] duration-500 shadow-2xl relative overflow-hidden group`}>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all duration-700">
                  <Check size={120} strokeWidth={1} />
                </div>

                <div className="mb-12 relative z-10">
                  <div className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 opacity-70">{p.name}</div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter hl-mono opacity-40">KES</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tighter font-ubuntu italic leading-none">
                      {p.monthlyPrice}
                    </span>
                    <span className="text-sm font-black text-slate-900/30 hl-mono">/mo</span>
                  </div>
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
