import { useState } from 'react'
import { Phone, Check, AlertCircle, Sparkles, User, Building2 } from 'lucide-react'
import { useAuth } from '../../lib/auth/AuthContext'
import { validateKenyanPhone } from '../../lib/validation/phone'
import { providersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { ButtonLoader } from './InlineLoader'

export default function CompletePhoneModal() {
  const { user, refreshUser, patchUser, isLoading } = useAuth()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState(user?.name || '')
  const [businessName, setBusinessName] = useState(user?.businessName || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Wait for auth to fully resolve — avoids false positives from stale localStorage cache
  // showing the modal to users who already have a complete profile
  if (!user || isLoading || user.role === 'SUPER_ADMIN') {
    return null
  }

  // Check if current phone is valid — only show for users genuinely missing data
  const currentPhoneCheck = validateKenyanPhone(user.phone || '')
  if (currentPhoneCheck.isValid && user.name?.trim()) {
    return null
  }

  const phoneCheck = validateKenyanPhone(phone)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanName = (name || user?.name || '').trim()
    if (!cleanName) {
      toast.error('Please enter your full name.')
      return
    }

    if (!phoneCheck.isValid) {
      toast.error(phoneCheck.error || 'Please enter a valid 10-digit Kenyan M-Pesa number (07xx or 01xx).')
      return
    }

    setIsSubmitting(true)
    try {
      await providersApi.updateProfile({
        name: cleanName,
        phone: phoneCheck.normalized,
        businessName: businessName.trim() || user?.businessName,
      })

      patchUser({
        name: cleanName,
        phone: phoneCheck.normalized,
        businessName: businessName.trim() || user?.businessName,
      })

      await refreshUser()
      toast.success('Profile complete! Your shop is ready.')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6">
        {/* Header Badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <Phone size={24} />
          </div>
          <div>
            {/* <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <Sparkles size={13} /> Complete Info
            </div> */}
            <h2 className="text-xl font-bold text-slate-900 leading-tight">Phone Number Required</h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-light">
          To get started and operate your shop on hlynk, a valid phone number is required for transaction prompts, automated receipts, and instant payout settlements.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!user.name?.trim() && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">Your Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 text-sm font-medium transition-all"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
            </div>
          )}

          {!user.businessName?.trim() && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 ml-1">Biashara / Shop Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 text-sm font-medium transition-all"
                  placeholder="e.g. Quick Mart"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 ml-1">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={e => {
                  const cleaned = e.target.value.replace(/[^\d\s\+]/g, '')
                  setPhone(cleaned)
                }}
                className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl outline-none focus:bg-white text-sm font-medium transition-all ${
                  phone
                    ? phoneCheck.isValid
                      ? 'border-emerald-500 focus:border-emerald-600'
                      : 'border-amber-400 focus:border-amber-500'
                    : 'border-slate-200 focus:border-emerald-600'
                }`}
                placeholder="0712 345 678"
                maxLength={14}
                required
                autoFocus
              />
            </div>
            {phone ? (
              <div className="flex items-center gap-1.5 px-1 text-[11px] transition-all">
                {phoneCheck.isValid ? (
                  <span className="text-emerald-600 flex items-center gap-1 font-medium">
                    <Check size={12} className="stroke-[3]" /> Valid phone number
                    {/* <Check size={12} className="stroke-[3]" /> Valid phone number ({phoneCheck.normalized}) */}
                  </span>
                ) : (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle size={12} /> 
                    {/* <AlertCircle size={12} /> {phoneCheck.error} */}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] px-1 text-slate-400">
                Enter a 10-digit Kenyan mobile number (e.g. 0712 345 678 or 0110 123 456)
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !phoneCheck.isValid}
            className="w-full h-12 mt-2 bg-[#0D4A3E] text-white rounded-xl font-semibold text-sm hover:bg-[#0A3D33] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? <ButtonLoader size={18} /> : 'Complete Profile & Get Started'}
          </button>
        </form>
      </div>
    </div>
  )
}
