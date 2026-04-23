import { useAuth } from '../../lib/auth/AuthContext'
import { CheckCircle2, AlertCircle, ArrowRight, CreditCard } from 'lucide-react'

const PLANS = [
  {
    name: 'Trial',
    price: 'Free',
    period: '14 days',
    features: ['Full dashboard access', 'Unlimited services', 'Receive requests', 'Public profile page'],
    isCurrent: true,
  },
  {
    name: 'Basic',
    price: 'KES 500',
    period: 'per month',
    features: ['Everything in Trial', 'Priority listing', 'Unlimited requests', 'SMS notifications', 'Verified badge'],
    highlight: true,
  },
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const sub = user?.subscription

  const trialDays = sub?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(sub.trialEndDate).getTime() - Date.now()) / 86400000))
    : null

  const statusColor: Record<string, string> = {
    TRIAL: 'badge-trial', ACTIVE: 'badge-active', EXPIRED: 'badge-expired', SUSPENDED: 'badge-suspended',
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscription</h1>
        <p className="page-subtitle">Manage your plan and billing</p>
      </div>

      <div className="page-body space-y-6 max-w-3xl">
        {/* Current status card */}
        <div className="card p-5">
          <h2 className="font-semibold text-foreground mb-4">Current Plan</h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard size={22} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-lg text-foreground">{sub?.planName || 'Trial'}</p>
                <span className={`badge ${statusColor[sub?.status || 'TRIAL'] || 'badge-trial'}`}>{sub?.status}</span>
              </div>
              {sub?.status === 'TRIAL' && trialDays !== null && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {trialDays > 0 ? `${trialDays} day${trialDays !== 1 ? 's' : ''} remaining` : 'Trial expired'}
                  {' · '}{new Date(sub.trialEndDate).toLocaleDateString('en-KE')}
                </p>
              )}
              {sub?.status === 'ACTIVE' && sub.endDate && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Renews {new Date(sub.endDate).toLocaleDateString('en-KE')}
                </p>
              )}
            </div>
          </div>

          {(sub?.status === 'TRIAL' && trialDays !== null && trialDays <= 5) && (
            <div className="flex items-start gap-3 mt-4 p-3.5 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Your trial expires in {trialDays} day{trialDays !== 1 ? 's' : ''}</p>
                <p className="text-xs text-amber-700 mt-0.5">After expiry, new service requests will be paused. Upgrade now to avoid interruption.</p>
              </div>
            </div>
          )}
        </div>

        {/* Plan cards */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">Available Plans</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PLANS.map(plan => (
              <div key={plan.name} className={`card p-5 ${plan.highlight ? 'ring-2 ring-primary' : ''}`}>
                {plan.highlight && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary text-white text-xs font-semibold mb-3">Most Popular</span>
                )}
                <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                <div className="mt-1 mb-4">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ {plan.period}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 size={15} className="text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.highlight ? (
                  <button className="btn-primary w-full justify-center">
                    <CreditCard size={15} /> Upgrade via M-Pesa <ArrowRight size={14} />
                  </button>
                ) : (
                  <div className="flex items-center justify-center h-10 rounded-lg bg-muted text-sm text-muted-foreground font-medium">
                    {sub?.status === 'TRIAL' ? 'Current Plan' : 'Downgrade'}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">* M-Pesa STK Push payment will be triggered on your phone upon upgrade. Payments are processed securely via Intasend.</p>
        </div>
      </div>
    </div>
  )
}
