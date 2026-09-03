import { useState, useEffect } from 'react'
import {
  Calendar, CreditCard, CheckCircle2, Zap, AlertTriangle, Loader2, Phone, Star, RefreshCcw, Shield, Smartphone, Eye, Download, Info, Users, Check, TrendingUp
} from 'lucide-react'
import { subscriptionsApi } from '../../lib/api/providers'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { useAuth } from '../../lib/auth/AuthContext'
import Pagination from '../../components/shared/Pagination'
import { Filter } from 'lucide-react'

const PLANS = [
  {
    id: 'PLUS',
    name: 'Starter',
    price: 4450,
    desc: 'For growing businesses needing inventory management, sales recording, automated M-Pesa payments, and basic team delegation.',
    color: 'teal',
    features: ['Manage up to 100 items', 'Record Sales & Expenses', 'M-Pesa STK Push Automation', 'Profit Analytics & Reports', 'Public Store Page (/store/:slug)', 'Customer Tracking', '1 Staff Account', 'Priority Support'],
    notIncluded: ['Public Stay Booking (/stay/:slug)', 'KCB Buni Direct Settlement', 'Unlimited Staff Accounts', 'Staff Audit Logs & Activity Tracking', 'Custom Roles & Permissions']
  },
  {
    id: 'MAX',
    name: 'Business Pro',
    price: 8200,
    desc: 'For larger businesses, hotels, BnBs, and teams requiring public stay booking, full audit logs, and direct bank settlements.',
    color: 'purple',
    features: ['Everything in Starter Plan', 'Unlimited Inventory Items', 'Public Stay Booking (/stay/:slug)', 'KCB Buni Settlement Gateway', 'Unlimited Staff Accounts', 'Staff Audit Logs & Activity Tracking', 'Custom Roles & Permissions', 'Dedicated Manager Support'],
    notIncluded: []
  },
]

const FEATURE_COMPARISON = [
  { name: 'Inventory Management (Items)', starter: 'Up to 100', pro: 'Unlimited' },
  { name: 'POS Sales & Expense Recording', starter: true, pro: true },
  { name: 'M-Pesa STK Push Automation', starter: true, pro: true },
  { name: 'Profit Analytics & Reports', starter: true, pro: true },
  { name: 'Public Store / Shop Page (/store)', starter: true, pro: true },
  { name: 'Public Stay Booking Page (/stay)', starter: false, pro: true },
  { name: 'Staff Accounts', starter: '1 Account', pro: 'Unlimited' },
  { name: 'KCB Buni Direct Settlement', starter: false, pro: true },
  { name: 'Staff Audit Logs & Activity Tracking', starter: false, pro: true },
  { name: 'Roles & Permissions', starter: false, pro: true },
  // { name: 'Support Level', starter: 'Priority', pro: 'Dedicated Manager' },
]

import { SubscriptionExpiredBanner } from '../../components/shared/SubscriptionGuard'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

