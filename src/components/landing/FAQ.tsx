import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FadeUp } from './Animations'

const faqs = [
  {
    question: "Do I need a Paybill or Till number to use HudumaLynk?",
    answer: "No, you don't necessarily need one immediately to start tracking your cash sales. However, on our Growth and Pro plans, you can integrate your Till or Paybill number with our M-Pesa STK push for automatic payment recording."
  },
  {
    question: "Can I use the system on my phone?",
    answer: "Yes! HudumaLynk is fully mobile-friendly. You can record sales, track inventory, and send digital receipts straight from your smartphone or tablet, whether you're at the shop or on the move."
  },
  {
    question: "Is my data safe in case I lose my phone or computer?",
    answer: "Absolutely. All your business data is securely stored in the cloud. If you lose your phone, simply log into your account on a new device, and all your records, sales, and inventory will be right there."
  },
  {
    question: "How do the digital receipts work?",
    answer: "Instead of printing paper receipts, HudumaLynk generates a digital receipt link or a customized SMS that you can send directly to your customer's WhatsApp or standard SMS inbox after a sale."
  },
  {
    question: "Can I track my daily expenses as well?",
    answer: "Yes, our platform allows you to record daily expenses like rent, tokens, supplier payments, and transport. The system then calculates your actual net profit at the end of the day."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-16">
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6 font-ubuntu">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
              Got questions? We've got answers. Here is what other Kenyan vendors ask us the most.
            </p>
          </FadeUp>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <FadeUp key={i} delay={0.1 * (i + 1)}>
                <div 
                  className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer ${isOpen ? 'border-emerald-200 shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => toggle(i)}
                >
                  <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                    <h3 className={`text-lg md:text-xl font-bold transition-colors ${isOpen ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {faq.question}
                    </h3>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                  </div>
                  
                  <div 
                    className={`px-6 md:px-8 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-6 md:pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </FadeUp>
            )
          })}
        </div>
      </div>
    </section>
  )
}
