
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { FadeUp } from './Animations'

const faqs = [
  {
    question: 'What is hlynk?',
    answer:
      'hlynk is a business management system designed to help Kenyan business owners manage sales, stock, expenses, customers, and business performance in one place.',
  },
  {
    question: 'Do I need to book a demo before I can use hlynk?',
    answer:
      'No demo needed! Instead of waiting for a sales call or watching mock dummy data, you can jump straight into the live production environment. Sign up with your own credentials in 60 seconds, enter your actual products, services, or rooms, test M-Pesa STK checkout, and experience the real system free for 14 straight days — no credit card required.',
  },
  {
    question: 'Who is hlynk designed for?',
    answer:
      'hlynk is built for small and growing businesses, including retail shops, minimarts, boutiques, BnBs, guest houses, and service-based businesses.',
  },
  {
    question: 'Can hlynk help reduce employee theft and dishonesty?',
    answer:
      'hlynk helps you maintain clear records of sales, stock, and expenses, making discrepancies easier to identify and investigate. Regular reconciliation and proper staff controls help you stay in control of your business, even when you are away.',
  },
  {
    question: 'Can I track my sales and stock in real time?',
    answer:
      'hlynk helps you record sales and monitor inventory, making it easier to understand what is selling, what remains in stock, and where discrepancies may exist. Accurate records depend on consistently recording business transactions.',
  },
  {
    question: 'Does hlynk support M-Pesa payments?',
    answer:
      'hlynk is designed to support M-Pesa and other configured payment methods, helping you organize business transactions and track recorded payments. Available payment options depend on your account setup.',
  },
  {
    question: 'Can I monitor my business when I am away?',
    answer:
      'Yes. hlynk helps you access recorded business information, including sales, expenses, stock, and performance reports, so you can stay informed without being physically present at your business.',
  },
  {
    question: 'Can I track my business expenses and profits?',
    answer:
      'hlynk helps you record expenses and review sales and profit reports, giving you a clearer picture of your business performance. The accuracy of these reports depends on keeping your records complete and up to date.',
  },
  {
    question: 'Can I manage products and services in one system?',
    answer:
      'hlynk supports the management of goods and services, helping you organize your sales and business records from one platform.',
  },
  {
    question: 'Is hlynk suitable for a small business?',
    answer:
      'Yes. hlynk is designed to help small and growing businesses organize daily operations, improve visibility into sales and expenses, manage stock, and make more informed business decisions.',
  },
  {
    question: 'Can hlynk help with business finance tracking?',
    answer:
      'Yes. hlynk helps you record expenses and review sales and profit reports, giving you a clearer picture of your business performance. The accuracy of these reports depends on keeping your records complete and up to date.',
  },
  {
    question: 'Does hlynk have a mobile app?',
    answer:
      "Yes. hlynk is a Progressive Web App (PWA) that can be installed on your iPhone or Android device. Simply tap the 'Add to Home Screen' option in your browser to install Hlynk as an app on your device.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index))
  }

  return (
    <section
      id="faq"
      className="bg-[#EDF3EF] py-20 text-[#253A32] md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">

        {/* Heading */}
        <FadeUp delay={0.1}>
          <div className="mb-12 max-w-xl md:mb-14">
            <span className="mb-3 block text-xs font-medium tracking-wide text-emerald-800/70">
              Good to know
            </span>

            <h2 className="font-ubuntu text-2xl font-semibold tracking-tight text-[#20382E] sm:text-3xl md:text-4xl">
              A few common questions.
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#687970] sm:text-base">
              Some helpful answers about using hlynk to run your business.
            </p>
          </div>
        </FadeUp>

        {/* Questions */}
        <div className="max-w-4xl border-t border-[#D5E0D8]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <FadeUp key={faq.question} delay={0.03}>
                <article className="border-b border-[#D5E0D8]">
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left sm:py-6"
                  >
                    <span
                      className={`text-sm font-medium leading-6 transition-colors duration-200 sm:text-base ${
                        isOpen ? 'text-[#246747]' : 'text-[#30443A]'
                      }`}
                    >
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                        isOpen
                          ? 'bg-[#DCE9DF] text-[#246747]'
                          : 'text-[#829188]'
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={15} strokeWidth={1.7} />
                      ) : (
                        <Plus size={15} strokeWidth={1.7} />
                      )}
                    </span>
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-[#718078] sm:pb-7 sm:text-[15px] sm:leading-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </article>
              </FadeUp>
            )
          })}
        </div>

        {/* Contact */}
        <FadeUp delay={0.1}>
          <p className="mt-9 text-sm text-[#718078]">
            Can't find what you're looking for?{' '}
            <a
              href="mailto:info@hlynk.co.ke"
              className="font-medium text-[#246747] transition-colors hover:text-[#173D2C]"
            >
              Talk to us.
            </a>
          </p>
        </FadeUp>
      </div>
    </section>
  )
}
