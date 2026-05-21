import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function GoogleTermsConditions() {
  const updated = useMemo(
    () => new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
    [],
  )

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900">Google Terms (Sign-in)</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Last updated: {updated}</p>

        <button onClick={() => window.history.back()} className="absolute top-4 left-4">
          <ChevronLeft className="w-8 h-8 text-slate-900" />
        </button>

        <div className="mt-8 space-y-6 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Using Google Sign-In</h2>
            <p>
              If you sign in with Google, you agree that we will verify your Google credential and use the provided profile information to authenticate you and enable access to the Hlynk portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Google’s terms</h2>
            <p>
              Your use of Google sign-in is also subject to Google’s policies and terms.
            </p>
            <p className="mt-2">
              Review Google’s terms at:{' '}
              <a className="text-blue-600 underline" href="https://policies.google.com/terms" target="_blank" rel="noreferrer">https://policies.google.com/terms</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. What we do with your Google information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Read your Google email (used to find or create your Hlynk user account).</li>
              <li>Use your Google name and profile photo fields when present to complete onboarding and keep your stored photo up to date.</li>
              <li>Create a session and issue access/refresh tokens for your use of the portal.</li>
            </ul>
            <p className="mt-3">
              See our Privacy Policy and Google Privacy Notice for more details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Contact</h2>
            <p>
              Email: <span className="font-semibold">info@hlynk.co.ke</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}


