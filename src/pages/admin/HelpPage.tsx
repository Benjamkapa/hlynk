import { Search, BookOpen, MessageCircle, FileText, ChevronRight, HelpCircle } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

export default function HelpPage() {
  const resources = [
    { title: 'User Onboarding', desc: 'Guide on how to register and verify new providers.', icon: BookOpen },
    { title: 'Risk Management', desc: 'Understanding risk scores and fraud detection.', icon: FileText },
    { title: 'Payout Systems', desc: 'Configuration of automated vs manual settlements.', icon: MessageCircle },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">How can we help, Admin?</h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto text-lg">Search our internal documentation for platform management, business control, and financial operations.</p>
        
        <div className="relative max-w-2xl mx-auto pt-6">
          <Search className="absolute left-6 top-[70%] -translate-y-1/2 text-gray-400" size={24} />
          <input 
            type="text" 
            placeholder="Search platform guides, API docs, or policy..." 
            className="w-full bg-white border border-gray-100 shadow-xl shadow-emerald-900/5 rounded-[14px] py-6 pl-16 pr-6 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-lg font-bold" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {resources.map((res, i) => (
          <div key={i} className="bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <res.icon size={28} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{res.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed text-sm">{res.desc}</p>
            <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
              Read Guide <ChevronRight size={14} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-900 rounded-[14px] p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-4">Direct Support Link</h2>
          <p className="text-emerald-200 font-medium max-w-md text-lg leading-relaxed">Need urgent assistance with platform infrastructure or security incidents? Contact the engineering team directly.</p>
          <button 
            onClick={() => window.location.href = 'mailto:devops@hudumalynk.com?subject=URGENT: Platform Infrastructure Support Request'}
            className="mt-8 bg-emerald-400 text-emerald-900 px-8 py-4 rounded-xl font-black text-sm hover:bg-emerald-300 transition-all"
          >
            Contact DevOps
          </button>
        </div>
        <HelpCircle size={240} className="absolute -right-20 -bottom-20 text-emerald-800 opacity-20 rotate-12" />
      </div>
    </div>
  )
}
