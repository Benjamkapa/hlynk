import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { FadeUp } from "./Animations";

const faqs = [
  // {
  //   question: "How do M-Pesa payments and bank payouts work?",
  //   answer: "hlynk supports instant M-Pesa STK Push checkout and automated KCB bank settlements. Customers receive direct prompts on their phone, and sales are automatically reconciled in your portal."
  // },
  // {
  //   question: "What is the difference between Starter and Business Pro?",
  //   answer: "Starter covers single-store POS operations, up to 60 inventory items, and M-Pesa STK payments. Business Pro unlocks unlimited inventory, public store/shop & stay booking pages, direct bank payouts, and full audit logs."
  // },
  // {
  //   question: "Can I manage public store listings and stay bookings on Hlynk?",
  //   answer: "Yes. Business Pro subscribers and trial users get dedicated public store (/store/your-slug) and stay booking pages (/stay/your-property) to showcase products & rooms, check availability, and accept direct client orders and guest bookings."
  // },
  // {
  //   question: "Does hlynk work offline when my internet connection drops?",
  //   answer: "Yes. You can record sales and issue receipts without internet. All offline records automatically synchronize to the secure cloud as soon as your device reconnects."
  // },
  // {
  //   question: "How does hlynk protect my business from staff theft or unauthorized changes?",
  //   answer: "You can create individual staff accounts with restricted permission roles. Every sale, item edit, discount, or deletion is tracked in real-time audit logs tagged to the active worker."
  // },
  // {
  //   question: "Is there a free trial or binding contract?",
  //   answer: "Every new account gets a 14-day free trial with no credit card required. Subscriptions are billed flexibly month-to-month, or discounted for 6-month (-5%) and 1-year (-10%) billing cycles."
  // },
  // {
  //   question: "What are the exact pricing plans for hlynk?",
  //   answer: "hlynk offers two transparent subscription tiers: Starter at KES 4,450 / month for growing single-store businesses (up to 60 inventory items, STK push checkout, 1 staff account), and Business Pro at KES 8,200 / month for hotels, rentals, stores, and multi-branch teams (unlimited items, stay booking pages, direct bank settlements). All plans include a free 14-day trial."
  // },
  // {
  //   question: "How do I get started with Hlynk?",
  //   answer: "Getting started takes under 2 minutes! Create your account, choose your business type (Retail POS, Hospitality/Stays, Services), set up your products or rooms, and start processing sales or bookings instantly."
  // },
  // {
  //   question: "Can I install hlynk as an app on my iPhone or Android device?",
  //   answer: "Yes. hlynk is a Progressive Web App (PWA) that can be installed on your iPhone or Android device. Simply tap the 'Add to Home Screen' option in your browser to install Hlynk as an app on your device."
  // },
  // {
  //   question:"How to install PWA in both android phone using chrome browser and safris in iO",
  //   answer: "In android phone open chrome browser, type hlynk.co.ke, click on the three dots in the top right corner, click on 'Add to Home Screen'. In iOS phone open Safari browser, type hlynk.co.ke, click on the share button in the bottom, click on 'Add to Home Screen'."
  // }
  {
    question: "What is hlynk?",
    answer:
      "hlynk is a business management system designed to help Kenyan business owners manage sales, stock, expenses, customers, and business performance in one place.",
  },
  {
    question: "Do I need to book a demo before I can use hlynk?",
    answer:
      "No demo needed! Instead of waiting for a sales call or watching mock dummy data, you can jump straight into the live production environment. Sign up with your own credentials in 60 seconds, enter your actual products, services, or rooms, test M-Pesa STK checkout, and experience the real system free for 14 straight days — no credit card required.",
  },
  {
    question: "Who is hlynk designed for?",
    answer:
      "hlynk is built for small and growing businesses, including retail shops, minimarts, boutiques, BnBs, guest houses, and service-based businesses.",
  },
  {
    question: "Can hlynk help reduce employee theft and dishonesty?",
    answer:
      "hlynk helps you maintain clear records of sales, stock, and expenses, making discrepancies easier to identify and investigate. Regular reconciliation and proper staff controls help you stay in control of your business, even when you are away.",
  },
  {
    question: "Can I track my sales and stock in real time?",
    answer:
      "hlynk helps you record sales and monitor inventory, making it easier to understand what is selling, what remains in stock, and where discrepancies may exist. Accurate records depend on consistently recording business transactions.",
  },
  {
    question: "Does hlynk support M-Pesa payments?",
    answer:
      "hlynk is designed to support M-Pesa and other configured payment methods, helping you organize business transactions and track recorded payments. Available payment options depend on your account setup.",
  },
  {
    question: "Can I manage my BnB or guest house with hlynk?",
    answer:
      "hlynk's hospitality offering is designed to help accommodation businesses organize operations such as rooms, bookings, guest records, payments, and business reporting, depending on the features enabled in your account.",
  },
  {
    question: "How much does hlynk cost?",
    answer:
      "hlynk offers subscription plans designed for different business needs. Visit the pricing section at hlynk.co.ke to explore available plans, prices, and included features.",
  },
  {
    question: "Can I monitor my business when I am away?",
    answer:
      "Yes. hlynk helps you access recorded business information, including sales, expenses, stock, and performance reports, so you can stay informed without being physically present at your business.",
  },
  {
    question: "Can I track my business expenses and profits?",
    answer:
      "hlynk helps you record expenses and review sales and profit reports, giving you a clearer picture of your business performance. The accuracy of these reports depends on keeping your records complete and up to date.",
  },
  {
    question: "How do I get started with hlynk?",
    answer:
      "Visit hlynk.co.ke, create your business account through the available registration process, and follow the setup steps for your business type.",
  },
  {
    question: "Can I manage products and services in one system?",
    answer:
      "hlynk supports the management of goods and services, helping you organize your sales and business records from one platform.",
  },
  {
    question: "Is hlynk suitable for a small business?",
    answer:
      "Yes. hlynk is designed to help small and growing businesses organize daily operations, improve visibility into sales and expenses, manage stock, and make more informed business decisions.",
  },
  {
    question: "Can hlynk help with business finance tracking?",
    answer:
      "Yes. hlynk helps you record expenses and review sales and profit reports, giving you a clearer picture of your business performance. The accuracy of these reports depends on keeping your records complete and up to date.",
  },
  {
    question: "Does hlynk have a mobile app?",
    answer:
      "Yes. hlynk is a Progressive Web App (PWA) that can be installed on your iPhone or Android device. Simply tap the 'Add to Home Screen' option in your browser to install Hlynk as an app on your device.",
  },
  {
    question: "How to install PWA in both android phone using chrome browser and safaris in iPhone?",
    answer:
      "In Android phone open chrome browser, type hlynk.co.ke, click on the three dots in the top right corner, click on 'Add to Home Screen'. In iOS phone open Safari browser, type hlynk.co.ke, click on the share button in the bottom, click on 'Add to Home Screen'.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="py-32 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-20">
          <FadeUp delay={0.1}>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 font-ubuntu">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">
              Everything you need to know about hlynk's POS, stay bookings,
              payments, and plans.
            </p>
          </FadeUp>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <FadeUp key={i} delay={0.1 * (i + 1)}>
                <div
                  className={`bg-slate-900 border transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer ${isOpen ? "border-emerald-500/40 shadow-md" : "border-slate-800 hover:border-slate-700"}`}
                  onClick={() => toggle(i)}
                >
                  <div className="p-6 md:p-8 flex items-center justify-between gap-6">
                    <h3
                      className={`text-md md:text-lg font-thin transition-colors ${isOpen ? "text-emerald-400" : "text-slate-100"}`}
                    >
                      {faq.question}
                    </h3>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}
                    >
                      {isOpen ? <Minus size={20} /> : <Plus size={20} />}
                    </div>
                  </div>

                  <div
                    className={`px-6 md:px-8 overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 pb-6 md:pb-8 opacity-100" : "max-h-0 opacity-0"}`}
                  >
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
