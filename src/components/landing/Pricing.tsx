import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, X as XIcon, Star } from 'lucide-react'
import { FadeUp } from './Animations'

const pricingPlans = [
  {
    id: "LITE",
    name: "Starter",
    monthlyPrice: "2,999",
    desc: "For small businesses that want better control of daily sales and expenses.",
    color: "bg-[#F472B6]", // Pink
    features: [
      "Record Sales",
      "Track Expenses",
      "Manage Stock",
      "Save Customer Records",
      "Track Cash & M-Pesa",
      "Daily Profit Reports",
      "Standard Support",
      "7-Day Free Trial"
    ],
    limitations: [
      "No Staff Accounts"
    ],
    buttonText: "Start Free Trial"
  },
  {
    id: "PLUS",
    name: "Growth",
    badge: "Most Popular",
    monthlyPrice: "6,999",
    desc: "For growing businesses that need deeper reports and better business tracking.",
    color: "bg-[#2DD4BF]", // Teal/Emerald
    features: [
      "Everything in Starter",
      "Profit Analytics",
      "Sales Reports & Graphs",
      "M-Pesa Paybill Integration",
      "Customer Purchase Tracking",
      "Business Performance Dashboard",
      "1 Staff Account",
      "Priority Support"
    ],
    buttonText: "Scale My Business"
  },
  {
    id: "MAX",
    name: "Business Pro",
    monthlyPrice: "16,999",
    desc: "For businesses that need complete operational and staff management.",
    color: "bg-[#818CF8]", // Indigo/Purple
    features: [
      "Everything in Growth",
      "Unlimited Staff Accounts",
      "Staff Activity Tracking",
      "Roles & Permissions",
      // "Multi-Branch Management",
      "Advanced Business Controls",
      "Dedicated Account Assistance"
    ],
    buttonText: "Go Business Pro"
  }
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-24">
          <FadeUp delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-black font-thin text-slate-900 tracking-tighter mb-6 font-ubuntu">
              Know Your Real Profit.
            </h2>
            <p className="text-slate-500 font-medium text-lg italic max-w-2xl mx-auto">
              "Track sales, expenses, stock, staff, and business performance in one place."
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
          {pricingPlans.map((p, i) => (
            <FadeUp key={p.name} delay={i * 0.1}>
              <div className={`${p.color} p-8 md:p-10 rounded-[.5rem] flex flex-col h-full transition-all hover:scale-[1.02] duration-500 shadow-2xl relative overflow-hidden group ${p.badge ? '' : ''}`}>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all duration-700">
                  <Star size={120} strokeWidth={1} />
                </div>

                {p.badge && (
                  <div className="absolute top-6 right-6 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-in slide-in-from-top-4">
                    {p.badge}
                  </div>
                )}

                <div className="mb-12 relative z-10 pt-2">
                  <div className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 opacity-70 hl-mono">{p.name}</div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter hl-mono opacity-40">KES</span>
                    <span className="text-5xl font-black text-slate-900 tracking-tighter font-ubuntu italic leading-none">
                      {p.monthlyPrice}
                    </span>
                    <span className="text-sm font-black text-slate-900/30 hl-mono">/28 days</span>
                  </div>
                  <p className="text-[15px] font-bold text-slate-900/60 leading-snug" style={{ fontFamily: 'Nunito, sans-serif' }}>{p.desc}</p>
                </div>

                <div className="flex-1 space-y-5 mb-12 relative z-10">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-4 text-[13px] font-black text-slate-900 tracking-tight leading-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <div className="h-5 w-5 bg-black rounded-full flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm">
                        <Check size={10} strokeWidth={5} />
                      </div>
                      {f}
                    </div>
                  ))}
                  {p.limitations && p.limitations.map(l => (
                    <div key={l} className="flex items-start gap-4 text-[13px] font-black text-slate-900/40 tracking-tight leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                      <div className="h-5 w-5 bg-black/10 rounded-full flex items-center justify-center text-black/40 shrink-0 mt-0.5">
                        <XIcon size={10} strokeWidth={4} />
                      </div>
                      <span className="line-through decoration-slate-900/20">{l}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/register?plan=${p.id}`}
                  className={`w-full py-5 text-white rounded-[.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-center transition-all shadow-2xl active:scale-95 relative z-10 ${p.badge ? 'bg-slate-900 hover:bg-black shadow-slate-900/30' : 'bg-black hover:bg-slate-900 shadow-black/20'}`}
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
