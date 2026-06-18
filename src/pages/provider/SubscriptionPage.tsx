import { useState, useEffect } from 'react'
import { 
  Calendar, CreditCard, CheckCircle2, Zap, AlertTriangle, ChevronRight, Loader2, Phone, Star, RefreshCcw, Shield, Smartphone, Eye, Download, Info, Users, Check, TrendingUp, CheckCircle, Smartphone as PhoneIcon, CheckCircle2 as CheckIcon 
} from 'lucide-react'
import { subscriptionsApi } from '../../lib/api/providers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { useAuth } from '../../lib/auth/AuthContext'
import Pagination from '../../components/shared/Pagination'
import { Filter, Search } from 'lucide-react'

const PLANS = [
  {
    id: 'LITE',
    name: 'Starter',
    price: 4450,
    desc: 'For small businesses that want better control of daily sales and expenses.',
    color: 'emerald',
    features: ['Manage up to 15 items', 'Record Sales', 'Track Expenses', 'Daily Profit Reports', 'Standard Support'],
    notIncluded: ['eTIMS Compliance Hub', 'M-Pesa Express Automation', 'Staff Accounts']
  },
  {
    id: 'PLUS',
    name: 'Growth',
    price: 9450,
    desc: 'For growing businesses that need deeper reports and better business tracking.',
    color: 'blue',
    features: ['Everything in Starter','Manage up to 100 items', 'Profit Analytics', 'Sales Reports & Graphs', 'M-Pesa Express Automation', 'eTIMS Compliance Hub', '1 Staff Account', 'Priority Support'],
    notIncluded: ['KCB Buni Settlement', 'Unlimited Staff Accounts']
  },
  {
    id: 'MAX',
    name: 'Business Pro',
    price: 16999,
    desc: 'For businesses that need complete operational and staff management.',
    color: 'purple',
    features: ['Everything in Growth','Unlimited Inventory Items', 'KCB Buni Settlement', 'Unlimited Staff Accounts', 'Staff Activity Tracking', 'Roles & Permissions', 'Advanced Business Controls'],
    notIncluded: []
  },
]

const FEATURE_COMPARISON = [
  { name: 'Inventory Management (Items)', lite: 'Up to 15', plus: 'Up to 100', max: 'Unlimited' },
  { name: 'Record & View Sales', lite: true, plus: true, max: true },
  { name: 'Track Daily Expenses', lite: true, plus: true, max: true },
  { name: 'Profit Analytics', lite: true, plus: true, max: true },
  { name: 'Priority Support', lite: true , plus: true, max: true },
  { name: 'M-Pesa Express Automation', lite: false, plus: true, max: true },
  { name: 'KRA eTIMS Auto-Sync', lite: false, plus: true, max: true },
  { name: '1 Staff Account', lite: false, plus: true, max: true },
  { name: 'KCB Buni Settlement', lite: false, plus: false, max: true },
  { name: 'Unlimited Staff Accounts', lite: false, plus: false, max: true },
  { name: 'Staff Activity Tracking', lite: false, plus: false, max: true },
  { name: 'Roles & Permissions', lite: false, plus: false, max: true },
]

import { SubscriptionExpiredBanner } from '../../components/shared/SubscriptionGuard'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

// Base reward per referral per plan (in KES) & commission rate labels
const REFERRAL_REWARDS = { lite: 1200, plus: 2650, max: 4950 }
const REFERRAL_RATES  = { lite: '27%', plus: '28%', max: '29%' }

