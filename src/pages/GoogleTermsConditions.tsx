import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function GoogleTermsConditions() {
  const navigate = useNavigate()
  const updated = useMemo(() => new Date().toLocaleDateString(), [])

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black text-slate-900">Google Terms (Sign-in)</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">Last updated: {updated}</p>

        {/* back arrow */}
        <button onClick={() => window.history.back()} className="absolute top-4 left-4">
          <ChevronLeft className="w-8 h-8 text-slate-900" />
        </button>

        <div className="mt-8 space-y-6 text-slate-700 leading-7">
          <section>
            <h2 className="text-xl font-black text-slate-900">1. Using Google Sign-In</h2>
            <p>
              If you sign in with Google, you agree that we will use the information provided by Google to authenticate you and provide access to the hlynk portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Google’s terms</h2>
            <p>
              Your use of Google sign-in is also subject to Google’s policies and terms.
            </p>
            <p className="mt-2">
              You can review Google’s terms at: <a className="text-blue-600 underline" href="https://policies.google.com/terms" target="_blank" rel="noreferrer">https://policies.google.com/terms</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. Our use of data</h2>
            <p>
              We process limited profile data for account matching/creation and authentication. See our Privacy Policy and Google Privacy Notice for details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Contact</h2>
            <p>
              Email: <span className="font-semibold">info@hlynk.co.ke</span>
            </p>
          </section>

          <p className="text-sm text-slate-500">
            Note: This is a template for your convenience. Have a qualified professional review it for your jurisdiction.
          </p>
        </div>
      </div>
    </div>
  )
}

