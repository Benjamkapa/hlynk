import { TrendingUp, Receipt, PackageSearch, Hotel, LayoutDashboard, Users } from 'lucide-react'

const SWATCHES = ['#E3A23C', '#7FB89C', '#7C93B0', '#D98B72', '#9C89B8', '#6FADC7']

const features = [
  {
    icon: <TrendingUp size={22} />,
    title: "Real-Time Profit Tracking",
    desc: "See your exact profits instantly — Hlynk subtracts costs and expenses automatically."
  },
  {
    icon: <Receipt size={22} />,
    title: "Fast Cashier Register",
    desc: "Search items, scan barcodes, issue receipts, and log expenses from any device."
  },
  {
    icon: <Hotel size={22} />,
    title: "Bookings, Rentals & Services",
    desc: "Track rooms, rental cars, or equipment hired out with a live calendar."
  },
  {
    icon: <PackageSearch size={22} />,
    title: "Smart Stock Count & Alerts",
    desc: "Stock updates automatically as you sell, with alerts before anything runs out."
  },
  {
    icon: <Users size={22} />,
    title: "Staff Accounts & Commissions",
    desc: "Give staff their own access, track their sales, and calculate commissions."
  },
  {
    icon: <LayoutDashboard size={22} />,
    title: "M-Pesa & eTIMS Ready",
    desc: "M-Pesa payments update your ledger instantly, with eTIMS invoices for KRA."
  },
]

export default function Features() {
  return (
    <section id="features" className="py-32 bg-[#14181A] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-[#E3A23C] uppercase tracking-widest block">Core Platform Capabilities</span>
          <h2 className="text-3xl md:text-5xl font-black text-white font-ubuntu tracking-tight">
            Stop guessing your profits. Start growing.
          </h2>
          <p className="text-white/50 text-sm md:text-base font-medium">
            Simple, powerful tools to run your business and track every shilling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const swatch = SWATCHES[i % SWATCHES.length]
            return (
              <div key={f.title} className="p-7 rounded-[28px] bg-[#1B212B] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between">
                <div>
                  <div
                    style={{ backgroundColor: swatch }}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5 text-[#14181A]"
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 font-ubuntu">{f.title}</h3>
                  <p className="text-white/45 font-medium leading-relaxed text-[13px]">
                    {f.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}