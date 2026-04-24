import { useAuth } from '../../lib/auth/AuthContext'
import { CheckCircle2, AlertCircle, ArrowRight, CreditCard, ShieldCheck, Zap, Layers } from 'lucide-react'
import { PROVIDER_CSS, fmtDate } from '../admin/hl-design-system'

const PLANS = [
  {
    name: 'TRIAL',
    price: 'FREE',
    period: '14 DAYS',
    features: ['Standard Dashboard access', 'Service listing limit (10)', 'General customer leads', 'Public brand page'],
    isCurrent: true,
    accent: 'var(--ink3)',
    icon: Zap,
  },
  {
    name: 'PREMIUM',
    price: 'KES 500',
    period: 'MONTHLY',
    features: ['Priority search ranking', 'Unlimited service entries', 'Direct WhatsApp leads', 'Verified Partner badge', 'Financial forecasting tools'],
    highlight: true,
    accent: 'var(--mint)',
    icon: ShieldCheck,
  },
]

export default function SubscriptionPage() {
  const { user } = useAuth()
  const sub = user?.subscription

  const trialDays = sub?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(sub.trialEndDate).getTime() - Date.now()) / 86400000))
    : null

  const statusMeta: Record<string, { cls: string; label: string }> = {
    TRIAL:     { cls: 'hl-badge-trial',   label: 'EVALUATION' },
    ACTIVE:    { cls: 'hl-badge-active',  label: 'PREMIUM ACTIVE' },
    EXPIRED:   { cls: 'hl-badge-expired', label: 'EXPIRED' },
    SUSPENDED: { cls: 'hl-badge-expired', label: 'SUSPENDED' },
  }

  const currentStatus = statusMeta[sub?.status || 'TRIAL'] || statusMeta.TRIAL

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Service Tier</h1>
            <p className="hl-page-subtitle">Configure your operational limits and professional visibility</p>
          </div>
        </div>

        <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Active Subscription Overview */}
          <div className="hl-card" style={{ padding: '28px', animation: 'hl-up .4s ease both', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle, var(--mint) 0%, transparent 70%)', opacity: 0.05 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint)' }}>
                <Layers size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                   <p style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.2rem', color: 'var(--ink)' }}>{sub?.planName || 'TRIAL EVALUATION'}</p>
                   <span className={`hl-badge ${currentStatus.cls}`} style={{ padding: '4px 12px', fontSize: '.6rem' }}>{currentStatus.label}</span>
                </div>
                {sub?.status === 'TRIAL' && trialDays !== null && (
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>
                    {trialDays > 0 ? `${trialDays} BUSINESS DAYS REMAINING` : 'EVALUATION CYCLE COMPLETE'}
                    {' · TERMINATES: '}{fmtDate(sub.trialEndDate)}
                  </p>
                )}
                {sub?.status === 'ACTIVE' && sub.endDate && (
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>
                    NEXT BILLING CYCLE: {fmtDate(sub.endDate)}
                  </p>
                )}
              </div>
            </div>

            {(sub?.status === 'TRIAL' && trialDays !== null && trialDays <= 5) && (
              <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(245,166,35,.1)', border: '1px solid rgba(245,166,35,.2)', display: 'flex', gap: 14, alignItems: 'center' }}>
                <AlertCircle size={20} color="#F5A623" />
                <div>
                  <p style={{ fontSize: '.82rem', fontWeight: 800, color: '#92400E' }}>Evaluation Period Ending</p>
                  <p style={{ fontSize: '.75rem', color: '#B45309', opacity: 0.8 }}>Your access will be restricted in {trialDays} days. Secure your leads by upgrading to Premium.</p>
                </div>
              </div>
            )}
          </div>

          {/* Tier Selection */}
          <div>
            <h2 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.9rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink)', marginBottom: 20 }}>Operational Tiers</h2>
            <div className="hl-grid-2">
              {PLANS.map((plan, i) => {
                const isCurrent = (sub?.planName?.toUpperCase() === plan.name) || (plan.name === 'TRIAL' && !sub?.planName)
                return (
                  <div key={plan.name} className="hl-card" style={{ 
                    padding: '32px', animation: `hl-up .5s ease ${0.1 + i * 0.1}s both`,
                    border: plan.highlight ? '2px solid var(--mint)' : '1px solid var(--border)',
                    boxShadow: plan.highlight ? '0 12px 32px rgba(29,186,135,.12)' : 'none',
                    position: 'relative'
                  }}>
                    {plan.highlight && (
                      <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--mint)', color: '#fff', fontSize: '.55rem', fontWeight: 900, padding: '4px 10px', borderRadius: 100, fontFamily: "'JetBrains Mono',monospace" }}>RECOMMENDED</div>
                    )}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: plan.accent, marginBottom: 20 }}>
                       <plan.icon size={22} />
                    </div>
                    <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.25rem', color: 'var(--ink)', marginBottom: 8 }}>{plan.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                       <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--ink)', fontFamily: "'Saira',sans-serif" }}>{plan.price}</span>
                       <span style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase' }}>/ {plan.period}</span>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                      {plan.features.map(f => (
                        <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500 }}>
                          <CheckCircle2 size={15} color="var(--mint)" style={{ marginTop: 2, flexShrink: 0 }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <div style={{ height: 48, borderRadius: 12, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800, color: 'var(--ink3)', border: '1px solid var(--border)' }}>
                        CURRENT ACTIVE TIER
                      </div>
                    ) : (
                      <button className={plan.highlight ? 'hl-btn-primary' : 'hl-btn-outline'} style={{ width: '100%', height: 48, justifyContent: 'center', borderRadius: 12 }}>
                        {plan.highlight && <CreditCard size={16} />}
                        {plan.highlight ? 'SECURE PREMIUM ACCESS' : 'DOWNSCALE TIER'}
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 24, padding: '16px', borderRadius: 12, background: 'var(--surface2)', border: '1px dashed var(--border)' }}>
               <p style={{ fontSize: '.68rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.5, textAlign: 'center' }}>
                 * Payments are settled via <strong>M-Pesa Business</strong> STK Push. A request will be dispatched to your primary device upon tier selection. 
                 Automated verification via Intasend secure gateway.
               </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
