import { useState } from 'react'
import { UserPlus, Mail, Edit2, Trash2, Shield, ArrowUpRight } from 'lucide-react'
import { ADMIN_CSS, avatarHue } from './hl-design-system'

const MOCK_ADMINS = [
  { id: 1, name: 'Main Admin',    email: 'admin@hudumalynk.com', role: 'SUPER_ADMIN', last: 'Active Now',  active: true  },
  { id: 2, name: 'Jane Support',  email: 'jane@hudumalynk.com',  role: 'SUPPORT',     last: '2 hours ago', active: false },
  { id: 3, name: 'Mike Billing',  email: 'mike@hudumalynk.com',  role: 'FINANCE',     last: '1 day ago',   active: false },
  { id: 4, name: 'Aisha Dev',     email: 'aisha@hudumalynk.com', role: 'DEVELOPER',   last: '3 days ago',  active: false },
]

const roleBadge = (r: string) => {
  if (r === 'SUPER_ADMIN') return 'hl-badge-active'
  if (r === 'DEVELOPER')   return 'hl-badge-progress'
  return 'hl-badge-trial'
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState(MOCK_ADMINS)

  const removeAdmin = (id: number) =>
    setAdmins(prev => prev.filter(a => a.id !== id))

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Administrative Users</h1>
            <p className="hl-page-subtitle">Manage platform access for your internal team</p>
          </div>
          <button className="hl-btn-primary"><UserPlus size={14} /> Add Admin</button>
        </div>

        {/* KPIs */}
        <div className="hl-grid-3" style={{ marginBottom: 22 }}>
          {[
            { label: 'Total Admins',    value: '8', accent: '#1DBA87' },
            { label: 'Support Staff',   value: '4', accent: '#F5A623' },
            { label: 'Pending Invites', value: '2', accent: '#3B82F6' },
          ].map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '22px', animation: `hl-up .45s ease ${i * .07}s both` }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: k.accent, marginBottom: 12 }} />
              <p className="hl-kpi-label">{k.label}</p>
              <p className="hl-kpi-value">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="hl-main-grid">

          {/* Left — ACL Table */}
          <div>
            <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .22s both' }}>
              <div className="hl-card-header">
                <h3>Access Control List</h3>
                <span className="hl-badge hl-badge-active">{admins.length} Members</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Contact</th>
                      <th>Role</th>
                      <th>Last Active</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((a, i) => {
                      const hue = avatarHue(i)
                      return (
                        <tr key={a.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 38, height: 38, borderRadius: 6, background: `hsl(${hue},38%,88%)`, border: `1px solid hsl(${hue},38%,78%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '.78rem', color: `hsl(${hue},55%,32%)`, flexShrink: 0 }}>
                                {a.name.charAt(0)}
                              </div>
                              <div>
                                <p style={{ fontWeight: 700, fontSize: '.88rem' }}>{a.name}</p>
                                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: 'var(--ink3)' }}>
                                  ID: #ADM-00{a.id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.78rem', color: 'var(--ink2)' }}>
                              <Mail size={12} color="var(--ink3)" /> {a.email}
                            </div>
                          </td>
                          <td>
                            <span className={`hl-badge ${roleBadge(a.role)}`}>{a.role}</span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              {a.active && <span className="hl-live" />}
                              <span style={{ fontSize: '.78rem', fontWeight: 600, color: a.active ? 'var(--mint)' : 'var(--ink3)' }}>
                                {a.last}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }}>
                              <button className="hl-btn-ghost" title="Edit"><Edit2 size={13} /></button>
                              <button className="hl-btn-ghost danger" title="Remove"
                                onClick={() => removeAdmin(a.id)}
                                style={{ color: '#EF4444' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right — Permissions + Invites */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Role Permissions */}
            <div className="hl-card" style={{ animation: 'hl-up .5s ease .28s both' }}>
              <div className="hl-card-header"><h3>Role Permissions</h3></div>
              <div className="hl-card-body">
                {[
                  { role: 'SUPER_ADMIN', perms: ['Full Access', 'Billing', 'Settings', 'Users'] },
                  { role: 'SUPPORT',     perms: ['View Tenants', 'Manage Tickets'] },
                  { role: 'FINANCE',     perms: ['Revenue Reports', 'Billing'] },
                  { role: 'DEVELOPER',   perms: ['API Access', 'Logs', 'Settings'] },
                ].map((r, i) => (
                  <div key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
                      <Shield size={12} color="var(--mint)" />
                      <span className={`hl-badge ${roleBadge(r.role)}`}>{r.role}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {r.perms.map(p => (
                        <span key={p} style={{ padding: '3px 8px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: 'var(--ink3)', fontWeight: 600 }}>
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites */}
            <div className="hl-card" style={{ animation: 'hl-up .5s ease .34s both' }}>
              <div className="hl-card-header">
                <h3>Pending Invites</h3>
                <span className="hl-badge hl-badge-trial">2</span>
              </div>
              <div className="hl-card-body">
                {[
                  { email: 'newstaff@hudumalynk.com', role: 'SUPPORT', sent: '2d ago' },
                  { email: 'analyst@hudumalynk.com',  role: 'FINANCE', sent: '5d ago' },
                ].map((inv, i) => (
                  <div key={i} style={{ padding: '11px 0', borderBottom: i < 1 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.68rem', fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{inv.email}</p>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className={`hl-badge ${roleBadge(inv.role)}`}>{inv.role}</span>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: 'var(--ink3)' }}>Sent {inv.sent}</span>
                      </div>
                    </div>
                    <button className="hl-btn-ghost" title="Resend"><ArrowUpRight size={13} /></button>
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