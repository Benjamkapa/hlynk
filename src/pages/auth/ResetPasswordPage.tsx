import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Lock, Phone, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '../../lib/api/auth'

type FormData = { phone: string; otp: string; newPassword: string }

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.resetPassword(data)
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset code')
    }
  }

  const inputCls = 'w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logo.png" alt="hlynk logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter the code sent to your phone</p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input {...register('phone', { required: true })} type="tel" placeholder="0712 345 678" className={inputCls} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Reset Code (6 digits)</label>
              <input {...register('otp', { required: true, minLength: 6 })} placeholder="123456" inputMode="numeric"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors tracking-widest text-center text-lg font-bold" />
              {errors.otp && <p className="text-destructive text-xs mt-1">Enter the 6-digit code</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input {...register('newPassword', { required: true, minLength: 8 })} type={showPass ? 'text' : 'password'} placeholder="Min 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-destructive text-xs mt-1">Password must be at least 8 characters</p>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isSubmitting ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </div>
        <Link to="/login" className="block text-center mt-5 text-sm text-muted-foreground hover:text-foreground">Back to Login</Link>
      </div>
    </div>
  )
}
