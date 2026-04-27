import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const { login } = useAuth()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (text.length === 6) setOtp(text.split(''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { toast.error('Enter the full 6-digit OTP'); return }
    setLoading(true)
    try {
      const res = await authApi.verifyOtp({ phone, otp: code })
      login({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, res.data.user)
      toast.success('Phone verified successfully!')
      navigate('/dashboard')
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
            <img src="/logo.png" alt="HudumaLynk" className="h-14 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter pt-4 font-ubuntu">Verify Phone</h1>
          <p className="text-slate-500 font-medium text-sm">
            Sent a 6-digit code to <span className="text-slate-900 font-bold hl-mono">{phone}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-10" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                  className="h-14 w-full text-center text-xl font-black rounded-xl border border-transparent bg-slate-50 focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Join Network'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Didn't receive the code?
            </p>
            <Link 
              to="/register" 
              className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Register
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Secure verification — &copy; {new Date().getFullYear()} hlynk
        </p>
      </div>
    </div>
  )
}
