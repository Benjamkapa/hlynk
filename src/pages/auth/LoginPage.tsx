import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Lock, Phone, ArrowRight } from 'lucide-react'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'


export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const completeLogin = (data: { accessToken: string; refreshToken: string; user: any }) => {
    login({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    }, data.user)

    if (data.user.role === 'SUPER_ADMIN') {
      navigate('/admin')
      return
    }

    navigate('/dashboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.identifier || !form.password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login(form)
      completeLogin(res.data)
      toast.success('Welcome back!')
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async (credential: string) => {
    setGoogleLoading(true)
    try {
      const res = await authApi.googleAuth({ credential })
      completeLogin(res.data)
      toast.success('Welcome back!')
    } catch (err: any) {
      toast.error(getErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  const isBusy = loading || googleLoading

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px] space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block transition-transform hover:scale-105 active:scale-95">
            <img src="/logo.png" alt="HudumaLynk" className="h-14 w-auto mx-auto" />
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter pt-4 font-ubuntu">Welcome Back</h1>
          <p className="text-slate-500 font-medium text-sm">Securely access your business dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone or Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                   <Phone size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. 0712 345 678 or user@email.com" 
                  value={form.identifier}
                  onChange={e => setForm({ ...form, identifier: e.target.value })}
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 rounded-xl py-4 pl-12 pr-4 text-sm outline-none transition-all font-bold placeholder:text-slate-300" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isBusy}
              className="w-full py-5 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#064E3B] transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isBusy ? <Loader2 size={16} className="animate-spin" /> : 'Sign In To Account'}
              {!isBusy && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-300">Or continue with</span>
            </div>
          </div>

          <GoogleAuthButton text="signin_with" disabled={isBusy} onCredential={handleGoogleAuth} />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-white px-4 text-slate-300">New to the platform?</span>
            </div>
          </div>

          <Link 
            to="/register" 
            className="w-full py-4 border-2 border-slate-50 text-slate-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            Create Business Account
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-[13px] font-thin text-slate-900 tracking-widest">
          Secure encryption enabled — &copy; {new Date().getFullYear()} hlynk
        </p>
      </div>
    </div>
  )
}
