import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FadeUp } from './Animations'

const faqs = [
  {
    question: "Is Hlynk legally compliant with KRA eTIMS?",
    answer: "Yes. Hlynk connects directly with KRA. When you sell, the receipt is sent to the eTIMS system automatically. You don't need to log in to another website or type anything manually."
  },
  {
    question: "Do I need my own Paybill or Till Number?",
    answer: "No, you don't need your own. Small businesses can use Hlynk's shared Till to receive payments, and we will send the money straight to your phone or bank. If you already have your own Paybill or Till, you can easily link it so customers pay you directly."
  },
  {
    question: "What happens if my shop has no internet?",
    answer: "Hlynk works even without internet. You can continue recording sales and printing receipts when your connection is down. Once your internet comes back, Hlynk will automatically upload all records to the secure cloud."
  },
  {
    question: "I have multiple shops of different types. Can I manage them all?",
    answer: "Yes. You can manage multiple shop branches from one phone. You will see which shop makes the most profit, check stock values, and track staff performance from anywhere."
  },
  {
    question: "How do I ensure my staff aren't stealing from me?",
    answer: "Hlynk tracks every transaction. You can give each worker their own login with limited access. You'll see exactly who made each sale, deleted any item, or logged an expense, preventing loss."
  },
  {
    question: "How does the bank deposit integration work?",
    answer: "All customer payments can go straight into your bank account automatically. This gives you a clean statement of your business income, which makes it much easier to get a business loan when you need one."
  },
  {
    question: "Can I use Hlynk for a hardware shop, salon, or pharmacy?",
    answer: "Yes. We support kiosks, hardware shops, pharmacies, beauty salons, rental cars, BnBs, and garages. If you sell items in pieces, kilograms, packages, or services by the hour, Hlynk handles it."
  },
  {
    question: "What if I lose my phone? Will my records disappear?",
    answer: "Never. Your records are saved securely in the cloud every second. If your phone gets lost or damaged, simply log in on a new device and all your stock, sales, and money history will be there."
  },
  {
    question: "Do you offer training for my workers?",
    answer: "Yes. Hlynk is simple to use. We provide short tutorial videos in English and Swahili. Plus, our support team is always a call or text away to guide you and your workers."
  },
  {
    question: "Is there a long-term contract or can I pay as I go?",
    answer: "No long contracts. You pay month-to-month and can pause or switch plans at any time. If you decide to pay for 6 or 12 months in advance, you get a discount."
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
              Got questions? We've got answers. Here is what other Kenyan business owners ask us the most.
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
                    <h3 className={`text-lg md:text-xl font-bold transition-colors ${isOpen ? 'text-emerald-400' : 'text-slate-100'}`}>
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
