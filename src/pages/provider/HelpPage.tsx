import { Search, Zap, Package, TrendingUp, Users, Shield, ChevronRight } from 'lucide-react'

export default function HelpPage() {
  const guides = [
    { title: 'Record your first sale', desc: 'Learn how to use the high-speed POS system.', icon: Zap, time: '2 min read' },
    { title: 'Inventory Management', desc: 'Adding products and setting stock alerts.', icon: Package, time: '5 min read' },
    { title: 'Understanding Reports', desc: 'How to read your profit and loss statements.', icon: TrendingUp, time: '4 min read' },
    { title: 'Customer Loyalty', desc: 'Setting up discounts for frequent shoppers.', icon: Users, time: '3 min read' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="bg-[#0D4A3E] rounded-[14px] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black mb-4">How can we help your business?</h1>
          <p className="text-emerald-200 font-medium text-lg leading-relaxed">Search for guides on using hlynk to manage your sales, stock, and customers.</p>
          
          <div className="relative mt-8">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-800" size={24} />
            <input 
              type="text" 
              placeholder="Search help articles..." 
              className="w-full bg-white border-none rounded-xl py-5 pl-16 pr-6 outline-none text-gray-900 font-bold placeholder:text-gray-400 shadow-2xl" 
            />
          </div>
        </div>
        <Shield size={240} className="absolute -right-10 -top-10 text-emerald-800 opacity-20 -rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, i) => (
          <div key={i} className="bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer flex gap-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <guide.icon size={28} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-black text-gray-900">{guide.title}</h3>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{guide.time}</span>
              </div>
              <p className="text-gray-500 font-medium text-sm mb-4 leading-relaxed">{guide.desc}</p>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
                Watch Tutorial <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-emerald-50 rounded-[14px] p-8 border border-emerald-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-[#0D4A3E] mb-1">Still stuck?</h3>
          <p className="text-emerald-700 font-medium">Our support team is available 24/7 to help you out.</p>
        </div>
        <button className="bg-[#0D4A3E] text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-[#0A3D33] transition-all">
          Chat with us
        </button>
      </div>
    </div>
  )
}
