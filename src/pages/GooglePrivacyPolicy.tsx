import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GooglePrivacyPolicy() {
  const navigate = useNavigate()
  const updated = useMemo(() => new Date().toLocaleDateString(), [])

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* back arrow */}
        <button onClick={() => window.history.back()} className="absolute top-4 left-4">
          <ChevronLeft className="w-8 h-8 text-slate-900" />
        </button>
        <h1 className="text-3xl font-black text-slate-900">Google Privacy Notice</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Last updated: {updated}</p>

        <div className="mt-8 space-y-6 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. What this notice covers</h2>
            <p>
              When you sign in with Google on the hynk portal, we process limited profile information provided by Google for authentication and account creation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Data we may receive</h2>
            <ul className="list-disc pl-6">
              <li>Your Google account email (and related account details provided by Google sign-in).</li>
              <li>Basic profile information such as name and profile photo when available.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Why we process it</h2>
            <p>
              We use Google sign-in data to verify your identity, create or match your user account, and enable access to the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Google’s role</h2>
            <p>
              Google provides the authentication service. Our use of any data from Google is governed by this notice and our Privacy Policy.
            </p>
            <p className="mt-2">
              You can review Google’s policies at: <a className="text-blue-600 underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">https://policies.google.com/privacy</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">5. Contact</h2>
            <p>
              Email: <span className="font-semibold">info@hlynk.co.ke</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

