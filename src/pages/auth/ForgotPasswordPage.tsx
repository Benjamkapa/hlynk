import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Phone, Loader2, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react'
import { authApi } from '../../lib/api/auth'
import { getErrorMessage } from '../../lib/utils/error'

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) return toast.error('Please enter your phone number')
    
    setLoading(true)
    try {
      await authApi.forgotPassword({ phone })
      setSent(true)
      toast.success('Reset code sent!')
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500 text-center">
        <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-xl shadow-emerald-900/5">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter font-ubuntu">Check your SMS</h2>
          <p className="text-slate-500 font-medium text-sm">
            We've sent a reset code to <span className="text-slate-900 font-bold hl-mono">{phone}</span>
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 space-y-4">
          <Link
            to="/reset-password"
            className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2"
          >
            Enter Reset Code <ArrowRight size={16} />
          </Link>
          <Link
            to="/login"
            className="block text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            Back to Sign In
          </Link>

          <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <a href="/terms-conditions" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="/google/terms" className="hover:text-emerald-600 transition-colors">Google Terms</a>
              <a href="/google/privacy" className="hover:text-emerald-600 transition-colors">Google Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">


      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img src="/logo.png" alt="hynk" className="h-14 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter pt-4 font-ubuntu">Forgot Password?</h1>
          <p className="text-slate-500 font-medium text-sm">We'll send a recovery code to your phone</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g. 0712 345 678" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300 hl-mono" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Code'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <Link 
            to="/login" 
            className="flex items-center justify-center gap-2 mt-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </Link>

          <div className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <a href="/terms-conditions" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="/privacy-policy" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="/google/terms" className="hover:text-emerald-600 transition-colors">Google Terms</a>
              <a href="/google/privacy" className="hover:text-emerald-600 transition-colors">Google Privacy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

