import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FadeUp } from './Animations'

const faqs = [
  {
    question: "Is hlynk officially compliant with KRA eTIMS?",
    answer: "Yes! For our Growing and Business Pro users, hlynk offers a direct system-to-system integration with KRA. This means your invoices are automatically pushed to eTIMS in real-time without you having to log into a separate portal. We handle the technical heavy lifting so you stay tax compliant effortlessly."
  },
  {
    question: "Do I need my own Paybill or Till Number?",
    answer: "Not necessarily. If you're a small vendor, you can use hlynk's 'Shared Infrastructure' to accept payments, and we settle the funds to your M-Pesa or KCB account. However, if you already have your own Paybill/Till, you can link it directly to enable instant STK Push prompts for your customers."
  },
  {
    question: "What happens if my shop has no internet?",
    answer: "We've got you covered. hlynk is built for Kenyan reality. Our 'Offline Mode' allows you to continue recording sales and printing receipts even when Safaricom or Airtel bundles run out. Once you're back online, the system automatically syncs everything to the cloud."
  },
  {
    question: "I have 3 shops in different towns. Can I manage them all?",
    answer: "Absolutely. You can track multiple branches (e.g., CBD, Westlands, and Kisumu) from a single dashboard. You'll see which shop is making the most profit, which one has low stock, and how your different managers are performing—all from your phone."
  },
  {
    question: "How do I ensure my staff aren't stealing from me?",
    answer: "This is a major pain for many owners. hlynk provides individual staff accounts with restricted permissions. You can see who recorded every sale, who deleted an item, and who opened the drawer. We also provide 'Abnormal Activity' alerts to flag suspicious stock movements."
  },
  {
    question: "How does the KCB Buni integration work?",
    answer: "Through our partnership with KCB, funds collected via our integrated payment gateway can be settled directly into your KCB Bank account. It's faster than waiting for manual withdrawals and provides a clear audit trail for your bank whenever you need to apply for a business loan."
  },
  {
    question: "Can I use hlynk for a hardware shop or a pharmacy?",
    answer: "Yes, we support over 20 industries. Whether you sell kilos of nails in a hardware, pieces of bread in a kiosk, or prescriptions in a chemist, our flexible inventory system handles units, batches, and even expiry date tracking for sensitive stock."
  },
  {
    question: "What if I lose my phone? Will my records disappear?",
    answer: "Never. Your data is backed up every second to our secure servers. If your phone is lost or broken, just buy a new one, log in, and you'll find every single KES and every item exactly where you left it. Your business history is safe with us."
  },
  {
    question: "Do you offer training for my workers?",
    answer: "We know that technology can be scary for some staff. That's why hlynk is designed to be as simple as 'WhatsApp'. We also provide video tutorials in both English and Swahili, and our local support team is available on call to walk your team through the first few sales."
  },
  {
    question: "Is there a long-term contract or can I pay as I go?",
    answer: "We believe in flexibility. You can pay for 28 days (one cycle) to test the waters, or commit to 6 or 12 months to unlock massive discounts (5% and 15% respectively). No hidden fees, no complicated cancellation process—you're in total control."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-white relative overflow-hidden border-t border-slate-200">
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
