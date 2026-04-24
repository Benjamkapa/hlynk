import {
  Settings, Shield, Bell, Globe, 
  Database, Zap, Save, RefreshCw
} from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

export default function AdminSettingsPage() {
  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">System Settings</h1>
            <p className="hl-page-subtitle">Configure platform-wide parameters and security</p>
          </div>
          <button className="hl-btn-primary"><Save size={14} /> Save All Changes</button>
        </div>

        <div className="hl-main-grid" style={{ gridTemplateColumns: '260px 1fr' }}>
          
          {/* Left Nav */}
          <div className="hl-card" style={{ height: 'fit-content', padding: '10px' }}>
            {[
              { label: 'General', Icon: Settings, active: true },
              { label: 'Security', Icon: Shield },
              { label: 'Notifications', Icon: Bell },
              { label: 'Integrations', Icon: Zap },
              { label: 'Data & Backup', Icon: Database },
              { label: 'Localization', Icon: Globe },
            ].map((item, i) => (
              <button key={i} className={`hl-tab ${item.active ? 'active' : ''}`} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', 
                  padding: '12px 16px', border: 'none', textAlign: 'left'
                }}>
                <item.Icon size={16} />
                <span style={{ fontSize: '.85rem', fontWeight: 700 }}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Platform Config */}
            <div className="hl-card" style={{ animation: 'hl-up .4s ease both' }}>
              <div className="hl-card-header"><h3>Platform Configuration</h3></div>
              <div className="hl-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="hl-form-group">
                    <label className="hl-label">Platform Name</label>
                    <input className="hl-form-input" defaultValue="HudumaLynk Intelligence" />
                  </div>
                  <div className="hl-form-group">
                    <label className="hl-label">Support Email</label>
                    <input className="hl-form-input" defaultValue="support@hudumalynk.com" />
                  </div>
                </div>
                <div className="hl-form-group">
                  <label className="hl-label">Trial Duration (Days)</label>
                  <input className="hl-form-input" type="number" defaultValue="14" style={{ width: 120 }} />
                </div>
              </div>
            </div>

            {/* M-Pesa Integration */}
            <div className="hl-card" style={{ animation: 'hl-up .4s ease .1s both' }}>
              <div className="hl-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" style={{ height: 20 }} />
                  <h3>Payment Gateway (Daraja)</h3>
                </div>
                <span className="hl-badge hl-badge-active">CONNECTED</span>
              </div>
              <div className="hl-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="hl-form-group">
                  <label className="hl-label">Consumer Key</label>
                  <input className="hl-form-input" type="password" value="********************************" readOnly />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="hl-form-group">
                    <label className="hl-label">Shortcode</label>
                    <input className="hl-form-input" defaultValue="4059021" />
                  </div>
                  <div className="hl-form-group">
                    <label className="hl-label">Passkey</label>
                    <input className="hl-form-input" type="password" value="****************" readOnly />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button className="hl-btn-outline" style={{ gap: 8 }}><RefreshCw size={13} /> Test Connection</button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}