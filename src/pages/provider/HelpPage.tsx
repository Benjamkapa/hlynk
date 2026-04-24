import { HelpCircle, MessageSquare, Book, Phone, ExternalLink, LifeBuoy, FileText, Headphones } from 'lucide-react'
import { PROVIDER_CSS } from '../admin/hl-design-system'

export default function HelpPage() {
  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Operations Support</h1>
            <p className="hl-page-subtitle">Access technical resources and dedicated assistance terminals</p>
          </div>
        </div>

        <div style={{ maxWidth: 900 }}>
          <div className="hl-grid-2" style={{ marginBottom: 32 }}>
            {[
              { title: 'KNOWLEDGE REPOSITORY', desc: 'Step-by-step operational guides and tutorials', icon: Book, color: '#3B82F6' },
              { title: 'DIRECT CHAT TERMINAL', desc: 'Synchronize with our technical support team live', icon: MessageSquare, color: '#1DBA87' },
              { title: 'TELEMETRY SUPPORT', desc: 'Available Mon-Fri, 08:00 - 17:00 EAT', icon: Phone, color: '#F5A623' },
              { title: 'PARTNER FORUM', desc: 'Collaborate with the HudumaLynk provider network', icon: LifeBuoy, color: '#8B5CF6' },
            ].map((item, i) => (
              <button key={i} className="hl-card" style={{ 
                padding: '24px', animation: `hl-up .4s ease ${i * .08}s both`,
                textAlign: 'left', border: '1px solid var(--border)', cursor: 'pointer',
                display: 'flex', gap: 20, alignItems: 'center', transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}12`, border: `1px solid ${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                  <item.icon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.75rem', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    {item.title}
                    <ExternalLink size={12} style={{ opacity: 0.4 }} />
                  </h3>
                  <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.8rem', color: 'var(--ink3)', fontWeight: 500 }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Urgent Assistance Section */}
          <div className="hl-card" style={{ padding: '40px', background: 'var(--forest)', position: 'relative', overflow: 'hidden', animation: 'hl-up .6s ease .3s both' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 240, height: 240, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)', opacity: 0.5 }} />
            <div style={{ display: 'flex', flexDirection: 'column', md: 'row', alignItems: 'center', gap: 40 }}>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                   <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Headphones size={20} color="#fff" />
                   </div>
                   <h2 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.25rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '.05em' }}>Urgent Escalation</h2>
                </div>
                <p style={{ fontFamily: "'Figtree',sans-serif", color: 'rgba(255,255,255,.7)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 32 }}>
                  Encountering critical platform anomalies or account security breaches? Our emergency response unit is operational 24/7 to maintain system integrity.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="hl-btn-primary" style={{ padding: '14px 28px', fontSize: '.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                    INITIATE EMERGENCY CALL
                  </button>
                  <button className="hl-btn-outline" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', padding: '14px 24px', fontSize: '.8rem' }}>
                    OPEN SERVICE TICKET
                  </button>
                </div>
              </div>
              <div style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,.05)', borderRadius: '50%', flexShrink: 0 }}>
                <HelpCircle size={80} color="var(--mint)" style={{ opacity: 0.15 }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 40, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink3)' }}>
                <FileText size={16} />
                <span style={{ fontSize: '.68rem', fontWeight: 800 }}>TERMS OF SERVICE</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink3)' }}>
                <Shield size={16} />
                <span style={{ fontSize: '.68rem', fontWeight: 800 }}>PRIVACY PROTOCOL</span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink3)' }}>
                <Globe size={16} />
                <span style={{ fontSize: '.68rem', fontWeight: 800 }}>SYSTEM STATUS</span>
             </div>
          </div>
        </div>
      </div>
    </>
  )
}