// Base reward per referral per plan (in KES) & commission rate labels
const REFERRAL_REWARDS = { starter: 1200, pro: 2300 }
const REFERRAL_RATES  = { starter: '27%', pro: '28%' }

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
    starter: providerCount * REFERRAL_REWARDS.starter,
    pro:     providerCount * REFERRAL_REWARDS.pro,
  }
  const maxProjected = planProjections.pro  // highest plan is always the max

  const plans = [
    { plan: 'Starter',      desc: 'Starter Plan (PLUS)',      base: REFERRAL_REWARDS.starter, rate: REFERRAL_RATES.starter, projected: planProjections.starter },
    { plan: 'Business Pro', desc: 'Business Pro Plan (MAX)', base: REFERRAL_REWARDS.pro,     rate: REFERRAL_RATES.pro,     projected: planProjections.pro },
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

  const sliderGradient = `linear-gradient(to right, #0D4A3E 0%, #0D4A3E ${((providerCount - 1) / 99) * 100}%, #e5e7eb ${((providerCount - 1) / 99) * 100}%, #e5e7eb 100%)`

  return (
    <div className="space-y-8">

      {/* Hero banner */}
      <div className="bg-gray-900 p-6 sm:p-8 rounded-[.5rem] text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="bg-white/10 text-gray-300 px-2.5 py-1 rounded-full text-xs">Growth program</span>
            <span className="bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full text-xs font-medium">Season rules active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Invite vendors to hlynk</h2>
          <p className="text-gray-300 text-sm leading-relaxed max-w-xl mb-5">
            Help traditional businesses go digital and earn massive rewards. When a vendor joins via your link, you get a significant share of their first "Season" payment.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/5 p-2 rounded-[.5rem] border border-white/10 max-w-2xl">
            <div className="flex-1 px-3 py-2 font-medium text-gray-100 hl-mono text-xs sm:text-sm truncate">
              {referralLink}
            </div>
            <button
              onClick={copyToClipboard}
              className="w-full sm:w-auto px-5 py-2.5 bg-white text-gray-900 rounded-[.5rem] text-xs font-medium hover:bg-gray-100 transition-colors"
            >
              Copy link
            </button>
          </div>
        </div>
      </div>

      {/* Season time progress */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3">
          <Calendar size={15} className="text-gray-300" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Season progress</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your current 180-day referral season window</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-gray-900 hl-mono">{elapsedDays}</span>
              <span className="text-sm text-gray-400">/ {SEASON_DAYS} days elapsed</span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Season ends</p>
                <p className="text-sm font-medium text-gray-900 hl-mono">
                  {seasonEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Days remaining</p>
                <p className="text-sm font-medium text-[#0D4A3E] hl-mono">{remainingDays} days</p>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out bg-[#0D4A3E]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">
              {seasonStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span
              className="px-2.5 py-0.5 rounded-full"
              style={{
                background: progressPct >= 80 ? '#fef3c7' : progressPct >= 50 ? '#f3f4f6' : '#f0fdf4',
                color:      progressPct >= 80 ? '#92400e'  : progressPct >= 50 ? '#4b5563'  : '#166534'
              }}
            >
              {progressPct >= 80 ? 'Season ending soon' : progressPct >= 50 ? 'Season active' : 'Early season'}
            </span>
            <span className="text-gray-400">
              {seasonEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Season milestones */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
            {[
              { label: 'Qualify for Renewal Bonus', day: 1, met: elapsedDays >= 1 && providerCount >= 1 },
              { label: 'Mid-Season Check',          day: 90, met: elapsedDays >= 90 },
              { label: 'Season Completion',          day: 180, met: elapsedDays >= 180 },
            ].map((m, i) => (
              <div key={i} className="bg-white p-3 text-center">
                <div className={`text-xs mb-0.5 ${m.met ? 'text-[#0D4A3E]' : 'text-gray-400'}`}>
                  {m.met ? 'Achieved' : `Day ${m.day}`}
                </div>
                <p className="text-xs text-gray-600 leading-tight">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Earnings simulator */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center gap-3">
          <TrendingUp size={15} className="text-gray-300" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">Earnings simulator</h3>
            <p className="text-xs text-gray-400 mt-0.5">Drag the slider to see how much you earn per plan</p>
          </div>
          <div className="bg-gray-50 px-3 py-1.5 rounded-[.5rem] border border-gray-100 text-center shrink-0">
            <p className="text-xs text-gray-400">Providers</p>
            <p className="text-base font-semibold text-gray-900 hl-mono leading-none">{providerCount}</p>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-gray-400">
              <span>1 provider</span>
              <span>100 providers</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={providerCount}
              onChange={e => setProviderCount(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{
                background: sliderGradient,
                outline: 'none',
                WebkitAppearance: 'none',
              }}
            />

            <div className="flex justify-between px-0.5">
              {[1, 25, 50, 75, 100].map(n => (
                <button
                  key={n}
                  onClick={() => setProviderCount(n)}
                  className={`text-xs transition-colors ${providerCount === n ? 'text-[#0D4A3E] font-medium' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Grand total banner */}
          <div className="bg-gray-900 p-5 rounded-[.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Best-case earnings</p>
              <p className="text-xl sm:text-2xl font-semibold text-white hl-mono">
                KES {maxProjected.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                If all {providerCount} provider{providerCount !== 1 ? 's' : ''} subscribe to Business Pro
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-[.5rem] w-fit">
              <Star size={13} className="text-amber-400" fill="currentColor" />
              <span className="text-xs text-white">
                {providerCount >= 50 ? 'Elite Referrer' : providerCount >= 20 ? 'Power Referrer' : providerCount >= 5 ? 'Active Referrer' : 'Getting Started'}
              </span>
            </div>
          </div>

          {/* Reward cards (reactive) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
            {plans.map((item, i) => {
              const barWidth = Math.round((item.projected / maxProjected) * 100)
              return (
                <div key={i} className="bg-white p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">{item.desc}</p>
                      <h4 className="text-sm font-medium text-gray-900">{item.plan}</h4>
                    </div>
                    <span className="bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs">
                      {item.rate}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-gray-400">Per referral:</span>
                    <span className="text-xs font-medium text-[#0D4A3E] hl-mono">KES {item.base.toLocaleString()}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-gray-400">If all {providerCount} join</span>
                      <span className="text-sm font-medium text-[#0D4A3E] hl-mono">
                        KES {item.projected.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0D4A3E] transition-all duration-500 ease-out"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Season rule info */}
      <div className="bg-gray-50 p-5 rounded-[.5rem] border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Info size={15} className="text-gray-400" />
          <h4 className="text-sm font-medium text-gray-700">The 180-day season rule</h4>
        </div>
        <div className="space-y-2 text-xs text-gray-500 leading-relaxed">
          <p>
            To keep rewards sustainable, we use the <span className="text-gray-900 font-medium">180-day rule</span>:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>You receive rewards automatically for every new vendor you refer.</li>
            <li>For renewals, you only receive a bonus if you have referred <span className="text-[#0D4A3E] font-medium">at least 1 new vendor</span> in the last 6 months (180 days).</li>
          </ul>
        </div>
      </div>

      {/* Referral tracking table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={15} className="text-gray-300" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Your referrals</h3>
              <p className="text-xs text-gray-400 mt-0.5">Track businesses that joined via your link</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 hl-mono">
            {referrals.length} total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Biashara</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Joined</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">Potential reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {refsLoading ? (
                <tr><td colSpan={4} className="py-16 text-center text-sm text-gray-400">Loading your referral list…</td></tr>
              ) : referrals.length === 0 ? (
                <tr><td colSpan={4} className="py-16 text-center text-sm text-gray-400">You haven't referred any businesses yet. Share your link to start earning!</td></tr>
              ) : (
                referrals.map((ref: any, i: number) => {
                  const isTrial = ref.subStatus === 2;
                  const latestPayout = ref.payouts?.[0];
                  const planName = ref.planName === 'MAX' ? 'Business Pro' : ref.planName === 'PLUS' ? 'Growth' : 'Starter';

                  return (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900 text-sm">{ref.businessName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{planName} plan</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-sm">
                        {new Date(ref.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3.5">
                        {isTrial ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 w-fit">
                              <Loader2 size={10} className="animate-spin" /> In trial
                            </span>
                            <p className="text-xs text-gray-400 ml-1">Ends {new Date(ref.trialEndDate).toLocaleDateString()}</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 w-fit">
                            <Check size={10} /> Plan paid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {latestPayout ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <p className="text-sm font-medium text-gray-900 hl-mono">KES {Number(latestPayout.amount).toLocaleString()}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${latestPayout.status === 'PENDING' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                              {latestPayout.status === 'PENDING' ? 'Settlement pending' : 'Paid out'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-0.5">
                            <p className="text-sm text-gray-300 hl-mono">—</p>
                            <span className="text-xs text-gray-400">
                              {isTrial ? 'Awaiting payment' : 'No payout logged'}
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
      <div className="py-16 text-center text-sm text-gray-400">Calculating settlements…</div>
    )
  }

  return (
    <div className="space-y-8">

      <div className="bg-[#0D4A3E] p-6 sm:p-8 rounded-[.5rem] text-white relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
          <div>
            <span className="bg-white/10 text-emerald-100 px-2.5 py-1 rounded-full text-xs mb-3 inline-block">Revenue share settlement</span>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Your paybill earnings</h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed max-w-sm">
              Since you're using hlynk's shared Paybill infrastructures, a {((stats?.shareRate || 0) * 100).toFixed(0)}% platform fee is applied. We settle your net earnings every 7 days.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white/5 p-4 rounded-[.5rem] border border-white/10">
              <p className="text-xs opacity-70 mb-1">Unsettled (net)</p>
              <p className="text-xl font-semibold hl-mono">KES {Math.floor(stats?.pendingNet || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 p-4 rounded-[.5rem] border border-white/10">
              <p className="text-xs opacity-70 mb-1">Total settled</p>
              <p className="text-xl font-semibold hl-mono">KES {Math.floor(stats?.settledNet || 0).toLocaleString()}</p>
              <div className="flex items-center gap-1.5 text-xs opacity-70 mt-2">
                <CheckCircle2 size={12} /> Verified payments
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Settlement history</h3>
            <span className="text-xs text-gray-400 hl-mono">{history.length} batches found</span>
          </div>

          <div className="bg-white rounded-[.5rem] border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Period / batch</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">Gross volume</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">Net payout</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.length === 0 ? (
                    <tr><td colSpan={4} className="py-16 text-center text-sm text-gray-400">No payouts processed yet. Settlements occur weekly.</td></tr>
                  ) : (
                    history.map((row: any, i: number) => {
                      const net = row.grossAmount * (1 - (stats?.shareRate || 0));
                      return (
                        <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-gray-900 text-sm">
                              {new Date(row.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(row.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{row.txCount} payments bundled</p>
                          </td>
                          <td className="px-4 py-3.5 text-right text-gray-400 hl-mono text-sm">KES {Number(row.grossAmount).toLocaleString()}</td>
                          <td className="px-4 py-3.5 text-right font-medium text-[#0D4A3E] hl-mono text-sm">KES {Math.floor(net).toLocaleString()}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-1 rounded-full text-xs ${row.payoutStatus === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
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
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Financial summary</h3>
          <div className="bg-white p-5 rounded-[.5rem] border border-gray-100 space-y-5">
            <div className="space-y-1">
              <p className="text-xs text-gray-400">Gross platform intake</p>
              <p className="text-xl font-semibold text-gray-900 hl-mono">KES {(Number(stats?.pendingGross || 0) + Number(stats?.settledGross || 0)).toLocaleString()}</p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-gray-50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Platform share (10%)</span>
                <span className="font-medium text-red-500 hl-mono">− KES {Math.floor((Number(stats?.pendingGross || 0) + Number(stats?.settledGross || 0)) * 0.10).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Already settled</span>
                <span className="font-medium text-blue-500 hl-mono">KES {Math.floor(stats?.settledNet || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-[.5rem] border border-gray-100">
              <div className="flex items-center gap-2 text-xs text-[#0D4A3E] mb-1.5">
                <Smartphone size={13} /> Available for withdrawal
              </div>
              <p className="text-2xl font-semibold text-gray-900 hl-mono">KES {Math.floor(stats?.pendingNet || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
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
      <div className="p-16 text-center flex flex-col items-center justify-center space-y-6">
        <div className="h-16 w-16 bg-red-50 text-red-600 rounded-[.5rem] flex items-center justify-center border border-red-100">
          <Shield size={28} />
        </div>
        <div className="max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access restricted</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Staff accounts are strictly prohibited from viewing or managing business billing plans. Please contact your administrator for assistance.
          </p>
        </div>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-900 text-white rounded-[.5rem] text-sm font-medium hover:bg-black transition-colors"
        >
          Go back
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

    const historyLatest = historyResponse?.data?.payments?.[0];
    const specificPayment = waitingPaymentId
      ? historyResponse?.data?.payments?.find((p: any) => p.id === waitingPaymentId)
      : null;

    const paymentToTrack = specificPayment || historyLatest;

    const isPaid = paymentToTrack?.status === 0;
    const isCancelled = paymentToTrack?.status === 3;
    const isFailed = paymentToTrack?.status === 1 || paymentToTrack?.status === 4;

    const planChanged = initialPlan && currentPlan && initialPlan !== currentPlan;
    const statusActivated = (isExpired || isTrial) && currentStatus === 0;

    if (isPaid || planChanged || statusActivated) {
      setWaitingPaymentId(null);
      setIsWaitingForPayment(false);
      setPaymentResultMessage(null);

      queryClient.invalidateQueries({ queryKey: ['my-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['billing-history'] });
      refreshUser();

      setActiveTab('current');

      toast.success('Payment Successful', {
        description: `Your ${currentPlan || 'new'} plan is now active. All features are unlocked.`,
        icon: <CheckCircle2 className="text-emerald-500" />
      });

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
      return;
    }

    if (isCancelled || isFailed) {
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
      if (data.data?.id || data.id) {
        setWaitingPaymentId(data.data?.id || data.id)
      }
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
      setIsWaitingForPayment(false)

      const statusMap: Record<number, string> = { 0: 'PAID', 1: 'FAILED', 2: 'PENDING', 3: 'CANCELLED', 4: 'ERROR' };
      const statusValue = data.data.status;
      const statusStr = typeof statusValue === 'number' ? statusMap[statusValue] || 'UNKNOWN' : statusValue;

      if (statusStr === 'PAID' || statusValue === 0) {
        toast.success("Payment verified successfully! Your plan is active.")
        queryClient.clear()
        refreshUser()

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
    <div className="flex h-96 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0D4A3E] border-t-transparent" />
    </div>
  )

  return (
    <div className="space-y-8 pt-4">

      {isWaitingForPayment && (
        <div className={`${paymentResultMessage ? (paymentResultMessage.includes('Success') || paymentResultMessage.includes('active') ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800') : 'bg-emerald-50 border-emerald-100 text-emerald-800'} border px-5 py-4 rounded-[.5rem] flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            {paymentResultMessage ? (
              (paymentResultMessage.includes('Success') || paymentResultMessage.includes('active') ? <CheckCircle2 size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-red-600" />)
            ) : (
              <Loader2 className="animate-spin text-emerald-600" size={20} />
            )}
            <div>
              <h4 className="font-medium text-sm">
                {paymentResultMessage ? 'Transaction finalized' :
                 (historyResponse?.data?.payments?.[0]?.status === 2 ? 'Awaiting your PIN…' : 'Waiting for M-Pesa…')}
              </h4>
              <p className="text-xs mt-0.5">
                {paymentResultMessage ||
                 (historyResponse?.data?.payments?.[0]?.status === 2
                   ? "We've sent the prompt. Please enter your M-Pesa PIN on your phone to complete the activation."
                   : "Requesting an STK prompt from Safaricom… Please keep your phone unlocked.")
                }
              </p>
            </div>
          </div>

          {!paymentResultMessage && historyResponse?.data?.payments?.[0]?.id && (
            <button
              onClick={() => verifyMutation.mutate(historyResponse.data.payments[0].id)}
              disabled={verifyMutation.isPending}
              className="px-3 py-2 bg-white border border-emerald-100 rounded-[.5rem] text-xs text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
            >
              {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
              Check status
            </button>
          )}
        </div>
      )}

      <SubscriptionExpiredBanner expired={isExpired} />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Subscription</h1>
          <p className="text-sm text-gray-400">"Know your real profit. Not just what came in — what stayed."</p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap bg-gray-100 p-1 rounded-[.5rem] gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${activeTab === 'current' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Manage plan
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Billing history
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-4 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${activeTab === 'referrals' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Refer & earn
          </button>
          {user?.isRented === 1 && (
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${activeTab === 'payouts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Payouts hub
            </button>
          )}
        </div>
      </div>

      {activeTab === 'current' ? (
        <>
          {isTrial && !isExpired && (
             <div className="bg-[#0D4A3E] text-white p-6 rounded-[.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
               <div>
                 <h3 className="text-base font-semibold">You're exploring hlynk on a 14-day free trial</h3>
                 <p className="text-emerald-100 text-sm">No payment required. See your real profit before you pay.</p>
               </div>
              <div className="bg-white/10 px-5 py-3 rounded-[.5rem] border border-white/10 flex flex-col items-center">
                <p className="text-xs opacity-70 mb-1">Trial ends in</p>
                <p className="text-xl font-semibold hl-mono">
                  {targetEndDate ? Math.ceil((new Date(targetEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                </p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-100 p-6 rounded-[.5rem] space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 bg-white rounded-[.5rem] flex items-center justify-center text-[#0D4A3E] border border-gray-100">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Billing cycle</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Select your commitment period to unlock bulk savings.</p>
                </div>
              </div>

              <div className="flex bg-white p-1 rounded-[.5rem] border border-gray-100">
                {[
                  { id: '1', label: 'Monthly', days: 28 },
                  { id: '6', label: 'Half year', days: 180, promo: 'Save 5%' },
                  { id: '12', label: 'Full year', days: 365, promo: 'Save 15%' }
                ].map(cycle => (
                  <button
                    key={cycle.id}
                    onClick={() => setBillingCycle(cycle.id as any)}
                    className={`px-5 py-2.5 rounded-[.5rem] text-xs font-medium transition-colors relative ${billingCycle === cycle.id ? 'bg-[#0D4A3E] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {cycle.label}
                    {cycle.promo && (
                      <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full text-[9px] font-medium">
                        {cycle.promo}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-5 border-t border-gray-100">
               <div className="flex items-center gap-2 mb-1.5">
                 <Zap size={14} className={billingCycle !== '1' ? 'text-amber-500' : 'text-gray-300'} />
                 <span className="text-xs font-medium text-[#0D4A3E]">Instant activation reward</span>
               </div>
               <p className="text-xs text-gray-500">
                 {billingCycle === '1' && "Pay per 28-day cycle."}
                 {billingCycle === '6' && "Secure your business for 180 days today."}
                 {billingCycle === '12' && "Full year coverage (365 days) with priority support included."}
               </p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[.5rem] border border-gray-100">
            <div className="max-w-xl space-y-5">
              <span className={`px-2.5 py-1 rounded-full text-xs ${isExpired ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                {isExpired ? 'Expired' : (isTrial ? 'Free trial' : 'Active subscription')}
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {isTrial ? "Free Trial (Starter)" : (PLANS.find(p => p.id === subscription?.planName)?.name || 'Custom')}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isTrial
                  ? "Explore all Starter features free for 14 days. Grow your business risk-free."
                  : (PLANS.find(p => p.id === subscription?.planName)?.desc || 'Your current subscription plan details.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
                <div className="space-y-1 bg-gray-50 p-4 rounded-[.5rem] border border-gray-100">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-300" /> {isTrial ? 'Trial ends' : 'Next billing date'}
                  </p>
                  <p className="text-sm font-medium text-gray-900 hl-mono">
                    {targetEndDate ? new Date(targetEndDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1 bg-gray-50 p-4 rounded-[.5rem] border border-gray-100">
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <CreditCard size={13} className="text-gray-300" /> Investment amount
                  </p>
                  <p className="text-sm font-medium text-[#0D4A3E] hl-mono">
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
                    <span className="text-xs text-gray-400 ml-1">
                       / {billingCycle === '1' ? '28' : billingCycle === '6' ? '180' : '365'} days
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => {
                    setMpesaPhone('')
                    setShowRenewModal(true)
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-[.5rem] text-sm font-medium transition-colors bg-[#0D4A3E] text-white hover:bg-[#0A3D33]"
                >
                  Renew for {billingCycle === '1' ? '1 month' : billingCycle === '6' ? '6 months' : '1 year'}
                </button>
                <button
                  onClick={() => setShowChangeModal(true)}
                  className="w-full sm:w-auto bg-white text-gray-600 px-5 py-3 rounded-[.5rem] text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Change my plan
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[.5rem] border border-gray-100">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900 mb-1">Compare hlynk packages</h3>
              <p className="text-sm text-gray-400">Choose the level of control your business needs.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="py-3 px-4 text-xs font-medium text-gray-400">Feature</th>
                    <th className="py-3 px-4 text-xs font-medium text-teal-600 text-center">Starter</th>
                    <th className="py-3 px-4 text-xs font-medium text-purple-600 text-center">Business Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {FEATURE_COMPARISON.map((f: any, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-gray-700 text-sm">{f.name}</td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof f.starter === 'string' ? (
                          <span className="text-xs font-medium text-teal-600 hl-mono">{f.starter}</span>
                        ) : f.starter ? (
                          <CheckCircle2 size={16} className="mx-auto text-teal-500" />
                        ) : (
                          <span className="text-gray-200">✕</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof f.pro === 'string' ? (
                          <span className="text-xs font-medium text-purple-600 hl-mono">{f.pro}</span>
                        ) : f.pro ? (
                          <CheckCircle2 size={16} className="mx-auto text-purple-500" />
                        ) : (
                          <span className="text-gray-200">✕</span>
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
          <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-[.5rem] border border-gray-100">
            <div className="flex items-center gap-2 text-gray-400 mr-1">
              <Filter size={14} />
              <span className="text-xs">Filter by:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setHistoryPage(1); }}
              className="bg-gray-50 border-none rounded-[.5rem] px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-gray-200 min-w-[130px]"
            >
              <option value="">All statuses</option>
              <option value="PAID">Paid only</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setHistoryPage(1); }}
              className="bg-gray-50 border-none rounded-[.5rem] px-3 py-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-gray-200 min-w-[130px]"
            >
              <option value="">All plans</option>
              <option value="PLUS">Starter</option>
              <option value="MAX">Business Pro</option>
            </select>

            <div className="ml-auto text-xs text-gray-300">
              Showing {history.length} of {pagination?.total || 0} records
            </div>
          </div>

          <div className="bg-white rounded-[.5rem] border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Date</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Reference</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Receipt</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400 text-right">Amount</th>
                    <th className="px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {historyLoading ? (
                    <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">Loading history…</td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">No billing records found matching your filters.</td></tr>
                  ) : (
                    history.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-gray-900 text-sm">{new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' })}</td>
                        <td className="px-4 py-3.5">
                          <p className="text-gray-400 text-xs hl-mono">{inv.reference}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{inv.plan}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          {inv.mpesaReceipt ? (
                            <span className="text-xs hl-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-[.5rem]">{inv.mpesaReceipt}</span>
                          ) : (
                            <span className="text-xs text-gray-300">No receipt</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 hl-mono text-right text-sm">KES {Number(inv.amount).toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 0 ? 'bg-emerald-50 text-emerald-700' :
                            inv.status === 1 ? 'bg-red-50 text-red-700' :
                              inv.status === 3 ? 'bg-amber-50 text-amber-700' :
                              inv.status === 4 ? 'bg-red-50 text-red-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                            {inv.status === 0 ? 'Paid' : inv.status === 1 ? 'Failed' : inv.status === 3 ? 'Cancelled' : inv.status === 4 ? 'Error' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex justify-end items-center gap-1">
                            {inv.status === 2 && (
                              <button
                                onClick={() => verifyMutation.mutate(inv.id)}
                                disabled={verifyMutation.isPending}
                                title="Verify payment"
                                className="h-7 w-7 rounded-[.5rem] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              >
                                {verifyMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />}
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedTransaction(inv)}
                              className="h-7 w-7 rounded-[.5rem] bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-colors"
                              title="View details"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-100">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
          <div className="bg-white rounded-[.5rem] shadow-lg w-full max-w-md p-6 sm:p-7">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 rounded-[.5rem] bg-gray-50 border border-gray-100 text-[#0D4A3E] flex items-center justify-center">
                <CreditCard size={18} />
              </div>
              <button onClick={() => setShowRenewModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">Renew subscription</h3>
            <p className="text-gray-400 text-sm mb-5">Choose your preferred M-Pesa payment method.</p>

            <div className="flex bg-gray-100 p-1 rounded-[.5rem] mb-5">
              <button
                onClick={() => setSubPaymentMethod('STK')}
                className={`flex-1 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${subPaymentMethod === 'STK' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                STK Push
              </button>
              <button
                onClick={() => setSubPaymentMethod('MANUAL')}
                className={`flex-1 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${subPaymentMethod === 'MANUAL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Manual
              </button>
            </div>

            <div className="space-y-4">
              {subPaymentMethod === 'STK' ? (
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500">M-Pesa number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                    <input
                      type="text"
                      placeholder="0712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-gray-200 text-sm font-medium hl-mono"
                    />
                  </div>
                  <p className="text-xs text-gray-400">We will send a prompt to this number.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-[.5rem] border border-gray-100 space-y-1.5">
                    <p className="text-xs font-medium text-gray-700 mb-1">Instructions</p>
                    <div className="space-y-1 text-xs text-gray-500">
                      <p>1. Go to M-Pesa &gt; Lipa na M-Pesa</p>
                      <p>2. Paybill: 4003431 </p>
                      <p>3. Account: {user?.phone || 'Your Phone Number'}</p>
                      <p>4. Amount: KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500">Transaction code</label>
                    <input
                      type="text"
                      placeholder="SFL89H..."
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 text-sm font-medium hl-mono uppercase"
                    />
                    <p className="text-xs text-gray-400">Paste the M-Pesa confirmation code here.</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-[.5rem] flex justify-between items-center">
                <span className="text-xs text-gray-400">Amount to pay</span>
                <span className="text-base font-semibold text-gray-900 hl-mono">KES {PLANS.find(p => p.id === subscription?.planName)?.price.toLocaleString() || '0'}</span>
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
                className="w-full bg-[#0D4A3E] text-white py-3 rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {renewMutation.isPending || manualPaymentMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (subPaymentMethod === 'STK' ? 'Pay via M-Pesa' : 'Submit code')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="bg-gray-50 rounded-[.5rem] shadow-lg w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Upgrade your business</h3>
                <p className="text-gray-400 text-sm">Unlock advanced features and scale your operations.</p>
              </div>
              <button onClick={() => setShowChangeModal(false)} className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-5 rounded-[.5rem] cursor-pointer transition-colors border flex flex-col ${selectedPlan?.id === plan.id ? 'bg-white border-[#0D4A3E]' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="h-9 w-9 rounded-[.5rem] bg-gray-50 text-gray-500 border border-gray-100 flex items-center justify-center mb-3">
                    <Star size={16} />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 mb-1">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-semibold text-gray-900 hl-mono">KES {plan.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 hl-mono">/28 days</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{plan.desc}</p>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPlan?.id === plan.id ? 'bg-[#0D4A3E] border-[#0D4A3E] text-white' : 'border-gray-200'}`}>
                    {selectedPlan?.id === plan.id && <CheckCircle2 size={10} />}
                  </div>
                </div>
              ))}
            </div>

            {selectedPlan && (
              <div className="bg-white p-5 rounded-[.5rem] border border-gray-100">
                <div className="flex flex-col gap-4">
                  <div className="flex bg-gray-50 p-1 rounded-[.5rem]">
                    <button
                      onClick={() => setSubPaymentMethod('STK')}
                      className={`flex-1 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${subPaymentMethod === 'STK' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Instant STK push
                    </button>
                    <button
                      onClick={() => setSubPaymentMethod('MANUAL')}
                      className={`flex-1 py-2 rounded-[.5rem] text-xs font-medium transition-colors ${subPaymentMethod === 'MANUAL' ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Manual
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    {subPaymentMethod === 'STK' ? (
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-xs text-gray-500">M-Pesa payment number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                          <input
                            type="text"
                            placeholder="0712345678"
                            value={mpesaPhone}
                            onChange={(e) => setMpesaPhone(e.target.value)}
                            className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 pl-10 pr-3 outline-none focus:ring-2 focus:ring-gray-200 text-sm font-medium hl-mono"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-xs text-gray-500">M-Pesa transaction code</label>
                        <input
                          type="text"
                          placeholder="SFL89H..."
                          value={mpesaCode}
                          onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                          className="w-full bg-gray-50 border-none rounded-[.5rem] py-3 px-3.5 outline-none focus:ring-2 focus:ring-gray-200 text-sm font-medium hl-mono uppercase"
                        />
                        <p className="text-xs text-gray-400">Pay KES {selectedPlan.price.toLocaleString()} to Paybill 4003431 (Account: {user?.phone || 'Your Phone Number'})</p>
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
                      className="w-full sm:w-auto bg-[#0D4A3E] text-white px-5 py-3 rounded-[.5rem] text-sm font-medium hover:bg-[#0A3D33] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {changePlanMutation.isPending || manualPaymentMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : (subPaymentMethod === 'STK' ? `Upgrade to ${selectedPlan.name}` : 'Verify & upgrade')}
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
        title="Override existing days?"
        message={`You currently have ${subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left. Upgrading now will instantly unlock your new plan and apply a 28-day cycle starting today. Your existing days will be replaced and will not stack.`}
        confirmText="Upgrade anyway"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          changePlanMutation.mutate({ plan: selectedPlan.id, phone: mpesaPhone })
        }}
        onCancel={() => setShowConfirmChange(false)}
      />

      <ConfirmModal
        isOpen={showConfirmRenew}
        title="Override existing days?"
        message={`You currently have ${subscription?.endDate ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0} days left. Renewing early will simply apply 28 days to your plan starting today. Your existing days will be replaced and will not stack.`}
        confirmText="Renew anyway"
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={() => {
          renewMutation.mutate(mpesaPhone)
        }}
        onCancel={() => setShowConfirmRenew(false)}
      />

      {/* Transaction detail modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/50 p-4">
          <div className="bg-white rounded-[.5rem] shadow-lg w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gray-50 p-5 sm:p-6 flex justify-between items-center border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-[.5rem] flex items-center justify-center border ${
                  selectedTransaction.status === 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  selectedTransaction.status === 1 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  <CreditCard size={17} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Transaction details</h3>
                  <p className="text-xs text-gray-400">View comprehensive billing data</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Date & time</p>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">Internal reference</p>
                  <p className="text-sm font-medium text-[#0D4A3E] hl-mono">{selectedTransaction.reference}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">M-Pesa receipt</p>
                  <p className="text-sm font-medium text-gray-900 hl-mono">{selectedTransaction.mpesaReceipt || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">M-Pesa number</p>
                  <p className="text-sm font-medium text-gray-900 hl-mono">{selectedTransaction.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[.5rem] p-4 sm:p-5 border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Subscription plan</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTransaction.plan} tier</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">Amount paid</p>
                  <p className="text-lg font-semibold text-gray-900 hl-mono">KES {Number(selectedTransaction.amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs ${
                    selectedTransaction.status === 0 ? 'bg-emerald-50 text-emerald-700' :
                    selectedTransaction.status === 1 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {selectedTransaction.status === 0 ? 'Transaction successful' :
                     selectedTransaction.status === 1 ? 'Transaction failed' :
                     selectedTransaction.status === 3 ? 'Transaction cancelled' : 'Payment pending'}
                  </span>
                </div>

                {selectedTransaction.message && (
                  <div className="bg-gray-50 p-3 rounded-[.5rem] border border-dashed border-gray-200">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1.5">
                      <Info size={12} /> Gateway response
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed italic">
                      "{selectedTransaction.message}"
                    </p>
                  </div>
                )}

                {(selectedTransaction.rawPayload || selectedTransaction.rawResponse) && (
                  <div className="bg-gray-900 rounded-[.5rem] p-4 overflow-hidden border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Zap size={12} className="text-amber-400" /> Technical conversation
                      </p>
                      <span className="text-xs text-gray-600 hl-mono">Forensic audit</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      <pre className="text-xs text-emerald-400/90 hl-mono leading-relaxed whitespace-pre-wrap">
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

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-gray-900 text-white rounded-[.5rem] text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={14} /> Download receipt
                </button>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-[.5rem] text-sm font-medium hover:bg-gray-50 transition-colors"
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