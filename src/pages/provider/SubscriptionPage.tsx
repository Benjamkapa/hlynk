import { Calendar, CreditCard, CheckCircle2, Zap, AlertTriangle, ChevronRight } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'

export default function SubscriptionPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription</h1>
          <p className="text-gray-500 font-medium">Manage your business plan, billing cycle and features</p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[14px] border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10">
          <div className="h-20 w-20 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Zap size={40} />
          </div>
        </div>

        <div className="max-w-xl">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Active Status</span>
          <h2 className="text-4xl font-black text-gray-900 mt-6 mb-3 tracking-tight">Premium Business</h2>
          <p className="text-gray-500 font-medium text-lg mb-10 leading-relaxed">Unlimited sales tracking, full inventory management, and deep analytical reports for your growing enterprise.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="space-y-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Calendar size={14} /> Next Billing Date
               </p>
               <p className="text-lg font-black text-gray-900 hl-mono">May 24, 2026</p>
            </div>
            <div className="space-y-1">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <CreditCard size={14} /> Monthly Amount
               </p>
               <p className="text-lg font-black text-[#0D4A3E] hl-mono">KES 1,500 / mo</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-[#0D4A3E] text-white px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl shadow-emerald-900/10">
              Renew Now
            </button>
            <button className="bg-white text-gray-600 px-10 py-5 rounded-xl font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-amber-50 border border-amber-100 p-8 rounded-[14px] flex items-start gap-6">
          <div className="h-12 w-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-lg font-black text-amber-900 mb-1">Auto-renewal is Active</h4>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">Your subscription will automatically renew using M-Pesa <span className="hl-mono font-black">0712 *** 678</span>. Ensure you have sufficient funds to avoid service interruption.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-8 rounded-[14px] flex items-center justify-between group cursor-pointer hover:shadow-md transition-all">
          <div className="flex items-center gap-6">
             <div className="h-12 w-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-all">
               <CheckCircle2 size={24} />
             </div>
             <div>
               <h4 className="text-lg font-black text-gray-900">Billing History</h4>
               <p className="text-sm text-gray-500 font-medium">View and download your past invoices</p>
             </div>
          </div>
          <ChevronRight size={24} className="text-gray-300 group-hover:text-emerald-600 transition-all" />
        </div>
      </div>
    </div>
  )
}
