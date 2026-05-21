import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  const updated = useMemo(() => new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }), [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button
          onClick={() => window.history.back()}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5" /> Back to App
        </button>

        <div className="bg-white p-10 md:p-16 rounded-[.5rem] shadow-xl shadow-slate-900/5 border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">Last updated: {updated}</p>
          <p className="text-sm text-slate-500 mb-12">This policy applies to all users of the Hlynk platform, including business owners, their staff, and end customers whose data is processed through the platform.</p>

          <div className="space-y-12 text-slate-600 leading-relaxed">

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">1. Who We Are</h2>
              <p className="mb-3">
                Hlynk is a business management and point-of-sale platform operated in Kenya. The platform is currently run as a sole proprietorship and is in the process of formal registration. References to "Hlynk", "we", "us", or "our" in this policy refer to the operator of the platform accessible at <strong>www.hlynk.co.ke</strong>.
              </p>
              <p>
                We take data privacy seriously. This policy is written to comply with the <strong>Kenya Data Protection Act, 2019 (DPA 2019)</strong> and the regulations made under it. If you have any questions about how we handle your data, please contact us directly before using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">2. What Data We Collect and Why</h2>
              <p className="mb-4">We only collect data that is reasonably necessary to provide the Service. Below is a breakdown of what we collect, from whom, and for what purpose.</p>

              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">2.1 Business Account Holders</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Registration details:</strong> Full name, email address, phone number, and a hashed (encrypted) password.</li>
                    <li><strong>Business profile:</strong> Business name, physical location, county, business category, and any staff members you add to your account.</li>
                    <li><strong>Financial records:</strong> Sales transactions, stock movements, expense entries, and profit data that you record using the platform.</li>
                    <li><strong>M-Pesa transaction metadata:</strong> Phone numbers and amounts involved in M-Pesa STK Push payments processed through the platform. We do not store M-Pesa PINs at any point.</li>
                    <li><strong>Technical usage data:</strong> IP addresses, browser type, session tokens, and platform interaction logs. This is used to maintain security and improve performance.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 mb-2">2.2 End Customers (Buyers at Hlynk-powered businesses)</h3>
                  <p className="mb-2">
                    If you are a customer of a business that uses Hlynk, the business may record your name, phone number, and purchase history within their Hlynk account. This data is entered by the business, not collected directly by Hlynk.
                  </p>
                  <p>
                    We process this data on behalf of the business as a <strong>data processor</strong> under the DPA 2019. The business (our client) is the <strong>data controller</strong> responsible for obtaining your consent where required. If you have concerns about how a specific business has recorded your information, please raise them directly with that business.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">3. How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To create and manage your Hlynk account securely.</li>
                <li>To operate the platform's core features: point of sale, inventory management, expense tracking, and reporting dashboards.</li>
                <li>To process subscription payments and M-Pesa STK Push transactions.</li>
                <li>To generate audit logs and business intelligence reports that you can access from your dashboard.</li>
                <li>To send you important service notifications, security alerts, and updates about the platform.</li>
                <li>To investigate disputes, fraud, or misuse of the platform.</li>
              </ul>
              <p className="mt-4">We do not use your data for advertising, and we do not sell your data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">4. Who We Share Data With</h2>
              <p className="mb-4">We share data only where necessary and only with parties bound by appropriate obligations:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cloud infrastructure providers:</strong> Hlynk's data is hosted on servers located in Kenya. Any hosting provider we use is required to maintain appropriate security standards.</li>
                <li><strong>Safaricom (Daraja API):</strong> M-Pesa payment processing requires us to pass transaction data to Safaricom's API. This is governed by Safaricom's own terms and data policies.</li>
                <li><strong>Legal and regulatory authorities:</strong> We may disclose data if required by Kenyan law, a court order, or a lawful request from a government authority.</li>
              </ul>
              <p className="mt-4">We do not transfer your data outside Kenya except where strictly required (for example, if a third-party service operates internationally). In such cases, we take steps to ensure adequate protection is in place.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">5. How Long We Keep Your Data</h2>
              <p className="mb-3">
                We retain your account and transaction data for as long as your account is active. If you cancel your subscription or request deletion, we will remove your data within <strong>30 days</strong>, except where we are required to retain it longer by law — for example, financial transaction records that may be subject to tax or audit requirements under Kenyan law.
              </p>
              <p>
                Anonymised, aggregated data (such as overall platform usage statistics that cannot identify any individual) may be retained indefinitely for platform improvement purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">6. How We Protect Your Data</h2>
              <p className="mb-3">
                We implement technical and organisational measures to protect your data, including password hashing, encrypted data transmission (HTTPS), access controls that limit who within our team can access your data, and session security measures.
              </p>
              <p>
                No system connected to the internet can be guaranteed as completely secure. We encourage you to use a strong, unique password for your Hlynk account and to notify us immediately at <a href="mailto:info@hlynk.co.ke" className="text-emerald-600 underline">info@hlynk.co.ke</a> if you suspect any unauthorised access.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">7. Your Rights Under Kenyan Law</h2>
              <p className="mb-4">Under the Kenya Data Protection Act 2019, you have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Right to access:</strong> You can request a copy of the personal data we hold about you.</li>
                <li><strong>Right to correction:</strong> You can ask us to correct inaccurate or incomplete data.</li>
                <li><strong>Right to deletion:</strong> You can ask us to delete your personal data, subject to any legal retention requirements.</li>
                <li><strong>Right to object:</strong> You can object to certain types of processing, such as where processing is not strictly necessary for the Service.</li>
                <li><strong>Right to data portability:</strong> You can request your data in a portable format.</li>
              </ul>
              <p className="mt-4">To exercise any of these rights, email us at <a href="mailto:info@hlynk.co.ke" className="text-emerald-600 underline">info@hlynk.co.ke</a>. We will respond within <strong>21 days</strong> as required under the DPA 2019.</p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">8. Cookies and Tracking</h2>
              <p>
                Hlynk uses session cookies strictly to keep you logged in and to maintain platform security. We do not use advertising cookies or third-party tracking technologies. You can disable cookies in your browser, but doing so will prevent you from logging in to the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this policy as the platform evolves or as legal requirements change. When we make material changes, we will notify active users by email or via an in-app notice at least <strong>14 days</strong> before the changes take effect. The "Last updated" date at the top of this page will always reflect the most recent version.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">10. Contact Us</h2>
              <p className="mb-3">If you have any questions, concerns, or requests relating to this Privacy Policy or how we handle your data, please contact us:</p>
              <p>
                <strong>Email:</strong> <a href="mailto:info@hlynk.co.ke" className="text-emerald-600 underline">info@hlynk.co.ke</a><br />
                <strong>Platform:</strong> www.hlynk.co.ke
              </p>
              <p className="mt-4 text-sm text-slate-500">
                If you believe your data rights have been violated and we have not resolved your concern, you may lodge a complaint with the <strong>Office of the Data Protection Commissioner (ODPC)</strong> of Kenya at <a href="https://www.odpc.go.ke" className="text-emerald-600 underline" target="_blank" rel="noreferrer">www.odpc.go.ke</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}