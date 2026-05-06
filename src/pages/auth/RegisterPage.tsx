import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Mail, MapPin, Phone, Tag, User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'
import { decodeGoogleCredential, type DecodedGoogleCredential } from '../../lib/google/identity'

const COUNTIES = [
  'Nairobi', 'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita/Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', "Murang'a", 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo/Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
]

const CATEGORIES = [
  'Retail Store', 'Barber & Salon', 'Cleaning Services', 'Plumbing', 'Electrical', 'Mechanic', 'Consultancy', 'Other',
]

type RegisterFormState = {
  businessName: string
  ownerName: string
  phone: string
  email: string
  category: string
  county: string
  location: string
  planName: 'STARTER'
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleCredential, setGoogleCredential] = useState('')
  const [googleProfile, setGoogleProfile] = useState<DecodedGoogleCredential | null>(null)
  const [formData, setFormData] = useState<RegisterFormState>({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    category: '',
    county: '',
    location: '',
    planName: 'STARTER',
  })

  useEffect(() => {
    if (user) navigate(user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true })
  }, [user, navigate])

  const finishLogin = (data: { accessToken: string; refreshToken: string; user: any }) => {
    login({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user)
    navigate(data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard', { replace: true })
  }

  const handleGoogleCredential = async (credential: string) => {
    setGoogleLoading(true)
    try {
      const decoded = decodeGoogleCredential(credential)
      setGoogleCredential(credential)
      setGoogleProfile(decoded)
      setFormData(current => ({ ...current, ownerName: decoded?.name || '', email: decoded?.email || '' }))
      toast.success('Google email verified. Finish setting up your business profile.')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.googleAuth({
        credential: googleCredential,
        registration: {
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          phone: formData.phone,
          category: formData.category,
          county: formData.county,
          location: formData.location,
          planName: formData.planName,
        },
      })
      toast.success('Business account created successfully!')
      finishLogin(res.data)
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const isBusy = loading || googleLoading
  const isGoogleVerified = Boolean(googleCredential && googleProfile)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[520px]">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Create your account</h1>
          <p className="mt-3 text-base font-medium text-sm leading-7 text-slate-500">
            Start with Google, then complete a few business details so your dashboard is ready from day one.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[15px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-7">
          {!isGoogleVerified ? (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Step 1 of 2</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Verify with Google</h2>
                <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                  We'll use your verified Google email for sign-in, then you'll finish the business profile on the next step.
                </p>
              </div>

              <GoogleAuthButton text="signup_with" disabled={isBusy} onCredential={handleGoogleCredential} />

              <div className="rounded-2xl bg-slate-50 px-4 py-4">
                <p className="text-xs font-medium leading-7 text-slate-500">
                  No password setup right now. Google keeps access simple while you focus on getting the business live.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700">Google verified</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{googleProfile?.email}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">Finish the business profile below to create your workspace.</p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Business Name" icon={Building2}>
                  <input
                    type="text"
                    placeholder="e.g. Westlands Salon"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Owner Name" icon={User}>
                  <input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={formData.ownerName}
                    onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Category" icon={Tag}>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="County" icon={MapPin}>
                  <select
                    value={formData.county}
                    onChange={e => setFormData({ ...formData, county: e.target.value })}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select County</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label="Phone Number" icon={Phone}>
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClassName}
                    required
                  />
                </Field>

                <Field label="Verified Email" icon={Mail}>
                  <input
                    type="email"
                    value={formData.email}
                    className={`${inputClassName} cursor-not-allowed bg-slate-100 text-slate-400`}
                    disabled
                  />
                </Field>

                <Field label="Location / Area" icon={MapPin} className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="e.g. Greenhouse Mall, 2nd Floor, Adams"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className={inputClassName}
                    required
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={isBusy}
                className="w-full rounded-2xl bg-[#0D4A3E] px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#0A3D33] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isBusy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {isBusy ? 'Creating workspace...' : 'Create Business Account'}
                </span>
              </button>
            </form>
          )}

          <div className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
            <span className="h-px flex-1 bg-slate-100" />
            <span>Already registered?</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[11px] shadow hover:bg-slate-100 bg-slate-50 px-5 py-4 text-sm font-black tracking-[0.2em] text-slate-700 transition-all hover:border-slate-300 "
          >
            Go to Sign In
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 text-center">
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            <a href="/terms-conditions" className="hover:text-emerald-600 transition-colors">Terms</a>
            <a href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy</a>
            <a href="/google/terms" className="hover:text-emerald-600 transition-colors">Google Terms</a>
            <a href="/google/privacy" className="hover:text-emerald-600 transition-colors">Google Privacy</a>
          </div>
        </div>
      </div>
    </div>
  )
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-emerald-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5'

function Field({
  label,
  icon: Icon,
  children,
  className = '',
}: {
  label: string
  icon: any
  children: any
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <Icon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
        <div className="[&>input]:pl-11 [&>select]:pl-11">
          {children}
        </div>
      </div>
    </div>
  )
}