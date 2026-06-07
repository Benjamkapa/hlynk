import { useState } from 'react'
import { Search, Zap, Package, Users, TrendingUp, X, CheckCircle2, ChevronRight } from 'lucide-react'

export default function HelpPage() {
  const [selectedGuide, setSelectedGuide] = useState<null | typeof guides[0]>(null)

  const guides = [
    { 
      id: 'sale',
      title: 'How to record a sale', 
      desc: 'Learn how to checkout customers and print receipts.', 
      icon: Zap,
      steps: [
        'Open the "Record Sale" page from your sidebar.',
        'Click on the products the customer wants to buy.',
        'Click "Proceed to Checkout" at the bottom of your cart.',
        'Select the payment method (Cash or M-Pesa).',
        'Finish the sale and click "Print Receipt" if the customer needs one.'
      ]
    },
    { 
      id: 'stock',
      title: 'How to add stock', 
      desc: 'Add new products and set your selling prices.', 
      icon: Package,
      steps: [
        'Go to the "Inventory" page.',
        'Click the "Add Product" button at the top right.',
        'Enter the product name, buying price, and selling price.',
        'Set a "Low Stock Alert" (e.g., 5) to know when to restock.',
        'Click "Save Product" to finish.'
      ]
    },
    { 
      id: 'customers',
      title: 'How to manage customers', 
      desc: 'Register customers to track their loyalty.', 
      icon: Users,
      steps: [
        'Open the "Customers" page.',
        'Click "Register New Customer".',
        'Enter their Name and Phone Number.',
        'Next time they buy, select their name in the POS to track their points.',
        'View their history anytime by clicking on their name in the list.'
      ]
    },
    { 
      id: 'profits',
      title: 'How to check your profits', 
      desc: 'See how much money your business is making.', 
      icon: TrendingUp,
      steps: [
        'Go to your main "Dashboard".',
        'Look at the "Estimated Profit" card at the top.',
        'Check the "Revenue Trajectory" chart to see your daily growth.',
        'For deeper details, go to the "Reports" page.',
        'You can download a full summary of your sales and expenses there.'
      ]
    },
  ]

  return (
    <div className="space-y-8 pt-6 pb-20">
      
      {/* Minimal Header */}
      <div className="bg-[#0D4A3E] rounded-[16px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">How can we help your business?</h1>
          <p className="text-emerald-200 font-medium opacity-90">Simple guides to master your sales, stock, and customers.</p>
          
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for a guide..." 
              className="w-full bg-white border-none rounded-xl py-4 pl-12 pr-4 outline-none text-gray-900 font-medium shadow-lg" 
            />
          </div>
        </div>
      </div>

      {/* Minimal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {guides.map((guide) => (
          <button 
            key={guide.id}
            onClick={() => setSelectedGuide(guide)}
            className="flex items-center gap-5 p-6 bg-white border border-gray-100 rounded-[16px] text-left hover:border-emerald-200 hover:shadow-sm transition-all group"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <guide.icon size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-gray-900 mb-0.5">{guide.title}</h3>
              <p className="text-gray-500 text-sm font-medium">{guide.desc}</p>
            </div>
            <ChevronRight className="text-gray-300 group-hover:text-emerald-500 transition-colors" size={20} />
          </button>
        ))}
      </div>

      {/* Support Box */}
      <div className="p-6 bg-gray-50 rounded-[16px] border border-gray-100 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">Need more help? Our team is available via chat.</p>
        <a href="https://wa.me/254790590653" className="text-emerald-600 font-black text-sm hover:underline cursor-pointer">Contact Support</a>
      </div>

      {/* Simple Step-by-Step Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setSelectedGuide(null)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <selectedGuide.icon size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">{selectedGuide.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedGuide(null)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {selectedGuide.steps.map((step, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 rounded-full border-2 border-emerald-100 bg-white text-emerald-600 font-black text-sm flex items-center justify-center shrink-0 group-hover:border-emerald-500 transition-colors">
                      {i + 1}
                    </div>
                    {i < selectedGuide.steps.length - 1 && (
                      <div className="w-0.5 h-full bg-emerald-50 mt-1" />
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-gray-700 font-medium leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-gray-50 border-top border-gray-100">
              <button 
                onClick={() => setSelectedGuide(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-black text-sm hover:bg-black transition-all"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
