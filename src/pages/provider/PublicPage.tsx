import { Globe, ExternalLink, Shield, MapPin, Star, Share2, Award, Users, Camera, Zap } from 'lucide-react'
import { PROVIDER_CSS } from '../admin/hl-design-system'

export default function PublicPage() {
  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Marketplace Identity</h1>
            <p className="hl-page-subtitle">Preview and optimize how your brand manifests on the public directory</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="hl-btn-outline" style={{ borderRadius: 10 }}>
              <Share2 size={15} /> Share Profile
            </button>
            <button className="hl-btn-primary">
              <ExternalLink size={15} /> Visit Live Page
            </button>
          </div>
        </div>

        <div style={{ maxWidth: 880 }}>
          {/* Profile Preview Card */}
          <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .15s both' }}>
            <div style={{ height: 200, background: 'var(--forest)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')" }} />
              <div style={{ position: 'absolute', top: 20, right: 20 }}>
                 <button className="hl-btn-ghost" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 10, fontSize: '.65rem' }}>
                    <Camera size={14} /> UPDATE COVER
                 </button>
              </div>
              
              <div style={{ position: 'absolute', bottom: -50, left: 32, padding: '4px', background: 'var(--surface)', borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div style={{ width: 100, height: 100, borderRadius: 16, background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Shield size={48} strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <div style={{ paddingTop: 64, paddingBottom: 32, paddingLeft: 32, paddingRight: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.8rem', color: 'var(--ink)', letterSpacing: '-.02em', marginBottom: 6 }}>Elite Services Hub</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', fontWeight: 800, color: 'var(--ink3)' }}>
                      <MapPin size={12} color="var(--mint)" /> WESTLANDS, NAIROBI
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', fontWeight: 800, color: 'var(--ink3)' }}>
                      <Star size={12} color="#F5A623" /> 4.9 <span style={{ fontWeight: 500, opacity: 0.6 }}>(128 REVIEWS)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', fontWeight: 800, color: 'var(--mint)' }}>
                      <Award size={12} /> VERIFIED PARTNER
                    </div>
                  </div>
                </div>
                <button className="hl-btn-primary" style={{ height: 48, padding: '0 28px', fontSize: '.85rem', borderRadius: 12 }}>
                  SECURE BOOKING
                </button>
              </div>

              <p style={{ fontFamily: "'Figtree',sans-serif", color: 'var(--ink2)', fontSize: '.95rem', lineHeight: 1.7, maxWidth: 680, marginBottom: 32 }}>
                We provide state-of-the-art professional services tailored to modern business needs. Our team of experts ensures that every interaction is handled with precision and excellence, delivering results that exceed expectations.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Elite Craftsmanship', icon: Award },
                  { label: 'Rapid Turnaround', icon: Zap },
                  { label: 'Client-Centric', icon: Users }
                ].map(tag => (
                  <div key={tag.label} style={{ padding: '16px', borderRadius: 14, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: 'var(--mint)' }}><tag.icon size={16} /></div>
                    <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.65rem', textTransform: 'uppercase', color: 'var(--ink)', letterSpacing: '.05em' }}>{tag.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32, padding: '24px', borderRadius: 16, background: 'rgba(29,186,135,.05)', border: '1px dashed rgba(29,186,135,.2)', display: 'flex', gap: 16, alignItems: 'center' }}>
             <Globe size={20} color="var(--mint)" />
             <p style={{ fontSize: '.8rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.5 }}>
               <strong>Visibility Boost:</strong> Your profile is currently indexed in the HudumaLynk search engine. 
               Providers with high fulfillment rates and positive reviews appear higher in search results.
             </p>
          </div>
        </div>
      </div>
    </>
  )
}
