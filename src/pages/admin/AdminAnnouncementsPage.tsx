import { useState } from 'react'
import { toast } from 'sonner'
import { Send, Users, Clock, Signal, Loader2 } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

const MOCK_HISTORY = [
  { id: 1, title: 'Scheduled Maintenance',        target: 'All Providers',    date: 'Apr 20', channel: 'SMS + In-App',  reach: 248 },
  { id: 2, title: 'New Feature: Inventory Alerts', target: 'Pro Users',       date: 'Apr 18', channel: 'In-App',        reach: 84  },
  { id: 3, title: 'Payment Reminder',              target: 'Expired Accounts', date: 'Apr 15', channel: 'SMS',           reach: 31  },
  { id: 4, title: 'Platform Downtime Notice',      target: 'All Providers',    date: 'Apr 10', channel: 'SMS + In-App',  reach: 248 },
]

const REACH_MAP: Record<string, number> = {
  all: 248, active: 84, trial: 31, expired: 29
}

export default function AdminAnnouncementsPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', target: 'all', channel: 'dashboard' })

  const reach = REACH_MAP[form.target] || 248

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    toast.success('Announcement broadcasted successfully!')
    setForm({ title: '', message: '', target: 'all', channel: 'dashboard' })
    setLoading(false)
  }

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Global Announcements</h1>
            <p className="hl-page-subtitle">Communicate updates and alerts to all providers</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="hl-live" />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: 'var(--ink3)' }}>
                SMS gateway active
              </span>
            </div>
          </div>
        </div>

        <div className="hl-main-grid">

          {/* ── LEFT — Composer ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div className="hl-card" style={{ animation: 'hl-up .4s ease both' }}>
              <div className="hl-card-header"><h3>Draft Broadcast</h3></div>
              <div className="hl-card-body">
                <form onSubmit={handleSend}>
                  <div style={{ marginBottom: 16 }}>
                    <label className="hl-form-label">Title / Heading</label>
                    <input type="text" required className="hl-form-input"
                      placeholder="e.g. System Update — April 24th"
                      value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label className="hl-form-label">Message Content</label>
                    <textarea required className="hl-form-input"
                      style={{ resize: 'none', minHeight: 148, lineHeight: 1.6 }}
                      placeholder="Type your message here…"
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)' }}>
                        {form.message.length} / 500
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                    <div>
                      <label className="hl-form-label">Target Audience</label>
                      <select className="hl-form-input select-input"
                        value={form.target}
                        onChange={e => setForm(p => ({ ...p, target: e.target.value }))}>
                        <option value="all">All Providers (248)</option>
                        <option value="active">Active Subscriptions (84)</option>
                        <option value="trial">Trial Users (31)</option>
                        <option value="expired">Expired Accounts (29)</option>
                      </select>
                    </div>
                    <div>
                      <label className="hl-form-label">Delivery Channel</label>
                      <select className="hl-form-input select-input"
                        value={form.channel}
                        onChange={e => setForm(p => ({ ...p, channel: e.target.value }))}>
                        <option value="dashboard">In-App Dashboard</option>
                        <option value="sms">Direct SMS</option>
                        <option value="both">Both In-App & SMS</option>
                      </select>
                    </div>
                  </div>

                  {/* Reach preview strip */}
                  <div style={{ marginBottom: 18, padding: '12px 16px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Users size={14} color="var(--ink3)" />
                      <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.8rem', fontWeight: 600, color: 'var(--ink2)' }}>
                        <span style={{ color: 'var(--forest)', fontWeight: 800 }}>{reach} providers</span> will receive this
                      </span>
                    </div>
                    <span className="hl-badge hl-badge-active" style={{ fontSize: '.52rem' }}>
                      {form.channel === 'sms' ? 'SMS' : form.channel === 'both' ? 'SMS + IN-APP' : 'IN-APP'}
                    </span>
                  </div>

                  <button type="submit" disabled={loading} className="hl-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: '.88rem' }}>
                    {loading
                      ? <Loader2 size={16} style={{ animation: 'hl-spin .7s linear infinite' }} />
                      : <><Send size={15} /> Broadcast Announcement</>}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ── RIGHT — History + Reach Card ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Broadcast History */}
            <div className="hl-card" style={{ animation: 'hl-up .45s ease .1s both' }}>
              <div className="hl-card-header"><h3>Recent Broadcasts</h3></div>
              <div className="hl-card-body" style={{ paddingTop: 14 }}>
                {MOCK_HISTORY.map((h, i) => (
                  <div key={h.id} className="hl-broadcast-card" style={{ marginBottom: i < MOCK_HISTORY.length - 1 ? 8 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
                      <span style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.85rem', color: 'var(--ink)', lineHeight: 1.3 }}>
                        {h.title}
                      </span>
                      <span className="hl-badge hl-badge-sent" style={{ flexShrink: 0, marginLeft: 8 }}>SENT</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={10} /> {h.target}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> {h.date}
                      </span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)' }}>
                        {h.reach} reached
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reach Dark Card */}
            <div className="hl-card-dark" style={{ padding: '22px', animation: 'hl-up .5s ease .18s both' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 90, background: 'radial-gradient(circle, rgba(29,186,135,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                <Signal size={12} color="#1DBA87" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>
                  Live Reach Estimate
                </span>
              </div>
              <p style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: '2.2rem', color: '#fff', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 5 }}>
                {reach}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: 'rgba(255,255,255,.4)' }}>
                providers will receive this broadcast
              </p>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span className="hl-live" />
                <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.72rem', color: 'rgba(255,255,255,.4)' }}>
                  SMS gateway active · 0 ms latency
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}