import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FadeUp } from './Animations'

const faqs = [
  {
    question: "How do M-Pesa payments and bank payouts work?",
    answer: "Hlynk supports instant M-Pesa STK Push checkout and automated KCB bank settlements. Customers receive direct prompts on their phone, and sales are automatically reconciled in your portal."
  },
  {
    question: "What is the difference between Starter and Business Pro (MAX)?",
    answer: "Starter covers single-store POS operations, up to 100 inventory items, and M-Pesa STK payments. Business Pro unlocks unlimited inventory, public stay/BnB booking pages, direct bank payouts, and full audit logs."
  },
  {
    question: "Can I manage stay or BnB bookings on Hlynk?",
    answer: "Yes. Business Pro subscribers and trial users get a dedicated public stay listing page (/stay/your-property) to showcase rooms, check availability, and accept direct guest bookings."
  },
  {
    question: "Does Hlynk work offline when my internet connection drops?",
    answer: "Yes. You can record sales and issue receipts without internet. All offline records automatically synchronize to the secure cloud as soon as your device reconnects."
  },
  {
    question: "How does Hlynk protect my business from staff theft or unauthorized changes?",
    answer: "You can create individual staff accounts with restricted permission roles. Every sale, item edit, discount, or deletion is tracked in real-time audit logs tagged to the active worker."
  },
  {
    question: "Is there a free trial or binding contract?",
    answer: "Every new account gets a 14-day free trial with no credit card required. Subscriptions are billed flexibly month-to-month, or discounted for 6-month (-5%) and 1-year (-15%) billing cycles."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-32 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 font-ubuntu">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">
              Everything you need to know about Hlynk's POS, stay bookings, payments, and plans.
            </p>
          </FadeUp>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <FadeUp key={i} delay={0.1 * (i + 1)}>
                <div 
                  className={`bg-slate-900 border transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer ${isOpen ? 'border-emerald-500/40 shadow-md' : 'border-slate-800 hover:border-slate-700'}`}
                  onClick={() => toggle(i)}
                >
                  <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                    <h3 className={`text-md md:text-lg font-thin transition-colors ${isOpen ? 'text-emerald-400' : 'text-slate-100'}`}>
                      {faq.question}
                    </h3>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                  </div>
                  
                  <div 
                    className={`px-6 md:px-8 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 pb-6 md:pb-8 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <p className="text-slate-400 leading-relaxed font-medium">
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
