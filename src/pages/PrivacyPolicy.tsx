import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const updated = useMemo(() => new Date().toLocaleDateString(), [])

  return (
    <div className="min-h-screen bg-white">
        {/* back arrow */}
        <button onClick={() => window.history.back()} className="absolute top-4 left-4">
          <ChevronLeft className="w-8 h-8 text-slate-900" />
        </button>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Last updated: {updated}</p>

        <div className="mt-8 space-y-6 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Who we are</h2>
            <p>
              HLynk (“we”, “us”, “our”) provides a portal that helps businesses manage services, sales, inventory, and subscriptions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. What data we collect</h2>
            <ul className="list-disc pl-6">
              <li>Account data (name, email, phone), and business profile details.</li>
              <li>Usage data (pages viewed, actions taken within the portal).</li>
              <li>Transaction data (sales, expenses, inventory-related data).</li>
              <li>Session data required for authentication (JWT refresh tokens / sessions).</li>
              <li>Support data when you contact us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. How we use your data</h2>
            <ul className="list-disc pl-6">
              <li>To provide and maintain the service.</li>
              <li>To authenticate users and protect access.</li>
              <li>To process payments and manage subscriptions.</li>
              <li>To generate reports and analytics.</li>
              <li>To send you important updates and respond to support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Legal basis</h2>
            <p>
              We process personal data based on your consent, the performance of a contract, legitimate interests, and other applicable legal grounds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Sharing and disclosure</h2>
            <p>
              We may share data with service providers (e.g., hosting, email/SMS providers, analytics, payment processors) only as needed to run the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">6. Data retention</h2>
            <p>
              We keep personal data only for as long as necessary for the purposes described in this policy, including to provide the service, comply with legal obligations, and resolve disputes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">7. Your rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data. To exercise your rights, contact us using the details on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">8. Contact</h2>
            <p>
              Email: <span className="font-semibold">info@hlynk.co.ke</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

