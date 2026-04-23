import { useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'

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
      toast.success('Phone verified! Welcome to hlynk 🎉')
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <img src="/logo.png" alt="hlynk logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
          </Link>
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-ubuntu">Verify your phone</h1>
          <p className="text-muted-foreground text-sm mt-2">
            We sent a 6-digit code to <span className="font-medium text-foreground">{phone}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-sm border border-border">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                  className="h-13 w-11 text-center text-xl font-bold rounded-xl border-2 border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-background"
                  style={{ height: '52px' }}
                />
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-60 transition-all">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Verifying…' : 'Verify & Continue'}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Didn't receive it? Check your SMS inbox or{' '}
            <Link to="/register" className="text-primary hover:underline">go back</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
