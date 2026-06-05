import { TrendingUp, Receipt, PackageSearch, BarChart3, LayoutDashboard, Users, ShieldCheck } from 'lucide-react'
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
    desc: "Tap or search for products to record sales in seconds. Professional receipts sent via SMS."
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
    icon: <Users size={24} />,
    title: "Staff Management",
    desc: "Create sub-accounts for your staff with limited access. Keep your business secure while you delegate tasks."
  },
  {
    icon: <img src="https://etims.kra.go.ke/assets/images/logo.jpg" alt="eTIMS" className="w-20 bg-white hover:bg-white" />,
    title: "KRA eTIMS Integrated",
    desc: "Stay fully compliant with KRA effortlessly. Optional direct system-to-system eTIMS integration pushes invoices automatically for your peace of mind."
  },
  {
    icon: <img src="https://monisnapcontent.kinsta.cloud/wp-content/uploads/2021/09/M-PESA_LOGO-640x467.png?v=1632335437" alt="M-Pesa" className="h-12 w-auto object-contain" />,
    title: "M-Pesa Integration",
    desc: "Accept payments via M-Pesa effortlessly. Get instant notifications and update your sales automatically."
  },
  {
    icon: <img src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg" alt="KCB Buni" className="h-14 w-auto object-contain" />,
    title: "KCB Buni Integration",
    desc: "Get paid directly to your KCB account whenever a customer pays via KCB Buni. Instant notifications and seamless integration with your business operations."
  }
]

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <FadeUp delay={0.1}>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 block">Core Features</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 font-thin tracking-tighter mb-6 font-ubuntu">
              Stop guessing. Start <span className="text-emerald-600 ">growing.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium">
              We built hlynk to solve the real problems Kenyan business owners face each and every day, starting with easier access.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.25}>
              <div className="p-10 rounded-2xl bg-slate-50 border border-slate-100 transition-all group h-full">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-emerald-600 mb-8 group-hover:scale-110 transition-transform shadow-sm">
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
