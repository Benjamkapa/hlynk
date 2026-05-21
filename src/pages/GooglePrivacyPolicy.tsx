import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'

export default function GooglePrivacyPolicy() {
  const updated = useMemo(
    () => new Date().toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }),
    [],
  )

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
              This notice explains what we do with the information you provide through Google sign-in on the Hlynk portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">2. Data we may receive from Google</h2>
            <p className="mb-3">
              Our backend verifies your Google credential and may read these fields (when present):
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Email</strong> (used to find or create your Hlynk user account).</li>
              <li><strong>Name</strong> (used for account onboarding fields).</li>
              <li><strong>Profile photo</strong> (used to store/update the profile photo in your account).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">3. How we use it</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Authenticate your sign-in attempt.</li>
              <li>Create a new tenant/business and associated provider record for first-time Google sign-ins.</li>
              <li>Issue session tokens so you can access the portal.</li>
              <li>Optionally sync/update your stored profile photo when Google provides a different photo.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900">4. Google’s role</h2>
            <p className="mb-2">
              Google is the identity provider for this sign-in method. Our use of Google-provided information is limited to enabling authentication and onboarding in our portal.
            </p>
            <p>
              Review Google’s privacy information here:{' '}
              <a
                className="text-blue-600 underline"
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                https://policies.google.com/privacy
              </a>
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


