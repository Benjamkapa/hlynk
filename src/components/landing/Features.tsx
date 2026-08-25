import { TrendingUp, Receipt, PackageSearch, Hotel, LayoutDashboard, Users } from 'lucide-react'

const features = [
  {
    icon: <TrendingUp size={24} />,
    title: "Real-Time Profit Tracking",
    desc: "See your exact profits instantly. Hlynk automatically subtracts your purchase costs and expenses so you always know your real earnings."
  },
  {
    icon: <Receipt size={24} />,
    title: "Fast Cashier Register",
    desc: "Checkout customer sales in seconds. Search items, scan barcodes, issue receipts, and log expenses easily from your phone or tablet."
  },
  {
    icon: <Hotel size={24} />,
    title: "Bookings, Rentals & Services",
    desc: "Track rooms, rental cars, services, or equipment hired out. A live calendar ensures you never double-book."
  },
  {
    icon: <PackageSearch size={24} />,
    title: "Smart Stock Count & Alerts",
    desc: "Your stock levels update automatically as you sell. Get friendly SMS/email alerts before an item runs out."
  },
  {
    icon: <Users size={24} />,
    title: "Staff Accounts & Commissions",
    desc: "Create accounts for your workers. Choose what they can see or edit, track their sales, and calculate their daily commissions automatically."
  },
  {
    icon: <LayoutDashboard size={24} />,
    title: "M-Pesa & eTIMS Ready",
    desc: "Receive M-Pesa payments that instantly update your sales ledger. Generate eTIMS invoices for KRA automatically with no extra steps."
  },
]

export default function Features() {
  return (
    <section id="features" className="py-32 bg-slate-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">Core Platform Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-black text-white font-ubuntu tracking-tight">
            Stop guessing your profits. Start growing.
          </h2>
          <p className="text-slate-400 text-sm md:text-base font-medium">
            Hlynk gives you simple, powerful tools to run your business, reduce waste, and track every shilling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-8 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-2 font-ubuntu">{f.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-xs">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
