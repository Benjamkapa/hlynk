import { Scissors, Wrench, Smartphone, Sparkles, Zap, Utensils, Shirt, Camera, Monitor, GraduationCap, Cpu, Plus } from 'lucide-react'
import { FadeUp } from './Animations'

const categories = [
  { icon: <Scissors size={20} />, label: "Salons" },
  { icon: <Wrench size={20} />, label: "Mechanics" },
  { icon: <Smartphone size={20} />, label: "Repair" },
  { icon: <Sparkles size={20} />, label: "Cleaning" },
  { icon: <Zap size={20} />, label: "Electricians" },
  { icon: <Utensils size={20} />, label: "Catering" },
  { icon: <Shirt size={20} />, label: "Tailors" },
  { icon: <Camera size={20} />, label: "Studio" },
  { icon: <Monitor size={20} />, label: "Freelancers" },
  { icon: <GraduationCap size={20} />, label: "Tutors" },
  { icon: <Cpu size={20} />, label: "Tech Shop" },
  { icon: <Plus size={20} />, label: "Retail" },
]

export default function WhoUses() {
  return (
    <section id="who" className="py-32 bg-[#050D0A] text-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <FadeUp className="mb-20">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 block">Tailored Solutions</span>
          <h2 className="text-4xl md:text-5xl font-black font-thin text-white tracking-tighter font-ubuntu leading-tight">
            Built for every <br className="hidden md:block" />
            <span className="text-emerald-500 font-ubuntu">business owner.</span>
          </h2>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((c, i) => (
            <FadeUp key={c.label} delay={i * 0.05} className="group">
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-5 hover:bg-white/10 hover:shadow-2xl hover:shadow-emerald-500/10">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                  {c.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  {c.label}
                </span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
