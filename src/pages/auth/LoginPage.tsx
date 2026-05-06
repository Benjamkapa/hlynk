import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '../../lib/api/auth'
import { useAuth } from '../../lib/auth/AuthContext'
import { getErrorMessage } from '../../lib/utils/error'
import GoogleAuthButton from '../../components/auth/GoogleAuthButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [googleLoading, setGoogleLoading] = useState(false)

  const completeLogin = (data: { accessToken: string; refreshToken: string; user: any }) => {
    login({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user)
    navigate(data.user.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard')
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[460px]">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Sign in</h1>
          <p className="mt-3 text-base text-sm font-medium leading-7 text-slate-500">
            Use your Google account to access your workspace securely. No passwords, just a clean return to work.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[11px] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 sm:p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Secure access</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Continue with Google</h2>
          <p className="mt-2 mb-6 text-sm font-medium leading-7 text-slate-500">
            Your account, permissions and business workspace will open automatically after sign-in.
          </p>

          <GoogleAuthButton text="signin_with" disabled={googleLoading} onCredential={handleGoogleAuth} />

          <div className="mt-8 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-300">
            <span className="h-px flex-1 bg-slate-100" />
            <span>New here?</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>

          <Link
            to="/register"
            className="mt-6 inline-flex w-full items-center text-sm font-semibold justify-center gap-2 rounded-md shadow hover:bg-slate-100 bg-slate-50 px-5 py-4 font-black tracking-[0.2em] text-slate-700 transition-all hover:border-slate-300"
          >
            Create Business Account
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="fixed bottom-0.5 left-0 right-0 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
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
