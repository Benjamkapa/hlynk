import { ArrowRight } from 'lucide-react'

// const SWATCHES = [
//   {  text: '#34D399'},
//   { bg: 'from-sky-500/20 to-blue-500/10', text: '#38BDF8', badgeBg: 'bg-sky-500/10' },
//   { bg: 'from-amber-500/20 to-orange-500/10', text: '#FBBF24', badgeBg: 'bg-amber-500/10' },
//   { bg: 'from-rose-500/20 to-pink-500/10', text: '#FB7185', badgeBg: 'bg-rose-500/10' },
//   { bg: 'from-purple-500/20 to-indigo-500/10', text: '#C084FC', badgeBg: 'bg-purple-500/10' },
//   { bg: 'from-teal-500/20 to-cyan-500/10', text: '#2DD4BF', badgeBg: 'bg-teal-500/10' },
// ]

const categories = [
  {
    emojiBadge: <img src="/assets/3d/bell.png" alt="Bell" className="w-10 h-10 object-contain drop-shadow" />,
    label: "BnBs & Apartments",
    description: "Track rooms, guests, and check-ins — no more double bookings.",
    features: ["Room Calendar", "Guest Payments & Balances", "Airbnb & Direct Bookings", "Room Cleaning Status"],
    onboarding: ["Sign in with Google", "Add your rooms or units", "Record your first guest booking"],
    integration: "hlynk immediately updates room availability and calculates guest balances."
  },
  {
    emojiBadge: <img src="/assets/3d/bell.png" alt="Bell" className="w-10 h-10 object-contain drop-shadow" />,
    label: "Car Rentals & Fleet",
    description: "See which car is available and what's due back, at a glance.",
    features: ["Car Availability Tracker", "Daily Rent Calculator", "Maintenance Expense Logs", "Simple Deposit Records"],
    onboarding: ["Sign in with Google", "Add your vehicle fleet", "Record a rental trip"],
    integration: "Rentals are automatically linked to your profit reports, including repair costs."
  },
  {
    emojiBadge: <img src="/assets/3d/bell.png" alt="Bell" className="w-10 h-10 object-contain drop-shadow" />,
    label: "Car Wash & Detailing",
    description: "Log washes, assign staff jobs, and calculate payouts automatically.",
    features: ["Wash Style Packages", "Employee Job Assignment", "Water & Soap Stock Count", "Fast Customer Receipts"],
    onboarding: ["Sign in with Google", "Enter your wash package prices", "Record your first car wash"],
    integration: "Calculates employee commissions and updates wash sales in real-time."
  },
  {
    emojiBadge: <img src="/assets/3d/bell.png" alt="Bell" className="w-10 h-10 object-contain drop-shadow" />,
    label: "Retail & Mini Marts",
    description: "Scan, sell, and see your profit instantly with live stock alerts.",
    features: ["Fast POS Checkout", "Low Stock Text Alerts", "Supplier Payments", "Instant Profit Summary"],
    onboarding: ["Sign in with Google", "Enter your items and prices", "Record your first sale"],
    integration: "Deducts stock automatically from inventory with every cash or M-Pesa sale."
  },
  {
    emojiBadge: <img src="/assets/3d/bell.png" alt="Bell" className="w-10 h-10 object-contain drop-shadow" />,
    label: "Salons & Barbers",
    description: "Track services and product sales, and split commissions fairly.",
    features: ["Staff Commission Tracker", "Daily Service Logs", "Hair Product Inventory", "Client Visit History"],
    onboarding: ["Sign in with Google", "Enter your service packages", "Record daily client visits"],
    integration: "Makes daily payouts to barbers and beauticians transparent and fast."
  },
  {
    emojiBadge: <img src="/assets/3d/bell.png" alt="Bell" className="w-10 h-10 object-contain drop-shadow" />,
    label: "Garages & Mechanics",
    description: "Digital job cards, parts tracking, and full service history per car.",
    features: ["Digital Job Cards", "Spare Parts Count", "Vehicle Service History", "Mechanics' Commission Logs"],
    onboarding: ["Sign in with Google", "Enter your garage details", "Create your first job card"],
    integration: "Never forget previous repair history for any vehicle serviced in your garage."
  },
]

export default function WhoUses({ onSelectCategory }: { onSelectCategory: (cat: any) => void }) {
  return (
    <section id="who" className="py-32 bg-transparent text-center relative overflow-hidden border-y border-white/5 backdrop-blur-[2px]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-[#E3A23C] uppercase tracking-widest block">
            Tailored Operating System
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight font-ubuntu">
            Built for your type of business
          </h2>
          <p className="text-white/60 text-sm md:text-base font-medium">
            Pick your business type to see how hlynk fits your day-to-day operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {categories.map((c, i) => {
            // const swatch = SWATCHES[i % SWATCHES.length]
            return (
              <div
                key={c.label}
                onClick={() => onSelectCategory(c)}
                className="relative p-7 rounded-[30px] bg-[#141A1E]/85 backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between cursor-pointer group shadow-2xl hover:shadow-emerald-950/30 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle card glow on hover */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.04] to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-5">
                    {/* 3D Icon Badge Container */}
                    <div
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-black/40 group-hover:scale-105 transition-transform`}
                    >
                      {c.emojiBadge}
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2 font-ubuntu tracking-tight group-hover:text-emerald-300 transition-colors">
                    {c.label}
                  </h3>
                  <p className="text-slate-300/80 text-[13px] font-medium leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                  <span
                    // className={`px-3.5 py-1.5 rounded-full ${swatch.badgeBg} text-[11px] font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all`}
                    // style={{ color: swatch.text }}
                  >
                    <span>View details</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
