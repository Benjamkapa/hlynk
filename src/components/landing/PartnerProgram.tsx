import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, TrendingUp, Wallet, Users, Award, Percent, ArrowRight, MessageCircle } from 'lucide-react'
import { FadeUp } from './Animations'

export default function PartnerProgram() {
  const [liteCount, setLiteCount] = useState<number>(5)
  const [plusCount, setPlusCount] = useState<number>(3)
  const [maxCount, setMaxCount] = useState<number>(1)

  // Earnings configuration
  const LITE_COMMISSION = 1200
  const PLUS_COMMISSION = 2650
  const MAX_COMMISSION = 4950

  const monthlyTotal = (liteCount * LITE_COMMISSION) + (plusCount * PLUS_COMMISSION) + (maxCount * MAX_COMMISSION)
  const annualTotal = monthlyTotal * 12

  // Interactive milestone messages based on KES output
  const getMilestoneText = () => {
    if (monthlyTotal === 0) {
      return "Slide the controls to simulate your monthly earnings!"
    }
    if (monthlyTotal < 10000) {
      return "💡 Tip: Just onboarding 4 shops on the Growth plan gets you over KES 10,000/mo!"
    }
    if (monthlyTotal >= 10000 && monthlyTotal < 35000) {
      return "🌟 Steady Side Earn: That covers rent, data, and daily transport comfortably!"
    }
    if (monthlyTotal >= 35000 && monthlyTotal < 100000) {
      return "🚀 Pro Ambassador: You are now earning more than the average graduate salary!"
    }
    return "👑 Elite Partner: You have built a recurring sales agency. Serious wealth creation!"
  }

  return (
    <section id="partner" className="py-24 bg-slate-905 relative overflow-hidden border-t border-slate-100 bg-[#FAFBFB]">
      
      {/* Background Graphic Accents */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-emerald-50 rounded-full blur-3xl opacity-60 -z-10" />
      <div className="absolute top-10 right-0 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-50 -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-16">
          <FadeUp delay={0.1}>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-6 font-ubuntu">
              Earn Recurring Commissions.
            </h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
              Bring businesses to Hlynk and earn money every month for 1 year. After that, add 5 new shops to keep earning.
            </p>
          </FadeUp>
        </div>

        {/* Feature Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Portfolio & Offerings (5 columns) */}
          <div className="lg:col-span-6 space-y-8">
            <FadeUp delay={0.2}>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
                Why Onboard Businesses?
              </h3>
              <p className="text-slate-600 mb-8 font-medium">
                Hlynk is built directly to rescue Kenyan Biasharas from manual errors and lost profits. Because of this, it has an incredibly high retention rate, meaning payouts keep arriving.
              </p>
            </FadeUp>

            <div className="space-y-6">
              {[
                {
                  icon: <Wallet className="text-emerald-600" size={24} />,
                  title: "12 Months of Earnings",
                  desc: "Every shop you bring in pays you commission every month for a full year. Not once — every single month."
                },
                {
                  icon: <Percent className="text-purple-600" size={24} />,
                  title: "Up to 29% Commission Payout",
                  desc: "We give back about 30% of each plan price to our partners who help shop owners start using Hlynk."
                },
                {
                  icon: <Users className="text-blue-600" size={24} />,
                  title: "Keep Earning After Year 1",
                  desc: "After your first year, just add 5 new shops and your commissions on all your shops continue. Simple."
                },
                {
                  icon: <Award className="text-amber-500" size={24} />,
                  title: "No Cap on Onboardings",
                  desc: "Work on your own terms. Whether you onboard 5 shops or 500, Hlynk scales your payout accordingly."
                }
              ].map((item, idx) => (
                <FadeUp key={idx} delay={0.3 + idx * 0.1}>
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-100">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800 tracking-tight mb-1">{item.title}</h4>
                      <p className="text-sm font-semibold text-slate-500 leading-relaxed font-sans">{item.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right Column: Earnings Interactive Calculator (6 columns) */}
          <div className="lg:col-span-6">
            <FadeUp delay={0.3}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 relative overflow-hidden">
                
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-2xl opacity-70 -z-10" />

                <div className="border-b border-slate-100 pb-6 mb-6">
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight">Earnings Simulator</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider hl-mono">Drag the sliders to see what you could earn</p>
                </div>

                {/* Sliders Grid */}
                <div className="space-y-6">
                  
                  {/* Slider 1: Lite (Starter) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-black text-[#F472B6] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#F472B6] rounded-full inline-block"></span>
                        Starter Referrals
                      </label>
                      <span className="text-lg font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 hl-mono">{liteCount} shops</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={liteCount}
                      onChange={(e) => setLiteCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#F472B6]/10 rounded-lg appearance-none cursor-pointer accent-[#F472B6]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 hl-mono">
                      <span>0</span>
                      <span>Comm: KES 1,200/mo per shop</span>
                      <span>50</span>
                    </div>
                  </div>

                  {/* Slider 2: Plus (Growth) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-black text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#2DD4BF] rounded-full inline-block"></span>
                        Growth Referrals
                      </label>
                      <span className="text-lg font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 hl-mono">{plusCount} shops</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={plusCount}
                      onChange={(e) => setPlusCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#2DD4BF]/10 rounded-lg appearance-none cursor-pointer accent-[#2DD4BF]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 hl-mono">
                      <span>0</span>
                      <span>Comm: KES 2,650/mo per shop</span>
                      <span>30</span>
                    </div>
                  </div>

                  {/* Slider 3: Max (Business Pro) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-black text-[#818CF8] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#818CF8] rounded-full inline-block"></span>
                        Pro Referrals
                      </label>
                      <span className="text-lg font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 hl-mono">{maxCount} shops</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={maxCount}
                      onChange={(e) => setMaxCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-[#818CF8]/10 rounded-lg appearance-none cursor-pointer accent-[#818CF8]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 hl-mono">
                      <span>0</span>
                      <span>Comm: KES 4,950/mo per shop</span>
                      <span>20</span>
                    </div>
                  </div>

                </div>

                {/* Simulation Output Card */}
                <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    
                    {/* Monthly Sum */}
                    <div className="border-r border-slate-200 pr-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monthly Payout</span>
                      <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter hl-mono">
                        KES {monthlyTotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Annual Sum */}
                    <div className="pl-2">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Annual Potential</span>
                      <span className="text-xl md:text-2xl font-black text-[#0D4A3E] tracking-tighter hl-mono">
                        KES {annualTotal.toLocaleString()}
                      </span>
                    </div>

                  </div>

                  {/* Milestone Feedback */}
                  <div className="mt-5 pt-4 border-t border-slate-200 text-center">
                    <p className="text-xs md:text-sm font-bold text-[#0D4A3E] italic">
                      {getMilestoneText()}
                    </p>
                  </div>

                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
                  <Link
                    to="/register?role=partner"
                    className="w-full sm:flex-1 py-4 bg-[#0D4A3E] hover:bg-[#064E3B] text-white rounded-xl text-center text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    Become Partner Now <ArrowRight size={14} />
                  </Link>
                  
                  <a
                    href="https://wa.me/254790590653?text=Hi%20Hlynk%2C%20I%20want%20to%20know%20more%20about%20the%20Partner%20Program."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-4 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-600 hover:text-emerald-700 font-bold text-xs text-center rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} />
                    Ask Questions
                  </a>
                </div>

              </div>
            </FadeUp>
          </div>

        </div>

      </div>
    </section>
  )
}
