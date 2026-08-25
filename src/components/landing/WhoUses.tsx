import { Scissors, Wrench, Sparkles, Hotel, Car, ShoppingBag, Utensils, Smartphone, Cpu, ShieldCheck } from 'lucide-react'

const categories = [
  { 
    icon: <Hotel size={22} />, 
    label: "BnBs & Apartments",
    description: "Track your rooms, guest bookings, check-in dates, and cleanings. No more double bookings or lost records.",
    features: ["Room Calendar", "Guest Payments & Balances", "Airbnb & Direct Bookings", "Room Cleaning Status"],
    onboarding: ["Sign in with Google", "Add your rooms or units", "Record your first guest booking"],
    integration: "Hlynk immediately updates room availability and calculates guest balances."
  },
  { 
    icon: <Car size={22} />, 
    label: "Car Rentals & Fleet",
    description: "Keep track of your cars, daily rental prices, customer bookings, and maintenance costs. Always know which car is available.",
    features: ["Car Availability Tracker", "Daily Rent Calculator", "Maintenance Expense Logs", "Simple Deposit Records"],
    onboarding: ["Sign in with Google", "Add your vehicle fleet", "Record a rental trip"],
    integration: "Rentals are automatically linked to your profit reports, including repair costs."
  },
  { 
    icon: <Sparkles size={22} />, 
    label: "Car Wash & Detailing",
    description: "Log every wash, track water/soap usage, assign jobs to staff, and calculate daily payouts automatically.",
    features: ["Wash Style Packages", "Employee Job Assignment", "Water & Soap Stock Count", "Fast Customer Receipts"],
    onboarding: ["Sign in with Google", "Enter your wash package prices", "Record your first car wash"],
    integration: "Calculates employee commissions and updates wash sales in real-time."
  },
  { 
    icon: <ShoppingBag size={22} />, 
    label: "Retail & Mini Marts",
    description: "Sell faster with quick barcode scanning, track your stock levels, get alerts when items are running out, and see your profit instantly.",
    features: ["Fast POS Checkout", "Low Stock Text Alerts", "Supplier Payments", "Instant Profit Summary"],
    onboarding: ["Sign in with Google", "Enter your items and prices", "Record your first sale"],
    integration: "Deducts stock automatically from inventory with every cash or M-Pesa sale."
  },
  { 
    icon: <Scissors size={22} />, 
    label: "Salons & Barbers",
    description: "Track haircuts, salon services, and cosmetic product sales. Calculate staff commissions and daily earnings without errors.",
    features: ["Staff Commission Tracker", "Daily Service Logs", "Hair Product Inventory", "Client Visit History"],
    onboarding: ["Sign in with Google", "Enter your service packages", "Record daily client visits"],
    integration: "Makes daily payouts to barbers and beauticians transparent and fast."
  },
  { 
    icon: <Wrench size={22} />, 
    label: "Garages & Mechanics",
    description: "Create digital job cards for every vehicle, track used spare parts, record mechanic jobs, and view service history.",
    features: ["Digital Job Cards", "Spare Parts Count", "Vehicle Service History", "Mechanics' Commission Logs"],
    onboarding: ["Sign in with Google", "Enter your garage details", "Create your first job card"],
    integration: "Never forget previous repair history for any vehicle serviced in your garage."
  },
]

export default function WhoUses({ onSelectCategory }: { onSelectCategory: (cat: any) => void }) {
  return (
    <section id="who" className="py-32 bg-slate-50 text-center relative overflow-hidden border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-3xl mx-auto mb-20 space-y-3">
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest block">
            Tailored Operating System
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight font-ubuntu">
            Built for your type of business
          </h2>
          <p className="text-slate-600 text-sm md:text-base font-medium">
            Select your business type below to see how Hlynk makes your daily work easier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {categories.map((c) => (
            <div 
              key={c.label}
              onClick={() => onSelectCategory(c)}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {c.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 font-ubuntu">
                  {c.label}
                </h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-4">
                  {c.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>View Details</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