function ReferralsTab() {
  const { user, refreshUser } = useAuth()
  const referralCode = user?.referralCode
  const referralLink = referralCode ? `${window.location.origin}/login?ref=${referralCode}` : 'Generating...'

  // Slider state: number of providers onboarded (1–100)
  const [providerCount, setProviderCount] = useState(1)

  // Season progress: 180-day window anchored to platform epoch (arbitrary Jan 1 reference)
  const SEASON_DAYS = 180
  const seasonStart = new Date('2025-01-01')
  const now = new Date()
  const msSinceEpoch = now.getTime() - seasonStart.getTime()
  const seasonIndex = Math.floor(msSinceEpoch / (SEASON_DAYS * 24 * 60 * 60 * 1000))
  const seasonStartDate = new Date(seasonStart.getTime() + seasonIndex * SEASON_DAYS * 24 * 60 * 60 * 1000)
  const seasonEndDate = new Date(seasonStartDate.getTime() + SEASON_DAYS * 24 * 60 * 60 * 1000)
  const elapsedDays = Math.min(Math.floor((now.getTime() - seasonStartDate.getTime()) / (24 * 60 * 60 * 1000)), SEASON_DAYS)
  const remainingDays = SEASON_DAYS - elapsedDays
  const progressPct = Math.round((elapsedDays / SEASON_DAYS) * 100)

  // Each plan shows earnings as if ALL providers join that plan
  const planProjections = {
    lite: providerCount * REFERRAL_REWARDS.lite,
    plus: providerCount * REFERRAL_REWARDS.plus,
    max:  providerCount * REFERRAL_REWARDS.max,
  }
  const maxProjected = planProjections.max  // highest plan is always the max

  const plans = [
    { plan: 'Starter',      desc: 'LITE Package',  base: REFERRAL_REWARDS.lite, rate: REFERRAL_RATES.lite, projected: planProjections.lite, color: 'indigo' },
    { plan: 'Growth',       desc: 'PLUS Package',  base: REFERRAL_REWARDS.plus, rate: REFERRAL_RATES.plus, projected: planProjections.plus, color: 'blue'   },
    { plan: 'Business Pro', desc: 'MAX Package',   base: REFERRAL_REWARDS.max,  rate: REFERRAL_RATES.max,  projected: planProjections.max,  color: 'violet' },
  ]

  const { data: referralsRes, isLoading: refsLoading } = useQuery({
    queryKey: ['my-referrals'],
    queryFn: subscriptionsApi.getReferrals
  })
  const referrals = referralsRes?.data || []

  useEffect(() => {
    if (!referralCode) refreshUser()
  }, [referralCode, refreshUser])

  const copyToClipboard = async () => {
    if (!referralCode) {
      toast.loading('Generating your referral code...', { id: 'ref-gen' })
      const updatedUser = await refreshUser()
      if (updatedUser?.referralCode) {
        const newLink = `${window.location.origin}/login?ref=${updatedUser.referralCode}`
        navigator.clipboard.writeText(newLink)
        toast.success('Generated and copied to clipboard!', { id: 'ref-gen' })
        return
      }
      toast.error('Unable to generate code. Please try reloading the page.', { id: 'ref-gen' })
      return
    }
    navigator.clipboard.writeText(referralLink)
    toast.success('Referral link copied to clipboard!')
  }

  const sliderGradient = `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((providerCount - 1) / 99) * 100}%, #e2e8f0 ${((providerCount - 1) / 99) * 100}%, #e2e8f0 100%)`

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-12 rounded-[.5em] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-white/10 text-indigo-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Growth Program</span>
            <span className="bg-amber-400 text-amber-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Season Rules Active</span>
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Invite Vendors to hlynk</h2>
          <p className="text-indigo-200/60 text-sm font-medium leading-relaxed max-w-xl mb-10">
            Help traditional businesses go digital and earn massive rewards. When a vendor joins via your link, you get a significant share of their first "Season" payment.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md max-w-2xl">
            <div className="flex-1 px-6 py-3 font-bold text-indigo-100 hl-mono text-sm truncate uppercase tracking-widest">
              {referralLink}
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto px-8 py-3 bg-white text-indigo-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl"
            >
              Copy Link
            </button>
          </div>
        </div>
        <Star size={200} className="absolute -right-20 -top-20 text-white opacity-5" />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — Season Time Progress
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-[.5em] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
            <Calendar size={16} className="text-indigo-500" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Season Progress</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Your current 180-day referral season window</p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black text-slate-900 hl-mono">{elapsedDays}</span>
              <span className="text-sm font-bold text-slate-400">/ {SEASON_DAYS} days elapsed</span>
            </div>
            <div className="flex items-center gap-8 text-right">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Season Ends</p>
                <p className="text-sm font-black text-slate-800 hl-mono">
                  {seasonEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Days Remaining</p>
                <p className="text-sm font-black text-indigo-600 hl-mono">{remainingDays} days</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #4f46e5, #818cf8)' }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>

          <div className="flex justify-between mt-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {seasonStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: progressPct >= 80 ? '#fef3c7' : progressPct >= 50 ? '#e0e7ff' : '#f0fdf4',
                color:      progressPct >= 80 ? '#92400e'  : progressPct >= 50 ? '#3730a3'  : '#166534'
              }}
            >
              {progressPct >= 80 ? '⚡ Season Ending Soon' : progressPct >= 50 ? '🔥 Season Active' : '✅ Early Season'}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {seasonEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Season milestones */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: 'Qualify for Renewal Bonus', day: 1, met: elapsedDays >= 1 && providerCount >= 1 },
              { label: 'Mid-Season Check',          day: 90, met: elapsedDays >= 90 },
              { label: 'Season Completion',          day: 180, met: elapsedDays >= 180 },
            ].map((m, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border text-center transition-all ${m.met ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}
              >
                <div className={`text-xs font-black uppercase tracking-widest mb-1 ${m.met ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {m.met ? '✔ Achieved' : `Day ${m.day}`}
                </div>
                <p className="text-[11px] font-medium text-slate-600 leading-tight">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — Providers Onboarded Simulator
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-[.5em] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-violet-50 flex items-center justify-center">
            <TrendingUp size={16} className="text-violet-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Earnings Simulator</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Drag the slider to see how much you earn per plan — the higher the plan, the bigger your reward</p>
          </div>
          <div className="bg-indigo-50 px-5 py-2 rounded-xl border border-indigo-100 text-center">
            <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-0.5">Providers</p>
            <p className="text-xl font-black text-indigo-700 hl-mono leading-none">{providerCount}</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Slider */}
          <div className="space-y-4">
            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>1 Provider</span>
              <span>100 Providers</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={providerCount}
              onChange={e => setProviderCount(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: sliderGradient,
                outline: 'none',
                WebkitAppearance: 'none',
              }}
            />
            <style>{`
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 24px; height: 24px;
                border-radius: 50%;
                background: #4f46e5;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(79,70,229,0.4);
                cursor: pointer;
                transition: transform 0.15s;
              }
              input[type='range']::-webkit-slider-thumb:hover { transform: scale(1.2); }
              input[type='range']::-moz-range-thumb {
                width: 24px; height: 24px;
                border-radius: 50%;
                background: #4f46e5;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(79,70,229,0.4);
                cursor: pointer;
              }
            `}</style>

            {/* Tick marks */}
            <div className="flex justify-between px-0.5">
              {[1, 25, 50, 75, 100].map(n => (
                <button
                  key={n}
                  onClick={() => setProviderCount(n)}
                  className={`text-[9px] font-black uppercase tracking-widest transition-all ${providerCount === n ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Grand Total Banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300/60 mb-1">Best-Case Earnings</p>
              <p className="text-3xl font-black text-white hl-mono transition-all">
                KES {maxProjected.toLocaleString()}
              </p>
              <p className="text-[10px] text-indigo-300/50 font-medium mt-1">
                If all {providerCount} provider{providerCount !== 1 ? 's' : ''} subscribe to Business Pro
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-5 py-3 rounded-xl border border-white/10">
              <Star size={16} className="text-amber-400" fill="currentColor" />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                {providerCount >= 50 ? 'Elite Referrer' : providerCount >= 20 ? 'Power Referrer' : providerCount >= 5 ? 'Active Referrer' : 'Getting Started'}
              </span>
            </div>
          </div>

          {/* Reward Cards (reactive) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((item, i) => {
              const colorMap: Record<string, { bg: string, text: string, badge: string, bar: string }> = {
                indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', bar: '#4f46e5' },
                blue:   { bg: 'bg-blue-50',   text: 'text-blue-600',   badge: 'bg-blue-100 text-blue-700',     bar: '#2563eb' },
                violet: { bg: 'bg-violet-50',  text: 'text-violet-600', badge: 'bg-violet-100 text-violet-700', bar: '#7c3aed' },
              }
              const c = colorMap[item.color]
              const barWidth = Math.round((item.projected / maxProjected) * 100)
              return (
                <div key={i} className="bg-white p-8 rounded-[.5em] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.desc}</p>
                      <h4 className="text-lg font-black text-slate-900">{item.plan}</h4>
                    </div>
                    <span className={`${c.badge} px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest`}>
                      {item.rate} Commission
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-400">Per referral:</span>
                    <span className={`text-sm font-black ${c.text} hl-mono`}>KES {item.base.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">If all {providerCount} join</span>
                      <span className={`text-2xl font-black ${c.text} hl-mono transition-all`}>
                        KES {item.projected.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${barWidth}%`, background: c.bar }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {barWidth}% of max potential
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Season Rule Info ── */}
      <div className="bg-slate-50 p-10 rounded-[.5em] border border-slate-100">
        <div className="flex items-center gap-2 mb-6">
          <Info size={16} className="text-slate-400" />
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-600">The 180-Day Season Rule</h4>
        </div>
        <div className="space-y-4 text-sm text-slate-500 font-medium leading-relaxed">
          <p>
            To keep rewards sustainable, we use the <span className="text-slate-900 font-bold">180-Day Rule</span>:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>You receive rewards automatically for every NEW vendor you refer.</li>
            <li>For RENEWALS, you only receive a bonus if you have referred <span className="text-indigo-600 font-bold">at least 1 new vendor</span> in the last 6 months (180 days).</li>
            <li>This ensures active growth and community engagement.</li>
          </ul>
        </div>
      </div>

      {/* ── Referral Tracking Table ── */}
      <div className="bg-white rounded-[.5em] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
               <Users size={16} className="text-emerald-500" />
             </div>
             <div>
               <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Your Referrals</h3>
               <p className="text-[11px] text-slate-400 font-medium mt-0.5">Track businesses that joined via your link</p>
             </div>
          </div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hl-mono">
            {referrals.length} Total Vendors
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-slate-50/50 border-b border-slate-100">
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Biashara</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                 <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Potential Reward</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {refsLoading ? (
                <tr><td colSpan={4} className="p-20 text-center animate-pulse text-slate-400 font-medium italic">Loading your referral list...</td></tr>
              ) : referrals.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">You haven't referred any businesses yet. Share your link to start earning!</td></tr>
              ) : (
                referrals.map((ref: any, i: number) => {
                  const isTrial = ref.subStatus === 2;
                  const latestPayout = ref.payouts?.[0]; // Usually one primary bonus
                  const planName = ref.planName === 'MAX' ? 'Business Pro' : ref.planName === 'PLUS' ? 'Growth' : 'Starter';
                  
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                      <td className="p-8">
                         <p className="font-bold text-slate-900 text-sm">{ref.businessName}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{planName} Plan</p>
                      </td>
                      <td className="p-8 text-slate-500 text-sm font-medium">
                        {new Date(ref.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-8">
                        {isTrial ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 w-fit">
                              <Loader2 size={10} className="animate-spin" /> In Trial
                            </span>
                            <p className="text-[9px] text-slate-400 font-bold ml-1">Ends {new Date(ref.trialEndDate).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 w-fit">
                            <Check size={10} /> Plan Paid
                          </span>
                        )}
                      </td>
                      <td className="p-8 text-right">
                        {latestPayout ? (
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-sm font-black text-slate-900 hl-mono">KES {Number(latestPayout.amount).toLocaleString()}</p>
                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded ${latestPayout.status === 'PENDING' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {latestPayout.status === 'PENDING' ? 'Mature: Settlement Pending' : 'Paid Out'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <p className="text-sm font-black text-slate-300 hl-mono">---</p>
                            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                              {isTrial ? 'Awaiting Payment' : 'No payout logged'}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function PayoutsTab() {
  const { data: payoutsRes, isLoading } = useQuery({
    queryKey: ['my-payouts'],
    queryFn: subscriptionsApi.getPayouts
  })

  const stats = payoutsRes?.data?.summary
  const history = payoutsRes?.data?.history || []

  if (isLoading) {
    return (
      <div className="p-20 text-center animate-pulse text-slate-300 uppercase font-black text-[10px] tracking-widest">
        Calculating Settlements...
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="bg-[#0D4A3E] p-12 rounded-[.5em] text-white shadow-2xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="bg-white/10 text-emerald-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Revenue Share Settlement</span>
            <h2 className="text-4xl font-black mb-4 tracking-tight">Your Paybill Earnings</h2>
            <p className="text-emerald-200/60 text-sm font-medium leading-relaxed max-w-sm">
              Since you're using hlynk's shared Paybill infrastructures, a {((stats?.shareRate || 0) * 100).toFixed(0)}% platform fee is applied. We settle your net earnings every 7 days.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">Unsettled (Net)</p>
              <p className="text-2xl font-black hl-mono">KES {Math.floor(stats?.pendingNet || 0).toLocaleString()}</p>
              <div className="h-1.5 w-full bg-white/10 rounded-full mt-4 overflow-hidden">
                 <div className="h-full bg-emerald-400 w-[60%] shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-2">Total Settled</p>
              <p className="text-2xl font-black hl-mono">KES {Math.floor(stats?.settledNet || 0).toLocaleString()}</p>
              <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-4">
                 <CheckCircle2 size={12} /> Verified Payments
              </div>
            </div>
          </div>
        </div>
        <TrendingUp size={240} className="absolute -right-20 -bottom-20 text-white opacity-5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Settlement History</h3>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hl-mono">{history.length} Batches Found</span>
            </div>
            
            <div className="bg-white rounded-[.5em] border border-slate-100 shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period / Batch</th>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Gross Volume</th>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Net Payout</th>
                      <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.length === 0 ? (
                      <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-medium italic">No payouts processed yet. settlements occur weekly.</td></tr>
                    ) : (
                      history.map((row: any, i: number) => {
                        const net = row.grossAmount * (1 - (stats?.shareRate || 0));
                        return (
                          <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                            <td className="p-8">
                              <p className="font-bold text-slate-900 text-sm">
                                {new Date(row.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(row.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{row.txCount} payments bundled</p>
                            </td>
                            <td className="p-8 text-right font-black text-slate-400 hl-mono text-sm">KES {Number(row.grossAmount).toLocaleString()}</td>
                            <td className="p-8 text-right font-black text-[#0D4A3E] hl-mono text-sm">KES {Math.floor(net).toLocaleString()}</td>
                            <td className="p-8">
                              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${row.payoutStatus === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700 font-black animate-pulse'}`}>
                                {row.payoutStatus === 1 ? 'Settled' : 'Unsettled'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Summary</h3>
            <div className="bg-white p-10 rounded-[.5em] border border-slate-100 shadow-sm space-y-10">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Platform Intake</p>
                  <p className="text-3xl font-black text-slate-900 hl-mono">KES {(Number(stats?.pendingGross || 0) + Number(stats?.settledGross || 0)).toLocaleString()}</p>
               </div>
               
               <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-500">Platform Share (10%)</span>
                     <span className="text-xs font-black text-red-500 hl-mono">- KES {Math.floor((Number(stats?.pendingGross || 0) + Number(stats?.settledGross || 0)) * 0.10).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-500">Already Settled</span>
                     <span className="text-xs font-black text-blue-500 hl-mono">KES {Math.floor(stats?.settledNet || 0).toLocaleString()}</span>
                  </div>
               </div>

               <div className="bg-emerald-50 p-8 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#0D4A3E] uppercase tracking-widest mb-2">
                    <Smartphone size={14} /> Available for Withdrawal
                  </div>
                  <p className="text-3xl font-black text-emerald-900 hl-mono">KES {Math.floor(stats?.pendingNet || 0).toLocaleString()}</p>
                  <p className="text-[10px] font-medium text-emerald-800/60 mt-4 leading-relaxed italic">
                    Funds are automatically sent to your registered M-Pesa number upon Super Admin approval.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { user, refreshUser } = useAuth()
  const [showRenewModal, setShowRenewModal] = useState(false)
  const [showChangeModal, setShowChangeModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showConfirmChange, setShowConfirmChange] = useState(false)
  const [showConfirmRenew, setShowConfirmRenew] = useState(false)
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'payouts' | 'referrals'>(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab')?.toLowerCase();
    if (['current', 'history', 'payouts', 'referrals'].includes(tab || '')) return tab as any;
    return 'current';
  })
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false)
  const [waitingPaymentId, setWaitingPaymentId] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  
  // Manual Payment Support
  const [subPaymentMethod, setSubPaymentMethod] = useState<'STK' | 'MANUAL'>('STK')
  const [mpesaCode, setMpesaCode] = useState('')
  const [billingCycle, setBillingCycle] = useState<'1' | '6' | '12'>('1')

  // ── STAFF ACCESS LOCK ──
  if (user?.role === 'STAFF') {
    return (
      <div className="p-20 text-center flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="h-24 w-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-red-500/10 relative overflow-hidden">
          <Shield size={48} />
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3">Access Restricted</h2>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Staff accounts are strictly prohibited from viewing or managing business billing plans. Please contact your administrator for assistance.
          </p>
        </div>
        <button 
          onClick={() => window.history.back()} 
          className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Go Back
        </button>
      </div>
    )
  }

  // History Filters
  const [historyPage, setHistoryPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const { data: subResponse, isLoading: subLoading } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: subscriptionsApi.getMe,
    refetchInterval: isWaitingForPayment ? 1500 : false
  })

  const { data: historyResponse, isLoading: historyLoading } = useQuery({
    queryKey: ['billing-history', historyPage, statusFilter, planFilter],
    queryFn: () => subscriptionsApi.getBillingHistory({
      page: historyPage,
      status: statusFilter || undefined,
      plan: planFilter || undefined,
      limit: 5
    }),
    enabled: activeTab === 'history' || isWaitingForPayment,
    refetchInterval: isWaitingForPayment ? 1500 : false
  })

  const [paymentResultMessage, setPaymentResultMessage] = useState<string | null>(null)
  const [initialPlan, setInitialPlan] = useState<string | null>(null)

  const subscription = subResponse?.data
  const history = historyResponse?.data?.payments || []
  const pagination = historyResponse?.data?.pagination

  const isTrial = subscription?.status === 2
  const isExpired = subscription?.status === 1 || 
                    (subscription?.endDate && new Date(subscription.endDate) < new Date()) ||
                    (isTrial && subscription?.trialEndDate && new Date(subscription.trialEndDate) < new Date())
  const targetEndDate = isTrial ? subscription?.trialEndDate : subscription?.endDate

  // Watch for payment status change
  useEffect(() => {
    if (!isWaitingForPayment) return;

    const currentPlan = subResponse?.data?.planName;
    const currentStatus = subResponse?.data?.status;

    // SUCCESS DETECTION 1: History Record updated
    const historyLatest = historyResponse?.data?.payments?.[0];
    const specificPayment = waitingPaymentId 
      ? historyResponse?.data?.payments?.find((p: any) => p.id === waitingPaymentId)
      : null;
    
    const paymentToTrack = specificPayment || historyLatest;
    
    const isPaid = paymentToTrack?.status === 0;
    const isCancelled = paymentToTrack?.status === 3;
    const isFailed = paymentToTrack?.status === 1 || paymentToTrack?.status === 4;

    // SUCCESS DETECTION 2: Subscription status or plan changed (Fallback)
    const planChanged = initialPlan && currentPlan && initialPlan !== currentPlan;
    const statusActivated = (isExpired || isTrial) && currentStatus === 0;
    
    if (isPaid || planChanged || statusActivated) {
      setWaitingPaymentId(null);
      setIsWaitingForPayment(false);
      setPaymentResultMessage(null);
      
      // Force refresh everything
      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      refreshUser();
      
      // Switch back to current plan tab to show the update
      setActiveTab('current');
      
      toast.success('Payment Successful', {
        description: `Your ${currentPlan || 'new'} plan is now active. All features are unlocked.`,
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      // Automatically reload the page after a short delay to manifest the changes
      // This ensures the sidebar, guard, and all other components see the fresh subscription
      setTimeout(() => {
        window.location.href = '/dashboard'; // Redirect to dashboard to "exit" the lock
      }, 2000);
      return;
    }

    // FAILURE DETECTION
    if (isCancelled || isFailed) {
      // console.log('[SUBSCRIPTION] Failure detected:', { isCancelled, isFailed });
      
      setWaitingPaymentId(null);
      setIsWaitingForPayment(false);
      
      const failureMsg = isCancelled ? 'Transaction Cancelled' : 'Payment Failed';
      const description = isCancelled 
        ? 'The STK push request was cancelled on the phone.'
        : (paymentToTrack?.message || 'M-Pesa could not process the payment. Please try again.');

      setPaymentResultMessage(failureMsg);
      toast.error(failureMsg, {
        description,
        icon: <AlertTriangle className="text-red-500" />
      });

      setTimeout(() => setPaymentResultMessage(null), 8000);
    }
  }, [historyResponse, subResponse, isWaitingForPayment, waitingPaymentId, initialPlan, isExpired, isTrial, queryClient, refreshUser]);


  const renewMutation = useMutation({
    mutationFn: (phone: string) => subscriptionsApi.renew(phone, parseInt(billingCycle)),
    onSuccess: (data) => {
      setInitialPlan(subResponse?.data?.planName || null)
      toast.success(data.message || 'STK Push sent to your phone, Enter your pin to complete the transaction!')
      setShowRenewModal(false)
      setIsWaitingForPayment(true)
      // Store the specific payment ID if returned, or we'll fallback to latest in history
      if (data.data?.id || data.id) {
        setWaitingPaymentId(data.data?.id || data.id)
      }
      // Safety timeout: stop waiting if no response after 60 seconds
      setTimeout(() => {
        setIsWaitingForPayment(false)
        setWaitingPaymentId(null)
      }, 60000)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const changePlanMutation = useMutation({
    mutationFn: ({ plan, phone }: { plan: string, phone: string }) => subscriptionsApi.changePlan(plan, phone, parseInt(billingCycle)),
    onSuccess: (data) => {
      setInitialPlan(subResponse?.data?.planName || null)
      toast.success(data.message || 'Payment initiated for plan upgrade!')
      setShowChangeModal(false)
      setIsWaitingForPayment(true)
      if (data.data?.id || data.id) {
        setWaitingPaymentId(data.data?.id || data.id)
      }
      // Safety timeout: stop waiting if no response after 60 seconds
      setTimeout(() => {
        setIsWaitingForPayment(false)
        setWaitingPaymentId(null)
      }, 60000)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const verifyMutation = useMutation({
    mutationFn: (paymentId: string) => subscriptionsApi.verify(paymentId),
    onSuccess: (data) => {
      setIsWaitingForPayment(false) // Force stop spinner immediately
      
      const statusMap: Record<number, string> = { 0: 'PAID', 1: 'FAILED', 2: 'PENDING', 3: 'CANCELLED', 4: 'ERROR' };
      const statusValue = data.data.status;
      const statusStr = typeof statusValue === 'number' ? statusMap[statusValue] || 'UNKNOWN' : statusValue;

      if (statusStr === 'PAID' || statusValue === 0) {
        toast.success("Payment verified successfully! Your plan is active.")
        queryClient.clear()
        refreshUser()

        // Automatically reload and return to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        toast.info(`Transaction Status: ${statusStr}`)
        queryClient.invalidateQueries({ queryKey: ['billing-history'] })
      }
    },
    onError: (err) => {
      setIsWaitingForPayment(false)
      toast.error(getErrorMessage(err))
    }
  })

  const manualPaymentMutation = useMutation({
    mutationFn: (data: { planName: string, mpesaCode: string }) => subscriptionsApi.submitManualPayment(data),
    onSuccess: (data) => {
      toast.success(data.message, {
        description: 'Once verified, your subscription will be activated automatically.',
        duration: 8000
      })
      setShowRenewModal(false)
      setShowChangeModal(false)
      setMpesaCode('')
      queryClient.invalidateQueries({ queryKey: ['billing-history'] })
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  if (subLoading) return (
    <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
      <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center animate-bounce">
        <Zap size={24} fill="currentColor" />
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Syncing Subscription Status...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">

      {isWaitingForPayment && (
        <div className="space-y-4">
          <div className={`${paymentResultMessage ? (paymentResultMessage.includes('Success') || paymentResultMessage.includes('active') ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800') : 'bg-emerald-50 border-emerald-200 text-emerald-800'} border px-6 py-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm ${!paymentResultMessage && 'animate-pulse'}`}>
            <div className="flex items-center gap-4">
              {paymentResultMessage ? (
                (paymentResultMessage.includes('Success') || paymentResultMessage.includes('active') ? <CheckCircle2 size={24} className="text-emerald-600" /> : <AlertTriangle size={24} className="text-red-600" />)
              ) : (
                <Loader2 className="animate-spin text-emerald-600" size={24} />
              )}
              <div>
                <h4 className="font-black text-sm tracking-tight">
                  {paymentResultMessage ? 'Transaction Finalized' : 
                   (historyResponse?.data?.payments?.[0]?.status === 2 ? 'Awaiting Your PIN...' : 'Waiting for M-Pesa...')}
                </h4>
                <p className={`text-xs font-medium ${paymentResultMessage ? '' : 'text-emerald-600/80'}`}>
                  {paymentResultMessage || 
                   (historyResponse?.data?.payments?.[0]?.status === 2 
                     ? "We've sent the prompt. Please enter your M-Pesa PIN on your phone to complete the activation." 
                     : "Requesting an STK prompt from Safaricom... Please keep your phone unlocked.")
                  }
                </p>
              </div>
            </div>

            {!paymentResultMessage && historyResponse?.data?.payments?.[0]?.id && (
              <button
                onClick={() => verifyMutation.mutate(historyResponse.data.payments[0].id)}
                disabled={verifyMutation.isPending}
                className="px-4 py-2 bg-white border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm"
              >
                {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                Check Status
              </button>
            )}
          </div>

        </div>
      )}

      <SubscriptionExpiredBanner expired={isExpired} />


      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscription</h1>
          <p className="text-gray-500 font-medium italic">"Know your real profit. Not just what came in — what stayed."</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-[.5em]">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-2 rounded-[.5em]lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Manage Plan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-[.5em]lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Billing History
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-6 py-2 rounded-[.5em] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'referrals' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Refer & Earn
          </button>
          {user?.isRented === 1 && (
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-6 py-2 rounded-[.5em] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'payouts' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Payouts Hub
            </button>
          )}
        </div>
      </div>

      {activeTab === 'current' ? (
        <>
          {isTrial && !isExpired && (
             <div className="bg-emerald-900 text-white p-8 rounded-[.5em] shadow-2xl shadow-emerald-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
               <div>
                 <h3 className="text-xl font-black tracking-tight">You're exploring hlynk on a 14-Day Free Trial</h3>
                 <p className="text-emerald-200 text-sm font-medium">No payment required. See your real profit before you pay.</p>
               </div>
              <div className="bg-emerald-800 px-6 py-3 rounded-[.5em] border border-emerald-700/50 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Trial Ends In</p>
                <p className="text-2xl font-black hl-mono">
                  {targetEndDate ? Math.ceil((new Date(targetEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} Days
                </p>
              </div>
            </div>
          )}

          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[.5em] space-y-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-[#0D4A3E] shadow-sm border border-emerald-100">
                  <Smartphone size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0D4A3E] uppercase tracking-widest leading-none mb-2">Billing Cycle</h3>
                  <p className="text-xs font-medium text-emerald-800/60 leading-relaxed italic">Select your commitment period to unlock bulk savings.</p>
                </div>
              </div>

              <div className="flex bg-white/50 p-1 rounded-2xl border border-emerald-100 shadow-sm">
                {[
                  { id: '1', label: 'Monthly', days: 28 },
                  { id: '6', label: 'Half Year', days: 180, promo: 'Save 5%' },
                  { id: '12', label: 'Full Year', days: 365, promo: 'Save 15%' }
                ].map(cycle => (
                  <button
                    key={cycle.id}
                    onClick={() => setBillingCycle(cycle.id as any)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${billingCycle === cycle.id ? 'bg-[#0D4A3E] text-white shadow-lg' : 'text-[#0D4A3E]/40 hover:text-[#0D4A3E]'}`}
                  >
                    {cycle.label}
                    {cycle.promo && (
                      <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-[8px] font-black shadow-sm">
                        {cycle.promo}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-emerald-100 group">
               <div className="flex items-center gap-2 mb-2">
                 <Zap size={16} className={`${billingCycle !== '1' ? 'text-amber-500 animate-pulse' : 'text-slate-300'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#0D4A3E]">Instant Activation Reward</span>
               </div>
               <p className="text-xs font-medium text-emerald-800/60">
                 {billingCycle === '1' && "Pay per 28-day cycle."}
                 {billingCycle === '6' && "Secure your business for 180 days today."}
                 {billingCycle === '12' && "Full year coverage (365 days) with priority support included."}
               </p>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[.5em] border border-gray-100 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap size={160} className="text-emerald-900" />
            </div>

            <div className="max-w-xl relative z-10">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isExpired ? 'EXPIRED' : (isTrial ? 'FREE TRIAL' : 'ACTIVE SUBSCRIPTION')}
              </span>
              <h2 className="text-5xl font-black text-gray-900 mt-6 mb-4 tracking-tighter">
                {isTrial ? "Free Trial (Starter)" : (PLANS.find(p => p.id === subscription?.planName)?.name || 'Custom')}
              </h2>
              <p className="text-gray-500 font-medium text-xl mb-12 leading-relaxed">
                {isTrial 
                  ? "Explore all Starter features free for 14 days. Grow your business risk-free."
                  : (PLANS.find(p => p.id === subscription?.planName)?.desc || 'Your current subscription plan details.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={14} className="text-emerald-500" /> {isTrial ? 'Trial Ends' : 'Next Billing Date'}
                  </p>
                  <p className="text-xl font-black text-gray-900 hl-mono">
                    {targetEndDate ? new Date(targetEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={14} className="text-emerald-500" /> Investment Amount
                  </p>
                  <p className="text-xl font-black text-[#0D4A3E] hl-mono">
                    {isTrial ? "Free (KES 0)" : (
                      (() => {
                        const base = PLANS.find(p => p.id === subscription?.planName)?.price || 0
                        const months = parseInt(billingCycle)
                        let total = base * months
                        if (months === 6) total = Math.round(total * 0.95)
                        if (months === 12) total = Math.round(total * 0.85)
                        return `KES ${total.toLocaleString()}`
                      })()
                    )}
                    <span className="text-[10px] text-emerald-600/40 ml-2">
                       / {billingCycle === '1' ? '28' : billingCycle === '6' ? '180' : '365'} Days
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setMpesaPhone('')
                    setShowRenewModal(true)
                  }}
                  className="px-12 py-5 rounded-[.5em] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 bg-[#0D4A3E] text-white hover:bg-[#0A3D33] shadow-emerald-900/20"
                >
                  Renew For {billingCycle === '1' ? '1 Month' : billingCycle === '6' ? '6 Months' : '1 Year'}
                </button>
                <button
                  onClick={() => setShowChangeModal(true)}
                  className="bg-white text-gray-600 px-12 py-5 rounded-[.5em] font-black text-xs uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                >
                  Change My Plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 rounded-[.5em] border border-gray-100 shadow-sm">
            <div className="mb-12">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Compare hlynk Packages</h3>
              <p className="text-gray-500 font-medium italic">Choose the level of control your business needs.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-50">
                    <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Feature</th>
                    <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Starter</th>
                    <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Growth</th>
                    <th className="py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Business Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {FEATURE_COMPARISON.map((f: any, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-all group">
                      <td className="py-6 font-bold text-slate-700 text-sm">{f.name}</td>
                      <td className="py-6 text-center">
                        {typeof f.lite === 'string' ? (
                          <span className="text-xs font-black text-emerald-600 hl-mono">{f.lite}</span>
                        ) : f.lite ? (
                          <CheckCircle2 size={20} className="mx-auto text-emerald-500" />
                        ) : (
                          <span className="text-slate-200">✕</span>
                        )}
                      </td>
                      <td className="py-6 text-center">
                        {typeof f.plus === 'string' ? (
                          <span className="text-xs font-black text-blue-600 hl-mono">{f.plus}</span>
                        ) : f.plus ? (
                          <CheckCircle2 size={20} className="mx-auto text-blue-500" />
                        ) : (
                          <span className="text-slate-200">✕</span>
                        )}
                      </td>
                      <td className="py-6 text-center">
                        {typeof f.max === 'string' ? (
                          <span className="text-xs font-black text-purple-600 hl-mono">{f.max}</span>
                        ) : f.max ? (
                          <CheckCircle2 size={20} className="mx-auto text-purple-500" />
                        ) : (
                          <span className="text-slate-200">✕</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'history' ? (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-white p-6 rounded-[.5em] border border-gray-100">
            <div className="flex items-center gap-2 text-slate-400 mr-2">
              <Filter size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Filter By:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setHistoryPage(1); }}
              className="bg-slate-50 border-none rounded-[.5em] px-4 py-2 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px]"
            >
              <option value="">All Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setHistoryPage(1); }}
              className="bg-slate-50 border-none rounded-[.5em] px-4 py-2 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px]"
            >
              <option value="">All Plans</option>
              <option value="LITE">Starter</option>
              <option value="PLUS">Growth</option>
              <option value="MAX">Business Pro</option>
            </select>

            <div className="ml-auto text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Showing {history.length} of {pagination?.total || 0} Records
            </div>
          </div>

          <div className="bg-white rounded-[.5em] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="p-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="p-8 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center animate-pulse text-slate-300 uppercase font-black text-[10px] tracking-widest">Loading history...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-medium italic">No billing records found matching your filters.</td></tr>
                ) : (
                  history.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="p-8 font-bold text-gray-900 text-sm">{new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</td>
                      <td className="p-8">
                        <p className="font-medium text-gray-400 text-[10px] hl-mono uppercase tracking-tighter">{inv.reference}</p>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">{inv.plan}</p>
                      </td>
                      <td className="p-8">
                        {inv.mpesaReceipt ? (
                          <span className="font-black text-[10px] hl-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded-[.5em]">{inv.mpesaReceipt}</span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-300 italic">No receipt</span>
                        )}
                      </td>
                      <td className="p-8 font-black text-emerald-800 hl-mono text-right text-sm">KES {Number(inv.amount).toLocaleString()}</td>
                      <td className="p-8">
                        <div className="flex items-center gap-2">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.status === 0 ? 'bg-emerald-100 text-emerald-700' :
                            inv.status === 1 ? 'bg-red-100 text-red-700' :
                              inv.status === 3 ? 'bg-amber-100 text-amber-700' :
                              inv.status === 4 ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {inv.status === 0 ? 'PAID' : inv.status === 1 ? 'FAILED' : inv.status === 3 ? 'CANCELLED' : inv.status === 4 ? 'ERROR' : 'PENDING'}
                          </span>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end items-center gap-2">
                          {inv.status === 2 && (
                            <button
                              onClick={() => verifyMutation.mutate(inv.id)}
                              disabled={verifyMutation.isPending}
                              title="Verify Payment"
                              className="h-8 w-8 rounded-[.5em] bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-all"
                            >
                              {verifyMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTransaction(inv)}
                            className="h-8 w-8 rounded-[.5em] bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 transition-all"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
              <div className="p-8 bg-gray-50/30 border-t border-gray-50">
                <Pagination
                  page={historyPage}
                  pages={pagination.totalPages}
                  total={pagination.total}
                  onPageChange={setHistoryPage}
                  label="Transactions"
                />
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'payouts' ? (
        <PayoutsTab />
      ) : (
        <ReferralsTab />
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[.5em] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-[.5em] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={24} />
              </div>
              <button onClick={() => setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">Renew Subscription</h3>
            <p className="text-gray-500 text-sm mb-6 font-medium">Choose your preferred M-Pesa payment method.</p>

            <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
              <button
                onClick={() => setSubPaymentMethod('STK')}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subPaymentMethod === 'STK' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                STK Push
              </button>
              <button
                onClick={() => setSubPaymentMethod('MANUAL')}
                className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subPaymentMethod === 'MANUAL' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Manual
              </button>
            </div>

            <div className="space-y-6">
              {subPaymentMethod === 'STK' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">M-Pesa Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="0712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-[.5em] py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 text-lg font-black hl-mono"
                    />
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 italic mt-1">We will send a prompt to this number.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 space-y-4">
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">Instructions</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-emerald-700">1. Go to M-Pesa &gt; Lipa na M-Pesa</p>
                      <p className="text-xs font-medium text-emerald-700">2. Paybill: 4003431 </p>
                      <p className="text-xs font-medium text-emerald-700">3. Account: {user?.phone || 'Your Phone Number'}</p>
                      <p className="text-xs font-medium text-emerald-700">4. Amount: KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction Code</label>
                    <input
                      type="text"
                      placeholder="SFL89H..."
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border-none rounded-[.5em] py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500/10 text-lg font-black hl-mono uppercase"
                    />
                    <p className="text-[10px] font-medium text-slate-400 italic mt-1">Paste the M-Pesa confirmation code here.</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-[.5em] flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount to Pay</span>
                <span className="text-xl font-black text-emerald-900 hl-mono">KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString() || '0'}</span>
              </div>

              <button
                onClick={() => {
                  if (subPaymentMethod === 'MANUAL') {
                    manualPaymentMutation.mutate({ planName: subscription?.planName, mpesaCode })
                    return
                  }
                  const daysLeft = subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                  if (daysLeft > 0) {
                    setShowConfirmRenew(true)
                  } else {
                    renewMutation.mutate(mpesaPhone)
                  }
                }}
                disabled={renewMutation.isPending || manualPaymentMutation.isPending || (subPaymentMethod === 'STK' ? !mpesaPhone : !mpesaCode)}
                className="w-full bg-[#0D4A3E] text-white py-4 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 disabled:opacity-50"
              >
                {renewMutation.isPending || manualPaymentMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (subPaymentMethod === 'STK' ? 'Pay via M-Pesa' : 'Submit Code')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-slate-50 rounded-[.5em] shadow-2xl w-full max-w-4xl p-12 animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">Upgrade Your Business</h3>
                <p className="text-slate-500 font-medium italic">Unlock advanced features and scale your operations.</p>
              </div>
              <button onClick={() => setShowChangeModal(false)} className="h-12 w-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-8 rounded-[.5em] cursor-pointer transition-all border-2 flex flex-col ${selectedPlan?.id === plan.id ? 'bg-white border-emerald-500 shadow-xl ring-8 ring-emerald-500/5' : 'bg-white border-white hover:border-slate-200 shadow-sm'}`}
                >
                  <div className={`h-12 w-12 rounded-[.5em] bg-${plan.color}-50 text-${plan.color}-600 flex items-center justify-center mb-6`}>
                    <Star size={24} />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-black text-slate-900 hl-mono">KES {plan.price.toLocaleString()}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hl-mono">/28 days</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-8 flex-1">{plan.desc}</p>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan?.id === plan.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>
                    {selectedPlan?.id === plan.id && <CheckCircle2 size={14} />}
                  </div>
                </div>
              ))}
            </div>

            {selectedPlan && (
              <div className="bg-white p-8 rounded-[.5em] border border-slate-100 animate-in slide-in-from-bottom-4">
                {/* The warning was moved to ConfirmModal */}
                <div className="flex flex-col gap-6">
                  {/* Payment Method Switcher for upgrade */}
                  <div className="flex bg-slate-50 p-1 rounded-xl">
                    <button
                      onClick={() => setSubPaymentMethod('STK')}
                      className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subPaymentMethod === 'STK' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Instant STK Push
                    </button>
                    <button
                      onClick={() => setSubPaymentMethod('MANUAL')}
                      className={`flex-1 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subPaymentMethod === 'MANUAL' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Manual
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-end gap-8">
                    {subPaymentMethod === 'STK' ? (
                      <div className="flex-1 w-full space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Payment Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input
                            type="text"
                            placeholder="0712345678"
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-[.5em] py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/5 text-lg font-black hl-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 w-full space-y-2 animate-in fade-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Transaction Code</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="SFL89H..."
                            value={mpesaCode}
                            onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                            className="w-full bg-slate-50 border-none rounded-[.5em] py-4 px-6 outline-none focus:ring-4 focus:ring-emerald-500/5 text-lg font-black hl-mono uppercase"
                          />
                        </div>
                        <p className="text-[9px] font-medium text-slate-400">Pay KES {selectedPlan.price.toLocaleString()} to Paybill 4003431 (Account: {user?.phone || 'Your Phone Number'})</p>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        if (subPaymentMethod === 'MANUAL') {
                          manualPaymentMutation.mutate({ planName: selectedPlan.id, mpesaCode })
                          return
                        }
                        const daysLeft = subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                        if (daysLeft > 0 && subscription?.planName !== selectedPlan.id) {
                          setShowConfirmChange(true)
                        } else {
                          changePlanMutation.mutate({ plan: selectedPlan.id, phone: mpesaPhone })
                        }
                      }}
                      disabled={changePlanMutation.isPending || manualPaymentMutation.isPending || (subPaymentMethod === 'STK' ? !mpesaPhone : !mpesaCode)}
                      className="w-full md:w-auto bg-emerald-600 text-white px-12 py-5 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 disabled:opacity-50"
                    >
                      {changePlanMutation.isPending || manualPaymentMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : (subPaymentMethod === 'STK' ? `Upgrade to ${selectedPlan.name}` : 'Verify & Upgrade')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showConfirmChange}
        title="Override Existing Days?"
        message={`You currently have ${subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left. Upgrading now will instantly unlock your new plan and apply a 28-day cycle starting today. Your existing days will be replaced and will not stack.`}
        confirmText="Upgrade Anyway"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          changePlanMutation.mutate({ plan: selectedPlan.id, phone: mpesaPhone })
        }}
        onCancel={() => setShowConfirmChange(false)}
      />

      <ConfirmModal
        isOpen={showConfirmRenew}
        title="Override Existing Days?"
        message={`You currently have ${subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left. Renewing early will simply apply 28 days to your plan starting today. Your existing days will be replaced and will not stack.`}
        confirmText="Renew Anyway"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          renewMutation.mutate(mpesaPhone)
        }}
        onCancel={() => setShowConfirmRenew(false)}
      />

      {/* ── TRANSACTION DETAIL MODAL ── */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[.5em] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-50 p-8 flex justify-between items-center border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-[.5em] flex items-center justify-center shadow-sm ${
                  selectedTransaction.status === 0 ? 'bg-emerald-50 text-emerald-600' :
                  selectedTransaction.status === 1 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Transaction Details</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View comprehensive billing data</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Reference</p>
                  <p className="text-sm font-black text-emerald-600 hl-mono">{selectedTransaction.reference}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Receipt</p>
                  <p className="text-sm font-black text-slate-900 hl-mono">{selectedTransaction.mpesaReceipt || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Number</p>
                  <p className="text-sm font-black text-slate-900 hl-mono">{selectedTransaction.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[.5em] p-8 border border-slate-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subscription Plan</p>
                  <p className="text-lg font-black text-slate-900">{selectedTransaction.plan} Tier</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                  <p className="text-2xl font-black text-emerald-900 hl-mono">KES {Number(selectedTransaction.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    selectedTransaction.status === 0 ? 'bg-emerald-100 text-emerald-700' :
                    selectedTransaction.status === 1 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedTransaction.status === 0 ? 'Transaction Successful' : 
                     selectedTransaction.status === 1 ? 'Transaction Failed' : 
                     selectedTransaction.status === 3 ? 'Transaction Cancelled' : 'Payment Pending'}
                  </span>
                </div>
                
                {selectedTransaction.message && (
                  <div className="bg-slate-50/50 p-4 rounded-[.5em] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Info size={12} /> Gateway Response
                    </p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                      "{selectedTransaction.message}"
                    </p>
                  </div>
                )}

                {/* RAW SAFARICOM JSON AUDIT */}
                {(selectedTransaction.rawPayload || selectedTransaction.rawResponse) && (
                  <div className="bg-slate-900 rounded-[.5em] p-6 shadow-inner overflow-hidden border border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} className="text-amber-400" /> Technical Conversation
                      </p>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest hl-mono">Forensic Audit</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      <pre className="text-[10px] font-medium text-emerald-400/90 hl-mono leading-relaxed whitespace-pre-wrap">
                        {(() => {
                          try {
                            const payload = selectedTransaction.rawPayload || selectedTransaction.rawResponse;
                            const parsed = typeof payload === 'string' 
                              ? JSON.parse(payload) 
                              : payload;
                            return JSON.stringify(parsed, null, 2);
                          } catch (e) {
                            return selectedTransaction.rawPayload || selectedTransaction.rawResponse;
                          }
                        })()}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-slate-900 text-white rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download Receipt
                </button>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-[.5em] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
