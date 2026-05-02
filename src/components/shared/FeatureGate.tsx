import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { subscriptionsApi } from '../../lib/api/providers'
import { useAuth } from '../../lib/auth/AuthContext'
import { Lock, Zap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type Feature =
  | 'inventory_auto'
  | 'low_stock_alerts'
  | 'mpesa_stk'
  | 'customer_tracking'
  | 'staff_accounts'
  | 'advanced_reports'
  | 'audit_logs'

interface FeatureGateProps {
  feature: Feature
  children: React.ReactNode
  fallback?: React.ReactNode
  variant?: 'inline' | 'card' | 'overlay'
}

export const FEATURE_PLANS: Record<Feature, string[]> = {
  inventory_auto: ['GROWTH', 'PRO'],
  low_stock_alerts: ['GROWTH', 'PRO'],
  mpesa_stk: ['GROWTH', 'PRO'],
  customer_tracking: ['GROWTH', 'PRO'],
  staff_accounts: ['PRO'],
  advanced_reports: ['PRO'],
  audit_logs: ['PRO'],
}

export default function FeatureGate({ feature, children, fallback, variant = 'card' }: FeatureGateProps) {
  const { user } = useAuth()
  const { data: subResponse } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe,
    enabled: !!user && user.role !== 'SUPER_ADMIN'
  })

  // No feature specified means everyone has access
  if (!feature) return <>{children}</>

  // Super admins have all features
  if (user?.role === 'SUPER_ADMIN') return <>{children}</>

  const plan = subResponse?.data?.planName || 'STARTER'
  const featurePlans = FEATURE_PLANS[feature]

  if (!featurePlans) return <>{children}</> // Fallback safety

  const hasAccess = featurePlans.includes(plan)

  if (hasAccess) return <>{children}</>

  if (fallback) return <>{fallback}</>

  if (variant === 'inline') {
    return (
      <Link
        to="/dashboard/subscription"
        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 group cursor-pointer transition-all hover:bg-amber-100 hover:border-amber-200 active:scale-95"
      >
        <Zap size={12} className="text-amber-600 fill-amber-600 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
          {FEATURE_PLANS[feature][0]} PREVIEW
        </span>
        <ArrowRight size={10} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className="relative group">
        <div className="blur-[2px] pointer-events-none opacity-90">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-xl transition-all group-hover:bg-white/60">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg mb-3">
            <Zap size={20} fill="currentColor" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">Growth Plan Feature</p>
          <Link
            to="/dashboard/subscription"
            className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
          >
            Unlock Now <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group overflow-hidden rounded-[32px]">
      {/* The actual feature content, blurred - Peeking effect */}
      <div className="blur-[3px] pointer-events-none opacity-90 select-none scale-[0.99] transition-all duration-700">
        {children}
      </div>

      {/* Catchy Restriction Overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

        <div className="relative z-30 flex flex-col items-center">
          <div className="h-16 w-16 rounded-3xl bg-[#0D4A3E] text-white flex items-center justify-center shadow-2xl shadow-emerald-900/40 mb-6 group-hover:scale-110 transition-transform duration-500">
            <Zap size={28} fill="currentColor" className="animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full mb-4 border border-amber-200">
            <Lock size={12} className="fill-current" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{FEATURE_PLANS[feature][0]} ONLY</span>
          </div>

          <h4 className="text-lg font-black text-slate-900 mb-2 tracking-tight">Premium Business Tool</h4>
          <p className="text-[11px] text-slate-500 font-medium italic mb-8 max-w-[200px] leading-relaxed">
            Unleash the full power of your business portal with the {FEATURE_PLANS[feature][0]} toolkit.
          </p>

          <Link
            to="/dashboard/subscription"
            className="group/btn relative px-8 py-4 bg-white text-[#0D4A3E] border-2 border-[#0D4A3E] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0D4A3E] hover:text-white transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Upgrade to Unlock <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
