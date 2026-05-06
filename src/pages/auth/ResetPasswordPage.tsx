import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Lock, Phone, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { authApi } from '../../lib/api/auth'
import { getErrorMessage } from '../../lib/utils/error'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ phone: '', otp: '', newPassword: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.phone || !form.otp || !form.newPassword) return toast.error('Please fill in all fields')
    
    setLoading(true)
    try {
      await authApi.resetPassword(form)
      toast.success('Password reset! Please log in.')
      navigate('/login')
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img src="/logo.png" alt="hlynk" className="h-14 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter pt-4 font-ubuntu">Reset Password</h1>
          <p className="text-slate-500 font-medium text-sm">Enter the secure code sent to your phone</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 0712 345 678" 
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300 hl-mono" 
                />
              </div>
            </div>

            {/* OTP */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block w-full">6-Digit Reset Code</label>
              <div className="relative group">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="000000" 
                  value={form.otp}
                  onChange={e => setForm({ ...form, otp: e.target.value })}
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 px-4 text-center text-xl outline-none transition-all font-black tracking-[0.5em] placeholder:text-slate-200" 
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type={showPass ? 'text' : 'password'} 
                  placeholder="Min. 8 characters" 
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-12 text-sm outline-none transition-all font-bold placeholder:text-slate-300" 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Set New Password'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <Link 
            to="/login" 
            className="block text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
