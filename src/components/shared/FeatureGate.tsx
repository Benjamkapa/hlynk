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
  | 'ai_analyst'

  | 'tease'

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
  staff_accounts: ['MAX'],
  advanced_reports: ['MAX'],
  audit_logs: ['MAX'],
  ai_analyst: ['MAX'],
}

export default function FeatureGate({ feature, children, fallback, variant = 'card' }: FeatureGateProps) {
  const { user } = useAuth()

  if (!feature) return <>{children}</>

  if (user?.role === 'SUPER_ADMIN') return <>{children}</>

  const plan = user?.subscription?.planName || 'LITE'
  const isTrial = user?.subscription?.status === 'TRIAL'
  const featurePlans = FEATURE_PLANS[feature]

  if (!featurePlans) return <>{children}</>

  let hasAccess = featurePlans.includes(plan)

  // CRITICAL: Grant full access to everything during the Trial period 
  // to let users experience the full value of the platform.
  if (isTrial) hasAccess = true

  if (feature === 'ai_analyst') {
    if (plan === 'MAX' || isTrial) hasAccess = true
    else hasAccess = false
  }

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

  if (variant === 'tease') {
    return (
      <div className="relative group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
        <Link to="/dashboard/subscription" className="absolute inset-0 z-20" />
        <div className="blur-[8px] grayscale-[0.8] pointer-events-none opacity-40 select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4">
           <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-full border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform flex items-center gap-2">
             <Lock size={12} className="text-emerald-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.2em]">{FEATURE_PLANS[feature][0]}</span>
           </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
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
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Unlock {FEATURE_PLANS[feature][0]} Feature</p>
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
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">{FEATURE_PLANS[feature][0]} EDITION</span>
          </div>

          <h4 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">Limited Utility Visibility</h4>
          <p className="text-sm text-slate-500 font-medium mb-12 leading-relaxed opacity-80">
            This professional tool is reserved for <span className="text-slate-900 font-black">{FEATURE_PLANS[feature][0]}</span> subscribers. Upgrade now to activate full business control.
          </p>

          <Link
            to="/dashboard/subscription"
            className="group/btn relative h-16 w-full bg-[#0D4A3E] text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-900/30 flex items-center justify-center overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-4">
              Unlock Premium Package <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
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
