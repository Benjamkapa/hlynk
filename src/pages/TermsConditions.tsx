import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TermsConditions() {
  const updated = useMemo(() => new Date().toLocaleDateString(), [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button onClick={() => window.history.back()} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest">
          <ChevronLeft className="w-5 h-5" /> Back to App
        </button>
        
        <div className="bg-white p-10 md:p-16 rounded-[.5rem] shadow-xl shadow-slate-900/5 border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Terms of Service</h1>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-12">Last updated: {updated}</p>

          <div className="space-y-12 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Hlynk platform ("the Service," "we," "our," or "us"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the Service. Hlynk is a business intelligence and point-of-sale platform designed to streamline retail operations, expense management, and M-Pesa transaction auditing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">2. Account Registration and Security</h2>
              <p className="mb-4">
                To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are responsible for safeguarding the password that you use to access the Service.</li>
                <li>You agree not to disclose your password to any third party.</li>
                <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
                <li>You are solely responsible for all activities that occur under your account, including actions taken by staff members you authorize.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">3. Subscriptions, Payments, and M-Pesa Integration</h2>
              <p className="mb-4">
                Hlynk offers tiered subscription plans (Starter, Growth, and Business Pro). By subscribing, you agree to pay all applicable fees associated with your chosen plan.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Billing:</strong> Subscriptions are billed on a recurring monthly basis. All payments are non-refundable unless otherwise required by law.</li>
                <li><strong>Free Trials:</strong> We may offer a free trial period. If you do not cancel before the trial expires, you will be billed according to your selected plan.</li>
                <li><strong>M-Pesa Integration:</strong> The Service integrates with Safaricom's M-Pesa APIs for payment processing and STK Push features. We are not responsible for downtimes, API failures, or transaction errors originating from Safaricom's network.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">4. Acceptable Use Policy</h2>
              <p className="mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process illegal or unauthorized transactions.</li>
                <li>Attempt to bypass, exploit, or disrupt the Service's security measures, including M-Pesa callback webhooks and rate limits.</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the platform.</li>
                <li>Sell, resell, or lease the Service to third parties without explicit authorization.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">5. Data Ownership and Privacy</h2>
              <p>
                You retain all rights to the business data, customer records, and inventory information you upload to Hlynk. By using the Service, you grant us a license to host, store, and process this data to provide and improve the platform. Our use of your personal and business data is governed by our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">6. Intellectual Property</h2>
              <p>
                The Service, including its original content, features, source code, and functionality, is owned by Hlynk and is protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">7. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of these Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">8. Limitation of Liability</h2>
              <p>
                In no event shall Hlynk, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">10. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
                <br /><br />
                <strong>Email (Legal):</strong> <a href="mailto:benjamin@hlynk.co.ke">benjamin@hlynk.co.ke</a><br />
                <strong>Email (Information):</strong> <a href="mailto:info@hlynk.co.ke">info@hlynk.co.ke</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

