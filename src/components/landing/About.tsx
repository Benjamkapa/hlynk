import { CheckCircle2, TrendingUp, ShieldCheck, Users } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="py-24 bg-transparent relative overflow-hidden">
      {/* Subtle Background Pattern - slightly more visible for depth */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none text-emerald-400">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotPattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-6 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-emerald-400/30"></span>
            About hlynk
          </h2>
          <h3 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8 tracking-tight">
            Empowering the <span className="text-emerald-400">Kenyan Vendor</span> to Scale.
          </h3>
          <p className="text-lg text-white/60 leading-relaxed font-medium max-w-2xl">
            hlynk was built to bridge the gap in business clarity. We provide the tools for vendors to track every shilling, understand their real profit, and grow with confidence.
          </p>
        </div>

        {/* Mission Card - Enhanced for dark background */}
        <div className="mb-24">
          <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden bg-emerald-950/40 backdrop-blur-md border border-white/10 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h4 className="text-2xl md:text-4xl font-black mb-6">Our Mission</h4>
                <p className="text-base text-emerald-100/70 leading-relaxed mb-8">
                  In Kenya's vibrant economy, small businesses are the heartbeat. Yet, many struggle to track cash flow across M-Pesa, cash, and bank transactions.
                  <br /><br />
                  hlynk digitizes the ledger for every local merchant—providing professional-grade analytics at their fingertips.
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Transparency', 'Growth', 'Reliability'].map(val => (
                    <span key={val} className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video md:aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end group hover:bg-emerald-600/20 transition-all duration-300">
                  <TrendingUp className="w-6 h-6 text-emerald-400 mb-4" />
                  <p className="font-black text-xl tracking-tight leading-none text-white">Growth Focused</p>
                </div>
                <div className="aspect-video md:aspect-square rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col justify-end group hover:bg-emerald-600/20 transition-all duration-300">
                  <Users className="w-6 h-6 text-emerald-400 mb-4" />
                  <p className="font-black text-xl tracking-tight leading-none text-white">Community First</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars - Glassmorphic Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "Professional Integrity",
              desc: "We treat your business data with the highest security. hlynk is built on trust, ensuring your records are accurate."
            },
            {
              icon: CheckCircle2,
              title: "Local Relevance",
              desc: "Built specifically for Kenya. From deep M-Pesa integration to local listings, we speak your language."
            },
            {
              icon: TrendingUp,
              title: "Data-Driven Success",
              desc: "What gets measured gets managed. Our dashboard turns sales records into actionable growth insights."
            }
          ].map((pillar, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-400/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <pillar.icon className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-white mb-3 tracking-tight">{pillar.title}</h4>
              <p className="text-sm text-white/50 leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
