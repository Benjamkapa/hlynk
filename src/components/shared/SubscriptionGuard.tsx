import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { subscriptionsApi } from '../../lib/api/providers'
import { Loader2, AlertCircle, CreditCard } from 'lucide-react'
import { ADMIN_CSS } from '../../pages/admin/hl-design-system'

export default function SubscriptionGuard({ children }: { children?: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const location = useLocation()

  const { data: subResponse, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe,
    enabled: !!user && user.role !== 'SUPER_ADMIN',
    retry: 1
  })

  if (authLoading || subLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <style>{ADMIN_CSS}</style>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Verifying Subscription...</p>
        </div>
      </div>
    )
  }

  // Super Admins bypass everything
  if (user?.role === 'SUPER_ADMIN') return <>{children || <Outlet />}</>

  const subscription = subResponse?.data
  const isExpired = subscription?.status === 'EXPIRED' || (subscription?.endDate && new Date(subscription.endDate) < new Date())
  const isTrial = subscription?.status === 'TRIAL'
  const isTrialExpired = subscription?.trialEndDate && new Date(subscription.trialEndDate) < new Date()

  const expired = isExpired || (isTrial && isTrialExpired)

  // If expired and not already on the subscription page, redirect
  if (expired && !location.pathname.includes('/dashboard/subscription')) {
    return <Navigate to="/dashboard/subscription" state={{ expired: true }} replace />
  }

  // If no subscription at all (rare), redirect
  if (!subscription && !location.pathname.includes('/dashboard/subscription')) {
    return <Navigate to="/dashboard/subscription" replace />
  }

  return <>{children || <Outlet />}</>
}

export function SubscriptionExpiredBanner({ expired }: { expired?: boolean }) {
  const location = useLocation()
  const isExpiredPage = location.pathname.includes('/dashboard/subscription')
  
  if (!isExpiredPage || !expired) return null

  return (
    <div className="mb-8 bg-red-50 border-2 border-red-100 p-6 rounded-2xl flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
      <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-sm">
        <AlertCircle size={24} />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-black text-red-900 leading-none mb-1">Access Restricted: Subscription Expired</h3>
        <p className="text-sm text-red-700 font-medium opacity-80">Your plan has expired. Please choose a package below to restore full access to your business portal.</p>
      </div>
      <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
        <CreditCard size={14} /> Action Required
      </div>
    </div>
  )
}
