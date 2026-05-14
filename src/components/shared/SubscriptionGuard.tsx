import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { subscriptionsApi } from '../../lib/api/providers'
import { Loader2, AlertCircle, CreditCard } from 'lucide-react'

export default function SubscriptionGuard({ children }: { children?: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth()
  const location = useLocation()

  const { data: subResponse, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe,
    enabled: !!user && user.role !== 'SUPER_ADMIN',
    retry: 1
  })

  // Priority 1: Use the subscription data already present in the AuthUser object
  // Priority 2: Use the data from the direct subscription API call
  const subscription = user?.subscription || subResponse?.data
  
  if (authLoading || (subLoading && !user?.subscription)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Verifying Subscription...</p>
        </div>
      </div>
    )
  }

  // Super Admins bypass everything
  if (user?.role === 'SUPER_ADMIN') return <>{children || <Outlet />}</>

  // Use the prioritized subscription object

  
  const now = new Date().getTime()
  const endDate = subscription?.endDate ? new Date(subscription.endDate).getTime() : null
  const trialEndDate = subscription?.trialEndDate ? new Date(subscription.trialEndDate).getTime() : null

  const isPastEndDate = endDate ? endDate < now : false
  const isPastGracePeriod = endDate ? (endDate + (24 * 60 * 60 * 1000)) < now : false

  const isTrial = subscription?.status === 'TRIAL'
  const isTrialExpired = trialEndDate ? trialEndDate < now : false

  // Account is completely locked if past grace period (or trial expired)
  const lockedOut = (subscription?.status === 'EXPIRED') || isPastGracePeriod || (isTrial && isTrialExpired)
  
  // They are in grace period if past end date but NOT past grace period
  const inGracePeriod = isPastEndDate && !isPastGracePeriod && !isTrial

  // If locked out and not already on the subscription page, redirect
  if (lockedOut && !location.pathname.includes('/dashboard/subscription')) {
    return <Navigate to="/dashboard/subscription" state={{ lockedOut: true }} replace />
  }

  // If no subscription at all (rare), redirect
  if (!subscription && !location.pathname.includes('/dashboard/subscription')) {
    return <Navigate to="/dashboard/subscription" replace />
  }

  return (
    <>
      {inGracePeriod && !location.pathname.includes('/dashboard/subscription') && (
        <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-3 relative z-50 animate-in slide-in-from-top-full shadow-md">
          <AlertCircle size={18} className="animate-pulse" />
          <p className="text-xs font-bold">
            GRACE PERIOD: Your subscription has expired. You have less than 24 hours to renew before your account is locked.
          </p>
          <a href="/dashboard/subscription" className="ml-4 px-3 py-1 bg-white text-red-600 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-red-50">
            Renew Now
          </a>
        </div>
      )}
      {children || <Outlet />}
    </>
  )
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
