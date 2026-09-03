import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { FadeUp } from './Animations'

const pricingPlans = [
  {
    id: "PLUS",
    name: "Starter",
    tagline: "For growing businesses selling in one place.",
    monthlyPrice: "4,450",
    cardColor: "#D98B72",
    buttonText: "Get started",
    features: [
      "Up to 60 items in inventory",
      "M-Pesa STK Push checkout",
      "Profit analytics & reporting",
      "1 staff account"
    ]
  },
  {
    id: "MAX",
    name: "Business Pro",
    badge: "Best Value",
    tagline: "For hotels, rentals and multi-branch teams.",
    monthlyPrice: "8,200",
    cardColor: "#7C93B0",
    buttonText: "Get started",
    features: [
      "Everything in Starter",
      "Unlimited items & staff",
      "Public store & stay booking pages",
      "Direct bank settlements",
      "Audit logs & permissions"
    ]
  }
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'1' | '6' | '12'>('1') // Default to Monthly

  return (
    <section id="pricing" className="py-32 bg-[#14181A] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 font-ubuntu">
              Simple, Honest Pricing
            </h2>
            <p className="text-white/50 font-medium text-lg max-w-xl mx-auto mb-10">
              The tools you need to succeed, without hidden fees.
            </p>

            <div className="flex items-center justify-center gap-2 mb-4">
               {[
                 { id: '1', label: 'Monthly', days: 28 },
                 { id: '6', label: '6 Months', days: 180, promo: '−5%' },
                 { id: '12', label: '1 Year', days: 365, promo: '−15%' }
               ].map(cycle => (
                 <button
                   key={cycle.id}
                   onClick={() => setBillingCycle(cycle.id as any)}
                   className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                     billingCycle === cycle.id
                       ? 'bg-white text-[#14181A]'
                       : 'bg-white/5 text-white/50 hover:bg-white/10'
                   }`}
                 >
                   {cycle.label}
                   {cycle.promo && (
                     <span className={billingCycle === cycle.id ? 'text-emerald-600' : 'text-emerald-400'}>
                       {cycle.promo}
                     </span>
                   )}
                 </button>
               ))}
            </div>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {pricingPlans.map((p, i) => {
            const basePrice = parseInt(p.monthlyPrice.replace(',', ''))
            const months = parseInt(billingCycle)
            const daysReward = months === 12 ? 365 : months === 6 ? 180 : 28

            const total = months === 12
              ? Math.round((basePrice * 12) * 0.85)
              : months === 6
                ? Math.round((basePrice * 6) * 0.95)
                : basePrice

            const formattedTotal = total.toLocaleString()

            return (
              <FadeUp key={p.name} delay={i * 0.15}>
                <div
                  style={{ backgroundColor: p.cardColor }}
                  className="relative rounded-[28px] p-7 pt-9 flex flex-col h-full"
                >
                  {p.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FBF7F0] text-[#14181A] px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap shadow-sm">
                      {p.badge}
                    </div>
                  )}

                  <h3 className="text-xl font-black text-[#14181A] mb-1.5">{p.name}</h3>
                  <p className="text-[13px] font-medium text-[#14181A]/60 leading-snug mb-8">
                    {p.tagline}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-black text-[#14181A] tracking-tight">
                      KES {formattedTotal}
                    </span>
                    <span className="text-xs font-bold text-[#14181A]/50 ml-1.5">/ {daysReward} days</span>
                  </div>

                  <ul className="space-y-2 mb-8 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2.5 text-[13px] font-semibold text-[#14181A]/75">
                        <Check size={14} strokeWidth={3} className="shrink-0 text-[#14181A]/50" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/register?plan=${p.id}&days=${daysReward}`}
                    className="w-full py-3.5 rounded-full text-sm font-bold text-center bg-[#14181A] text-white hover:opacity-85 transition-all active:scale-95"
                  >
                    {p.buttonText}
                  </Link>
                </div>
              </FadeUp>
            )
          })}
        </div>

        <p className="text-center text-white/30 text-xs font-medium mt-10">
          Free 14-day trial, no card required. <Link to="/register?trial=true" className="text-white/60 hover:text-white underline underline-offset-2">Try Hlynk free →</Link>
        </p>
      </div>
    </section>
  )
}