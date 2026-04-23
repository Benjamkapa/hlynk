import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Phone, Loader2, ArrowLeft } from 'lucide-react'
import { authApi } from '../../lib/api/auth'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<{ phone: string }>()

  const onSubmit = async (data: { phone: string }) => {
    try {
      await authApi.forgotPassword(data)
    } catch { /* always show success */ }
  }

  if (isSubmitSuccessful) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Phone size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Check your SMS</h2>
        <p className="text-muted-foreground text-sm mb-6">If that number is registered, a reset code has been sent.</p>
        <Link to="/reset-password" className="block w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm text-center hover:bg-primary/90 transition-all">
          Enter Reset Code
        </Link>
        <Link to="/login" className="block mt-3 text-sm text-muted-foreground hover:text-foreground">Back to Login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logo.png" alt="hlynk logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
          <p className="text-muted-foreground text-sm mt-1">We'll send a reset code to your phone</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input {...register('phone', { required: 'Phone is required' })} type="tel" placeholder="0712 345 678"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
              </div>
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Sending…' : 'Send Reset Code'}
            </button>
          </form>
        </div>

        <Link to="/login" className="flex items-center justify-center gap-1 mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  )
}
