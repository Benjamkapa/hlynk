import { useMemo } from 'react'

export default function TermsConditions() {
  const updated = useMemo(() => new Date().toLocaleDateString(), [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900">Terms & Conditions</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Last updated: {updated}</p>

        <div className="mt-8 space-y-6 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Agreement</h2>
            <p>
              By using hlynk (“the Service”), you agree to these Terms & Conditions. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Eligibility</h2>
            <p>
              You must be able to enter into a binding agreement and be authorized to use the Service for your business.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Accounts and security</h2>
            <ul className="list-disc pl-6">
              <li>You are responsible for maintaining the confidentiality of your credentials.</li>
              <li>You agree to notify us of any unauthorized access or security issues.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Subscriptions and payments</h2>
            <p>
              Some features may require an active subscription. Prices and billing terms are provided at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Acceptable use</h2>
            <p>
              You agree not to misuse the Service, attempt unauthorized access, or interfere with the Service’s operation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">6. Intellectual property</h2>
            <p>
              The Service and its content are owned by us or our licensors and are protected by applicable intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">7. Disclaimers</h2>
            <p>
              The Service is provided “as is” and “as available”. We do not guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">9. Changes</h2>
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">10. Contact</h2>
            <p>
              Email: <span className="font-semibold">info@hlynk.co.ke</span>
            </p>
          </section>

          <p className="text-sm text-slate-500">
            Note: This is a template for your convenience. You should have a qualified professional review for your jurisdiction and business model.
          </p>
        </div>
      </div>
    </div>
  )
}

