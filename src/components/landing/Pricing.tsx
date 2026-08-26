import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Star } from 'lucide-react'
import { FadeUp } from './Animations'

const pricingPlans = [
  {
    id: "PLUS",
    name: "Starter Plan",
    monthlyPrice: "4,450",
    desc: "Perfect for growing businesses that want automatic M-Pesa checkout, rich reports, and team delegation.",
    color: "teal",
    borderColor: "border-teal-400",
    accentColor: "text-teal-600",
    btnClass: "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-100",
    features: [
      "Manage up to 100 items in inventory",
      "Record sales and expenses",
      "Detailed store reports and graphs",
      "Send M-Pesa payment prompts to customers",
      "1 staff account to enter transactions",
      "Priority customer support"
    ],
    buttonText: "Choose Starter"
  },
  {
    id: "MAX",
    name: "Business Pro",
    badge: "Best Value",
    monthlyPrice: "8,200",
    desc: "For larger businesses that need full team permissions, direct bank settlements, and audit logs.",
    color: "indigo",
    borderColor: "border-indigo-600",
    accentColor: "text-indigo-600",
    btnClass: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100",
    features: [
      "Everything in Starter Plan",
      "Unlimited items in inventory",
      "Direct bank deposits via KCB Buni",
      "Unlimited staff accounts",
      "Track every action your staff makes (Audit Logs)",
      "Set custom access for cashiers/mechanics",
      "Dedicated manager support"
    ],
    buttonText: "Choose Business Pro"
  }
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'1' | '6' | '12'>('1') // Default to Monthly

  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 font-ubuntu">
              Simple, Honest Pricing
            </h2>
            <p className="text-slate-500 font-medium text-lg italic max-w-2xl mx-auto mb-10">
              "The tools you need to succeed, without hidden fees."
            </p>

            <div className="flex items-center text- justify-center gap-6 text-black mb-12">
               {[
                 { id: '1', label: '28 Days (Monthly)', days: 28 },
                 { id: '6', label: '180 Days (6 Months)', days: 180, promo: 'Save 5%' },
                 { id: '12', label: '365 Days (1 Year)', days: 365, promo: 'Save 15%' }
               ].map(cycle => (
                 <button
                   key={cycle.id}
                   onClick={() => setBillingCycle(cycle.id as any)}
                   className={`flex flex-col items-center gap-1 p-4 rounded-2xl transition-all border ${billingCycle === cycle.id ? 'bg-white border-slate-200 shadow-xl scale-110' : 'border-transparent text-slate-400 grayscale'}`}
                 >
                   <span className="text-[10px] font-black uppercase tracking-widest">{cycle.label}</span>
                   {cycle.promo && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{cycle.promo}</span>}
                 </button>
               ))}
            </div>
            
            {/* INDEPENDENT TRIAL BANNER */}
            <div className="inline-block rounded-xl bg-slate-50 border border-slate-200/60 animate-in fade-in zoom-in duration-1000">
              <div className="flex flex-col md:flex-row items-center gap-6 px-10 py-6 bg-white rounded-xl">
                 <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <Star size={32} className="fill-emerald-600 font-black text-emerald-600" />
                 </div>
                 <div className="text-left">
                    <h4 className="text-xl font-bold text-slate-900 leading-tight">Try it Free for 14 Days</h4>
                    <p className="text-sm font-medium text-slate-500 mt-1 italic">Test all features, including booking and sales tracking, before you pay a single shilling.</p>
                 </div>
                 <Link 
                   to="/register?trial=true"
                   className="px-8 py-4 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-emerald-700 hover:scale-105 transition-all shadow-xl shadow-emerald-100 whitespace-nowrap"
                 >
                   Try Hlynk Free
                 </Link>
              </div>
            </div>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {pricingPlans.map((p, i) => {
            const basePrice = parseInt(p.monthlyPrice.replace(',', ''))
            const months = parseInt(billingCycle)
            const daysReward = months === 12 ? 365 : months === 6 ? 180 : 28
            const cycleLabel = months === 1 ? '28 Days' : months === 6 ? '180 Days' : '365 Days'
            
            // Total price with potential bulk discount
            const total = months === 12 
              ? Math.round((basePrice * 12) * 0.85) // 15% discount for a year
              : months === 6 
                ? Math.round((basePrice * 6) * 0.95) // 5% discount for 6 months
                : basePrice
            
            const formattedTotal = total.toLocaleString()
            const accentBgClass = p.id === 'PLUS' ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
            const actualBorderColor = p.borderColor
            
            return (
              <FadeUp key={p.name} delay={i * 0.4}>
                <div className={`bg-white border-t-8 ${actualBorderColor} border-x border-b border-slate-200/80 p-8 md:p-10 rounded-2xl flex flex-col h-full transition-all hover:scale-[1.02] duration-500 shadow-lg hover:shadow-2xl relative overflow-hidden group`}>
                  {/* Decorative Pattern */}
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-all duration-700 pointer-events-none">
                    <Star size={120} strokeWidth={1} />
                  </div>

                  {p.badge && (
                    <div className="absolute top-6 right-6 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-in slide-in-from-top-4">
                      {p.badge}
                    </div>
                  )}

                  <div className="mb-12 relative z-10 pt-2">
                    <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 hl-mono">{p.name}</div>
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-2xl font-black text-slate-400 tracking-tighter hl-mono opacity-50">KES</span>
                      <span className="text-5xl font-black text-slate-900 tracking-tighter font-ubuntu italic leading-none">
                        {formattedTotal}
                      </span>
                    </div>
                    <div className={`p-3 ${accentBgClass} rounded-lg border inline-block mb-6`}>
                        <span className="text-[10px] font-black uppercase tracking-widest + border-transparent">+ {daysReward} Service Days ({cycleLabel})</span>
                    </div>
                    <p className="text-[15px] font-medium text-slate-500 leading-snug" style={{ fontFamily: 'Nunito, sans-serif' }}>{p.desc}</p>
                  </div>

                  <div className="flex-1 space-y-5 mb-12 relative z-10">
                    {p.features.map((f: any, j) => (
                      <div key={j} className="flex flex-col gap-2">
                        <div className="flex items-start gap-4 text-[13.5px] font-bold text-slate-700 tracking-tight leading-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          <div className={`h-5 w-5 ${accentBgClass} rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                            <Check size={10} strokeWidth={5} />
                          </div>
                          <span>{typeof f === 'string' ? f : f.text}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={`/register?plan=${p.id}&days=${daysReward}`}
                    className={`w-full py-5 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] text-center transition-all shadow-md active:scale-95 relative z-10 ${p.btnClass}`}
                  >
                    {p.buttonText}
                  </Link>
                  
                  <div className="mt-8 pt-8 border-t border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                    * Paybill Rental available on all plans via revenue-share
                  </div>
                </div>
              </FadeUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}
