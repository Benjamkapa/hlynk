import React from 'react'
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
  variant?: 'inline' | 'card' | 'overlay' | 'tease'
}

export const FEATURE_PLANS: Record<Feature, string[]> = {
  inventory_auto: ['PLUS', 'MAX'],
  low_stock_alerts: ['PLUS', 'MAX'],
  mpesa_stk: ['PLUS', 'MAX'],
  customer_tracking: ['PLUS', 'MAX'],
  staff_accounts: ['PLUS', 'MAX'],
  advanced_reports: ['PLUS', 'MAX'],
  audit_logs: ['MAX'],
}

export default function FeatureGate({ feature, children, fallback, variant = 'card' }: FeatureGateProps) {
  const { user, isLoading } = useAuth()
  
  // Wait for auth to resolve before showing any gates
  if (isLoading) return null;

  if (!feature) return <>{children}</>
  if (user?.role === 'SUPER_ADMIN') return <>{children}</>

  const getPlanName = (p: string) => p === 'MAX' ? 'Business Pro' : p === 'PLUS' ? 'Growth' : 'Starter';

  const planRaw = user?.subscription?.planName || 'LITE'
  const plan = planRaw.toUpperCase()
  const isTrial = Number(user?.subscription?.status) === 2 || user?.subscription?.status === 'TRIAL'
  const featurePlans = FEATURE_PLANS[feature]

  if (!featurePlans) return <>{children}</>

  // Hlynk Hierarchy: MAX > PLUS > LITE
  const getPlanWeight = (p: string) => {
    if (p.includes('MAX')) return 3
    if (p.includes('PLUS')) return 2
    return 1
  }

  const userWeight = getPlanWeight(plan)
  const requiredWeight = Math.min(...featurePlans.map(getPlanWeight))

  let hasAccess = userWeight >= requiredWeight

  // STAFF PRIVACY & UNLOCK: Staff see everything allowed to them WITHOUT plan limits
  if (user?.role === 'STAFF') hasAccess = true

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
          {getPlanName(FEATURE_PLANS[feature][0])} PREVIEW
        </span>
        <ArrowRight size={10} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
      </Link>
    )
  }

  if (variant === 'tease') {
    return (
      <div className="relative group cursor-pointer">
        <Link to="/dashboard/subscription" className="absolute inset-0 z-20" />
        <div className="hl-feature-tease-content grayscale-[0.4] opacity-90 transition-all group-hover:grayscale-0 group-hover:opacity-100">
          {children}
        </div>
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-slate-900/90 text-white h-7 w-7 rounded-full border border-white/20 shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Lock size={12} className="text-emerald-400" />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className="relative group overflow-hidden rounded-2xl">
        <div className="blur-[3px] pointer-events-none opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px] transition-all group-hover:bg-white/40">
          <Link to="/dashboard/subscription" className="flex flex-col items-center gap-2 px-6 py-3 bg-white/90 rounded-2xl shadow-2xl shadow-black/5 border border-white hover:scale-105 transition-all">
            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Lock size={18} className="text-emerald-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Unlock {getPlanName(FEATURE_PLANS[feature][0])} Feature</p>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group overflow-hidden rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 bg-white">
      <div className="blur-[12px] pointer-events-none opacity-30 select-none scale-[1.05] transition-all duration-1000 grayscale group-hover:grayscale-0">
        {children}
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-emerald-50/50 backdrop-blur-[4px]" />

        {/* Dynamic Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="relative z-30 flex flex-col items-center max-w-sm">
          <div className="h-24 w-24 rounded-[32px] bg-slate-900 text-white flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            <Zap size={40} fill="currentColor" className="text-emerald-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 text-white rounded-full mb-8 border border-white/10 shadow-2xl">
            <Lock size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">{getPlanName(FEATURE_PLANS[feature][0])} EDITION</span>
          </div>

          <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">Premium Business Utility</h4>
          <p className="text-sm text-slate-500 font-medium mb-12 leading-relaxed opacity-80">
            This advanced tool is reserved for <span className="text-slate-900 font-black">{getPlanName(FEATURE_PLANS[feature][0])}</span> subscribers. Upgrade now to activate full operational control.
          </p>

          <Link
            to="/dashboard/subscription"
            className="group/btn relative h-16 w-full bg-[#0D4A3E] text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-4">
              Unlock {getPlanName(FEATURE_PLANS[feature][0])} Package <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
          </Link>

          <div className="mt-8 flex items-center gap-4 opacity-40">
            <div className="h-[1px] w-8 bg-slate-400" />
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Instant 1-Click Upgrade</p>
            <div className="h-[1px] w-8 bg-slate-400" />
          </div>
        </div>
      </div>
    </div>
  )
}
