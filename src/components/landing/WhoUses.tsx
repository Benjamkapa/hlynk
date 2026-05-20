import { Scissors, Wrench, Smartphone, Sparkles, Zap, Utensils, Shirt, Camera, Monitor, GraduationCap, Cpu, Plus } from 'lucide-react'
import { FadeUp } from './Animations'
import { useState } from 'react'
import IndustryDetailsModal from './IndustryDetailsModal'

const categories = [
  { 
    icon: <Scissors size={20} />, 
    label: "Salons & Barbers",
    description: "Tired of manual books and staff calculations? Manage every haircut and service directly from your phone. It's simple and fast.",
    features: ["Staff Commission tracking", "Daily Sales records", "Inventory and stock levels", "Client History"],
    onboarding: ["Login using your Google (Gmail) account", "Add your list of services (Cuts, Braids, etc.)", "Record your first sale on your phone"],
    integration: "Makes daily payouts to barbers instant and accurate, and builds trust by showing them digital records of their work."
  },
  { 
    icon: <Wrench size={20} />, 
    label: "Mechanics",
    description: "Garage records should be easy. Track every job card and spare part used without the messy paperwork.",
    features: ["Digital Job Cards", "Spare parts list", "Customer service history", "Expense tracking"],
    onboarding: ["Sign in securely with Google", "Setup your garage profile", "Create your first digital job card for a vehicle"],
    integration: "Remembers what you fixed for a customer 6 months ago—professional service that keeps them coming back."
  },
  { 
    icon: <Smartphone size={20} />, 
    label: "Electronic Repair",
    description: "From electronics repair to PC shops. Log repairs from intake to pickup and never lose a customer's device.",
    features: ["Repair status tracking", "Parts inventory", "Pickup notifications", "Technician records"],
    onboarding: ["Onboard with your Gmail account", "Add common repair costs", "Log a device and provide a digital receipt"],
    integration: "Automatically deducts screens and batteries from your stock whenever you fix a device."
  },
  { 
    icon: <Sparkles size={20} />, 
    label: "Cleaning & Spas",
    description: "Manage your cleaning business or spa bookings professionally. Track what supplies you are using.",
    features: ["Service Packages", "Staff Scheduling", "Supply alerts", "Digital Billing"],
    onboarding: ["Fast login via Google", "List your cleaning or spa packages", "Set your staff names"],
    integration: "Monitors your stock levels—never get stuck without supplies or oils when a client arrives."
  },
  { 
    icon: <Zap size={20} />, 
    label: "Electricians",
    description: "For freelance technicians and electrical firms. Track site material costs and turn quotes into records easily.",
    features: ["Material Costing", "Client Records", "Quote conversion", "Expense tracking"],
    onboarding: ["Link your Google account", "Add your common materials", "Create a digital record for your next site visit"],
    integration: "Shows you exactly what materials were taken to the site vs. what was used, keeping your project profits clear."
  },
  { 
    icon: <Utensils size={20} />, 
    label: "Catering & Cafe",
    description: "Fast-paced service for modern businesses. Record food orders quickly and see your daily profit at a glance.",
    features: ["Fast Billing", "Daily Profit tracking", "Stock alerts", "Sales History"],
    onboarding: ["Login with Google", "Type in your menu items", "Start taking orders on your mobile or tablet"],
    integration: "Shows you exactly how much money you made at the end of the shift after accounting for ingredient costs."
  },
  { 
    icon: <Shirt size={20} />, 
    label: "Tailors",
    description: "Store customer measurements safely online. Never lose a measurement card again and track delivery dates.",
    features: ["Measurement Storage", "Delivery Tracking", "Fabric Stock", "Deposit Records"],
    onboarding: ["Secure login via Google", "Save your first customer's measurements", "Note the fabric delivery date"],
    integration: "Alerts you as delivery dates approach so you can keep your customers happy and stylish."
  },
  { 
    icon: <Camera size={20} />, 
    label: "Studio",
    description: "Photography business made professional. Track shoot deposits and final payments for every session.",
    features: ["Session Logs", "Payment milestones", "Equipment List", "Client History"],
    onboarding: ["Login professionally with Google", "Setup your shoot packages", "Record your first customer deposit"],
    integration: "Helps you know who has paid for their files vs. who is still pending, keeping your cashflow healthy."
  },
  { 
    icon: <Monitor size={20} />, 
    label: "Freelancers",
    description: "Digital business records for modern work. Track project income, expenses, and invoices in one place.",
    features: ["Clean Invoicing", "Expense Log", "Payment Tracking", "Searchable Clients"],
    onboarding: ["One-tap Google login", "Add your service rates", "Create a digital receipt for your latest project"],
    integration: "Keeps your digital records clean for taxes or when you are applying for a business loan."
  },
  { 
    icon: <GraduationCap size={20} />, 
    label: "Tutors",
    description: "Manage your teaching services professionally. Track student attendance and fee payments in real-time.",
    features: ["Fee Records", "Attendance tracking", "Student list", "Subject scheduling"],
    onboarding: ["Login using Google", "Register your students", "Log their first lesson fee"],
    integration: "Clearly shows which parents haven't paid, helping you manage your tuition business with zero guesswork."
  },
  { 
    icon: <Cpu size={20} />, 
    label: "Tech Shop",
    description: "Electronic business needs serious records. Track serial numbers and monitor your stock from your phone.",
    features: ["Serial Number (IMEI) tracking", "Warranty logs", "Fast stock search", "Supplier list"],
    onboarding: ["Sign in via Google", "Add your gadgets to inventory", "Record a sale using your phone"],
    integration: "Ensures you only honor warranties for items you actually sold, protecting your business from fraud."
  },
  { 
    icon: <Plus size={20} />, 
    label: "Retail & Stalls",
    description: "Built for busy shops and stalls. Get stock alerts on your phone before your fast-moving items run out.",
    features: ["Low stock alerts", "Fast checkout", "Multiple payment logs", "Profit analytics"],
    onboarding: ["Link your Google account", "Add your item quantities", "Start recording sales and see your profit"],
    integration: "The system monitors your stock and tells you exactly what needs restocking at the end of the day."
  },
]

export default function WhoUses({ onSelectCategory }: { onSelectCategory: (cat: any) => void }) {
  return (
    <section id="who" className="py-32 bg-[#050D0A] text-center relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <FadeUp className="mb-20">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 block underline decoration-emerald-500/30 underline-offset-8">Tailored Solutions</span>
          <h2 className="text-4xl md:text-5xl font-black font-thin text-white tracking-tighter font-ubuntu leading-tight">
            Built for every <br className="hidden md:block" />
            <span className="text-white font-ubuntu underline decoration-white/10">business owner.</span>
          </h2>
          <p className="text-white/40 mt-6 text-sm font-medium max-w-lg mx-auto leading-relaxed">
            Get a system that understands your work. Select your industry to see how we simplify your daily business records.
          </p>
        </FadeUp>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((c, i) => (
            <FadeUp key={c.label} delay={i * 0.05} className="group">
              <div 
                onClick={() => onSelectCategory(c)}
                className="p-8 rounded-2xl bg-white/[0.03] border border-white/5 transition-all flex flex-col items-center gap-5 hover:bg-white/[0.08] hover:border-white/20 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all shadow-sm">
                  {c.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">
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
