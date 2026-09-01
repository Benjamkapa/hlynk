import { Scissors, Wrench, Sparkles, Hotel, Car, ShoppingBag } from 'lucide-react'

const SWATCHES = ['#7FB89C', '#7C93B0', '#E3A23C', '#D98B72', '#9C89B8', '#6FADC7']

const categories = [
  {
    icon: <Hotel size={20} />,
    label: "BnBs & Apartments",
    description: "Track rooms, guests, and check-ins — no more double bookings.",
    features: ["Room Calendar", "Guest Payments & Balances", "Airbnb & Direct Bookings", "Room Cleaning Status"],
    onboarding: ["Sign in with Google", "Add your rooms or units", "Record your first guest booking"],
    integration: "Hlynk immediately updates room availability and calculates guest balances."
  },
  {
    icon: <Car size={20} />,
    label: "Car Rentals & Fleet",
    description: "See which car is available and what's due back, at a glance.",
    features: ["Car Availability Tracker", "Daily Rent Calculator", "Maintenance Expense Logs", "Simple Deposit Records"],
    onboarding: ["Sign in with Google", "Add your vehicle fleet", "Record a rental trip"],
    integration: "Rentals are automatically linked to your profit reports, including repair costs."
  },
  {
    icon: <Sparkles size={20} />,
    label: "Car Wash & Detailing",
    description: "Log washes, assign staff jobs, and calculate payouts automatically.",
    features: ["Wash Style Packages", "Employee Job Assignment", "Water & Soap Stock Count", "Fast Customer Receipts"],
    onboarding: ["Sign in with Google", "Enter your wash package prices", "Record your first car wash"],
    integration: "Calculates employee commissions and updates wash sales in real-time."
  },
  {
    icon: <ShoppingBag size={20} />,
    label: "Retail & Mini Marts",
    description: "Scan, sell, and see your profit instantly with live stock alerts.",
    features: ["Fast POS Checkout", "Low Stock Text Alerts", "Supplier Payments", "Instant Profit Summary"],
    onboarding: ["Sign in with Google", "Enter your items and prices", "Record your first sale"],
    integration: "Deducts stock automatically from inventory with every cash or M-Pesa sale."
  },
  {
    icon: <Scissors size={20} />,
    label: "Salons & Barbers",
    description: "Track services and product sales, and split commissions fairly.",
    features: ["Staff Commission Tracker", "Daily Service Logs", "Hair Product Inventory", "Client Visit History"],
    onboarding: ["Sign in with Google", "Enter your service packages", "Record daily client visits"],
    integration: "Makes daily payouts to barbers and beauticians transparent and fast."
  },
  {
    icon: <Wrench size={20} />,
    label: "Garages & Mechanics",
    description: "Digital job cards, parts tracking, and full service history per car.",
    features: ["Digital Job Cards", "Spare Parts Count", "Vehicle Service History", "Mechanics' Commission Logs"],
    onboarding: ["Sign in with Google", "Enter your garage details", "Create your first job card"],
    integration: "Never forget previous repair history for any vehicle serviced in your garage."
  },
]

export default function WhoUses({ onSelectCategory }: { onSelectCategory: (cat: any) => void }) {
  return (
    <section id="who" className="py-32 bg-[#14181A] text-center relative overflow-hidden border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-black text-[#E3A23C] uppercase tracking-widest block">
            Tailored Operating System
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight font-ubuntu">
            Built for your type of business
          </h2>
          <p className="text-white/50 text-sm md:text-base font-medium">
            Pick your business type to see how Hlynk fits your day-to-day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
          {categories.map((c, i) => {
            const swatch = SWATCHES[i % SWATCHES.length]
            return (
              <div
                key={c.label}
                onClick={() => onSelectCategory(c)}
                className="p-6 rounded-[28px] bg-[#1B212B] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div
                    style={{ backgroundColor: swatch }}
                    className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 text-[#14181A] group-hover:scale-105 transition-transform"
                  >
                    {c.icon}
                  </div>
                  <h3 className="text-base font-black text-white mb-1.5 font-ubuntu">
                    {c.label}
                  </h3>
                  <p className="text-white/45 text-[13px] font-medium leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-white/5 flex items-center justify-between">
                  <span
                    className="px-3 py-1.5 rounded-full bg-white/5 text-[11px] font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                    style={{ color: swatch }}
                  >
                    View details →
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