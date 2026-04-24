import { LifeBuoy, MessageSquare, Phone, ExternalLink, Clock, ArrowUpRight } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

const MOCK_TICKETS = [
  { id: 'TIC-1024', subject: 'Cannot update profile photo',      user: 'Mama Njeri',    status: 'OPEN',        priority: 'HIGH',   time: '12m ago' },
  { id: 'TIC-1023', subject: 'Billing inquiry — Growth plan',    user: 'Westlands Auto',status: 'IN_PROGRESS', priority: 'MEDIUM', time: '1h ago'  },
  { id: 'TIC-1022', subject: 'Verification request',             user: 'John Repairs',  status: 'RESOLVED',    priority: 'LOW',    time: '4h ago'  },
  { id: 'TIC-1021', subject: 'SMS not received after signup',    user: 'Aisha Cleaners',status: 'OPEN',        priority: 'HIGH',   time: '6h ago'  },
  { id: 'TIC-1020', subject: 'How to add team members?',         user: 'Swift Movers',  status: 'RESOLVED',    priority: 'LOW',    time: '1d ago'  },
]

const ticketBadge = (s: string) => {
  if (s === 'OPEN')        return 'hl-badge-open'
  if (s === 'IN_PROGRESS') return 'hl-badge-progress'
  return 'hl-badge-resolved'
}

const priorityColor = (p: string) => p === 'HIGH' ? '#EF4444' : p === 'MEDIUM' ? '#F5A623' : 'var(--ink3)'

const kpis = [
  { label: 'Open Tickets',   value: '3', trend: '–',   Icon: MessageSquare, accent: '#F5A623' },
  { label: 'Avg Resolution', value: '2.4h', trend: '↓ 18%', down: true, Icon: Clock, accent: '#1DBA87' },
  { label: 'CSAT Score',     value: '96%', trend: '↑ 4%', Icon: LifeBuoy, accent: '#1DBA87' },
]

export default function AdminSupportPage() {
  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Help & Support</h1>
            <p className="hl-page-subtitle">Manage user inquiries and technical assistance requests</p>
          </div>
          <button className="hl-btn-outline">
            <MessageSquare size={14} /> Live Chat (2)
          </button>
        </div>

        {/* KPIs */}
        <div className="hl-grid-3" style={{ marginBottom: 22 }}>
          {kpis.map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '22px', animation: `hl-up .45s ease ${i * .07}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${k.accent}14`, border: `1px solid ${k.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>
                  <k.Icon size={15} />
                </div>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: k.accent, fontWeight: 700 }}>
                  {k.trend}
                </span>
              </div>
              <p className="hl-kpi-label">{k.label}</p>
              <p className="hl-kpi-value">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="hl-main-grid">
          {/* Left — Tickets Table */}
          <div>
            <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .22s both' }}>
              <div className="hl-card-header">
                <h3>Support Tickets</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="hl-badge hl-badge-open">3 Open</span>
                  <span className="hl-badge hl-badge-resolved">2 Resolved</span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Subject</th>
                      <th>User</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TICKETS.map(t => (
                      <tr key={t.id} style={{ cursor: 'pointer' }}>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.68rem', fontWeight: 700, color: 'var(--forest)' }}>
                          {t.id}
                        </td>
                        <td>
                          <p style={{ fontWeight: 700, fontSize: '.86rem', marginBottom: 2 }}>{t.subject}</p>
                          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', fontWeight: 700, color: priorityColor(t.priority) }}>
                            {t.priority} PRIORITY
                          </p>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: '.82rem' }}>{t.user}</td>
                        <td><span className={`hl-badge ${ticketBadge(t.status)}`}>{t.status.replace('_', ' ')}</span></td>
                        <td style={{ textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: 'var(--ink3)' }}>
                          {t.time}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right — Resources + Escalation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div className="hl-card" style={{ animation: 'hl-up .5s ease .28s both' }}>
              <div className="hl-card-header"><h3>Resources</h3></div>
              <div className="hl-card-body">
                {[
                  { label: 'Admin Manual',   Icon: LifeBuoy,       color: '#1DBA87' },
                  { label: 'Provider FAQs',  Icon: MessageSquare,  color: '#3B82F6' },
                  { label: 'Platform Changelog', Icon: ArrowUpRight, color: '#F5A623' },
                ].map((r, i) => (
                  <button key={i} className="hl-resource-btn" style={{ marginBottom: i < 2 ? 8 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <r.Icon size={16} color={r.color} />
                      <span>{r.label}</span>
                    </div>
                    <ExternalLink size={13} color="var(--ink3)" />
                  </button>
                ))}
              </div>
            </div>

            {/* Escalation dark card */}
            <div className="hl-card-dark" style={{ padding: '22px', animation: 'hl-up .5s ease .34s both' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle, rgba(29,186,135,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 6, background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={16} color="rgba(255,255,255,.6)" />
                </div>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', marginBottom: 4 }}>
                    Escalation Line
                  </p>
                  <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.75rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.4 }}>
                    Critical system failures only. Available 24/7.
                  </p>
                </div>
              </div>
              <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#1DBA87' }}>
                +254 700 000 000
              </p>
            </div>

            {/* Response time SLA */}
            <div className="hl-card" style={{ animation: 'hl-up .5s ease .4s both' }}>
              <div className="hl-card-header"><h3>SLA Targets</h3></div>
              <div className="hl-card-body">
                {[
                  { label: 'First Response', target: '< 1h', met: true },
                  { label: 'Resolution',     target: '< 24h', met: true },
                  { label: 'Escalation',     target: '< 4h', met: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 600, fontSize: '.82rem', color: 'var(--ink)' }}>{s.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: 'var(--ink3)' }}>{s.target}</span>
                      <span className={`hl-badge ${s.met ? 'hl-badge-active' : 'hl-badge-expired'}`}>{s.met ? 'MET' : 'MISSED'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}