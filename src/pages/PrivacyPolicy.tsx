import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
  const updated = useMemo(() => new Date().toLocaleDateString(), [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <button onClick={() => window.history.back()} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-widest">
          <ChevronLeft className="w-5 h-5" /> Back to App
        </button>
        
        <div className="bg-white p-10 md:p-16 rounded-[.5rem] shadow-xl shadow-slate-900/5 border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Privacy Policy</h1>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-12">Last updated: {updated}</p>

          <div className="space-y-12 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">1. Introduction</h2>
              <p>
                At Hlynk ("we", "us", or "our"), we respect your privacy and are committed to protecting the personal and business data you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our business operations platform ("the Service").
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">2. Information We Collect</h2>
              <p className="mb-4">We collect information that you voluntarily provide to us when you register on the Service, express an interest in obtaining information about us or our products, or otherwise when you contact us.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Data:</strong> Name, email address, phone number, and password (hashed).</li>
                <li><strong>Business Profile Data:</strong> Business name, location, county, category, and staff details.</li>
                <li><strong>Financial & Transaction Data:</strong> Sales records, expenses, inventory data, and M-Pesa transaction metadata (e.g., phone numbers and amounts). Note: We do not store M-Pesa PINs.</li>
                <li><strong>Automated Usage Data:</strong> IP addresses, browser types, session tokens, and interactions with the platform analytics.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the personal information collected via our Service for a variety of business purposes described below:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>To facilitate account creation and logon processes securely.</li>
                <li>To provide, operate, and maintain our Point of Sale and Inventory management systems.</li>
                <li>To process M-Pesa STK push payments, subscriptions, and issue receipts.</li>
                <li>To generate business intelligence, charts, and forensic audit logs for your administrative dashboards.</li>
                <li>To send administrative information, security alerts, and technical notices.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">4. Sharing Your Information</h2>
              <p className="mb-4">We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Providers:</strong> We may share data with third-party vendors (such as cloud hosting providers and Safaricom's Daraja API) necessary to facilitate our services.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, or legal processes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">5. Data Retention and Security</h2>
              <p className="mb-4">
                We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or forensic audit requirements).
              </p>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">6. Your Data Rights</h2>
              <p className="mb-4">
                Depending on your geographic location and local privacy laws, you may have the right to request access to the personal information we collect from you, change that information, or delete it in some circumstances.
              </p>
              <p>
                To request to review, update, or delete your personal information, please submit a request form by contacting our support team.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">7. Updates to This Policy</h2>
              <p>
                We may update this privacy notice from time to time. The updated version will be indicated by an updated "Last updated" date and the updated version will be effective as soon as it is accessible. We encourage you to review this privacy notice frequently.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900 mb-4">8. Contact Us</h2>
              <p>
                If you have questions or comments about this notice, you may email us at:
                <br /><br />
                <strong>Email (Information):</strong> <a href="mailto:info@hlynk.co.ke">info@hlynk.co.ke</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

