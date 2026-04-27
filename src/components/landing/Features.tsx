import { TrendingUp, Receipt, PackageSearch, BarChart3, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { FadeUp } from './Animations'

const features = [
  {
    icon: <TrendingUp size={24} />,
    title: "Profit Tracking",
    desc: "Know exactly how much money you made after all costs. No more manual calculations or guessing."
  },
  {
    icon: <Receipt size={24} />,
    title: "Fast Point of Sale",
    desc: "Scan barcodes or tap products to record sales in seconds. Professional receipts sent via SMS."
  },
  {
    icon: <PackageSearch size={24} />,
    title: "Stock Management",
    desc: "Your inventory updates automatically with every sale. Get smart alerts when items are low."
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Expense Logging",
    desc: "Track rent, supplies, and wages. See where your cash is going with itemized expense categories."
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: "Daily Summaries",
    desc: "Get a clear summary of your business health every morning and evening. Simple, easy to read."
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Cloud Security",
    desc: "Your data is always encrypted and backed up. Access it safely from any device, anywhere."
  },
]

export default function Features() {
  return (
    <section id="features" className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <FadeUp delay={0.1}>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 block">Core Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 font-thin tracking-tighter mb-6 font-ubuntu">
              Stop guessing. Start <span className="text-emerald-600 ">growing.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              We built hlynk to solve the real problems Kenyan business owners face every day.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <div className="p-10 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group hover:bg-white hover:shadow-2xl hover:shadow-emerald-900/5 h-full">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform shadow-sm group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600">
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-emerald-900 mb-4 tracking-tight font-ubuntu italic font-thin">{f.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
