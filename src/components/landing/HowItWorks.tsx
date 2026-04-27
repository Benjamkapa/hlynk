import { FadeUp } from './Animations'

const steps = [
  { 
    n: "01", 
    t: "Sign up free", 
    d: "Create your account in seconds. Add your business name and details. No credit card needed to start your 14-day trial." 
  },
  { 
    n: "02", 
    t: "Add products", 
    d: "List your services or inventory items. Set your prices and stock levels once, and you're ready to sell." 
  },
  { 
    n: "03", 
    t: "Track profit", 
    d: "Record every sale and expense as they happen. Watch your real-time profit and business health appear instantly." 
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="py-32 bg-[#0D4A3E] relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <FadeUp delay={0.1}>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 block">Easy Start</span>
            <h2 className="text-4xl md:text-5xl font-black font-thin text-white tracking-tighter mb-6 font-ubuntu">
              Up and running in <span className="text-emerald-400 italic">3 minutes.</span>
            </h2>
            <p className="text-lg text-emerald-100/50 font-medium">
              We've simplified business management so you can focus on what you do best.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-px bg-emerald-500/20" />
          
          {steps.map((s, i) => (
            <FadeUp key={s.n} delay={i * 0.1} className="relative z-10 text-center space-y-8">
              <div className="w-20 h-20 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-xl font-black hl-mono shadow-2xl relative">
                <div className="absolute inset-[-8px] rounded-full border border-emerald-500/10" />
                {s.n}
              </div>
              <div className="space-y-4 px-4">
                <h3 className="text-2xl font-black text-white tracking-tight font-ubuntu italic">{s.t}</h3>
                <p className="text-emerald-100/50 font-medium leading-relaxed text-sm">
                  {s.d}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
