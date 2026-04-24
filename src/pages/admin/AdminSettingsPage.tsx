import { useState } from 'react'
import { toast } from 'sonner'
import { Save, RefreshCcw, Database, Loader2, Signal } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

const SYSTEM_STATUS = [
  { label: 'API Latency',   value: '24ms',      ok: true },
  { label: 'Database Load', value: '12%',       ok: true },
  { label: 'Worker Jobs',   value: 'Active',    ok: true },
  { label: 'SMS Queue',     value: '0 pending', ok: true },
]

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [purging, setPurging] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('System settings updated')
    setSaving(false)
  }

  const handlePurge = async () => {
    setPurging(true)
    await new Promise(r => setTimeout(r, 900))
    toast.success('Cache purged successfully')
    setPurging(false)
  }

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Global Settings</h1>
            <p className="hl-page-subtitle">Configure platform parameters and pricing tiers</p>
          </div>
          <button className="hl-btn-primary" onClick={handleSave} disabled={saving} style={{ minWidth: 148, justifyContent: 'center' }}>
            {saving
              ? <Loader2 size={15} style={{ animation: 'hl-spin .7s linear infinite' }} />
              : <><Save size={14} /> Save Changes</>}
          </button>
        </div>

        <div className="hl-main-grid">
          {/* Left — main settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Platform Identity */}
            <div className="hl-card" style={{ animation: 'hl-up .4s ease both' }}>
              <div className="hl-card-header"><h3>Platform Identity</h3></div>
              <div className="hl-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  {[
                    { lbl: 'Platform Name', type: 'text', val: 'HudumaLynk' },
                    { lbl: 'Support Email', type: 'email', val: 'support@hudumalynk.com' },
                  ].map(f => (
                    <div key={f.lbl}>
                      <label className="hl-form-label">{f.lbl}</label>
                      <input type={f.type} className="hl-form-input" defaultValue={f.val} />
                    </div>
                  ))}
                  <div>
                    <label className="hl-form-label">Maintenance Mode</label>
                    <select className="hl-form-input select-input">
                      <option>Off (Live)</option>
                      <option>On (Under Maintenance)</option>
                    </select>
                  </div>
                  <div>
                    <label className="hl-form-label">Default Trial Days</label>
                    <input type="number" className="hl-form-input" defaultValue={14} min={1} max={90} />
                  </div>
                  <div>
                    <label className="hl-form-label">Platform Timezone</label>
                    <select className="hl-form-input select-input">
                      <option>Africa/Nairobi (EAT +3)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="hl-form-label">Currency</label>
                    <select className="hl-form-input select-input">
                      <option>KES — Kenyan Shilling</option>
                      <option>USD — US Dollar</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Tiers */}
            <div className="hl-card" style={{ animation: 'hl-up .4s ease .08s both' }}>
              <div className="hl-card-header">
                <h3>Subscription Tiers (KES / month)</h3>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)' }}>VAT exclusive</span>
              </div>
              <div className="hl-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {[
                    { name: 'Starter', val: '1,000', badge: 'hl-badge-active', features: '1 staff · 5 services' },
                    { name: 'Growth',  val: '2,500', badge: 'hl-badge-active', features: '5 staff · 20 services' },
                    { name: 'Enterprise', val: '5,000', badge: 'hl-badge-trial', features: 'Unlimited · API access' },
                  ].map(t => (
                    <div key={t.name} style={{ padding: '14px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span className={`hl-badge ${t.badge}`}>{t.name}</span>
                      </div>
                      <label className="hl-form-label">Monthly (KES)</label>
                      <input type="text" className="hl-form-input" defaultValue={t.val} style={{ marginBottom: 8 }} />
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: 'var(--ink3)' }}>{t.features}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="hl-card" style={{ animation: 'hl-up .4s ease .14s both' }}>
              <div className="hl-card-header"><h3>Notification Defaults</h3></div>
              <div className="hl-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div>
                    <label className="hl-form-label">Trial Expiry Alert (days before)</label>
                    <input type="number" className="hl-form-input" defaultValue={3} />
                  </div>
                  <div>
                    <label className="hl-form-label">Inactivity Threshold (days)</label>
                    <input type="number" className="hl-form-input" defaultValue={14} />
                  </div>
                  <div>
                    <label className="hl-form-label">Welcome SMS</label>
                    <select className="hl-form-input select-input"><option>Enabled</option><option>Disabled</option></select>
                  </div>
                  <div>
                    <label className="hl-form-label">Conversion Nudge</label>
                    <select className="hl-form-input select-input"><option>Auto Send</option><option>Manual Only</option></select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — status + data */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* System Health */}
            <div className="hl-card" style={{ animation: 'hl-up .45s ease .1s both' }}>
              <div className="hl-card-header">
                <h3>System Status</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span className="hl-live" />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: 'var(--ink3)' }}>All systems operational</span>
                </div>
              </div>
              <div className="hl-card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {SYSTEM_STATUS.map((s, i) => (
                    <div key={i} className="hl-status-row">
                      <span style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.8rem', color: '#065f46' }}>{s.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.68rem', fontWeight: 700, color: '#065f46' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
                <button className="hl-btn-outline" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handlePurge} disabled={purging}>
                  {purging
                    ? <Loader2 size={13} style={{ animation: 'hl-spin .7s linear infinite' }} />
                    : <><RefreshCcw size={13} /> Purge System Cache</>}
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="hl-card" style={{ animation: 'hl-up .45s ease .16s both' }}>
              <div className="hl-card-header"><h3>Data Management</h3></div>
              <div className="hl-card-body">
                <button className="hl-btn-outline" style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                  <Database size={14} /> Backup Database
                </button>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)', textAlign: 'center', marginBottom: 16 }}>
                  Last backup: Today, 03:00 AM
                </p>
                <div style={{ padding: '14px', borderRadius: 6, background: 'rgba(239,68,68,.04)', border: '1px solid rgba(239,68,68,.12)' }}>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: '#DC2626', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Danger Zone
                  </p>
                  <button className="hl-btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '.75rem', borderColor: 'rgba(239,68,68,.3)', color: '#DC2626' }}>
                    Reset Platform Data
                  </button>
                </div>
              </div>
            </div>

            {/* Uptime card */}
            <div className="hl-card-dark" style={{ padding: '22px', animation: 'hl-up .5s ease .22s both' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle, rgba(29,186,135,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
                <Signal size={12} color="#1DBA87" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>Platform Uptime</span>
              </div>
              <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '2rem', color: '#1DBA87', lineHeight: 1, marginBottom: 4 }}>99.98%</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'rgba(255,255,255,.35)', marginBottom: 14 }}>30-day rolling average</p>
              <div className="hl-uptime-track">
                <div className="hl-uptime-fill" style={{ width: '99.98%' }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}