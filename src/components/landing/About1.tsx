import { CheckCircle2, TrendingUp, ShieldCheck, Users, Zap, BarChart3 } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="py-28 relative overflow-hidden" style={{ background: '#f8faf9' }}>

      {/* ── Decorative blobs ── */}
      <div style={{
        position: 'absolute', top: -120, right: -120,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(13,74,62,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -80, left: -80,
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        {/* ── Section Label ── */}
        <div className="flex items-center gap-3 mb-6">
          <span style={{ width: 32, height: 2, background: '#0D4A3E', display: 'inline-block', borderRadius: 2 }} />
          <span style={{
            fontSize: '0.68rem', fontWeight: 900, letterSpacing: '0.38em',
            textTransform: 'uppercase', color: '#0D4A3E',
          }}>About hlynk</span>
        </div>

        {/* ── Hero text + mission grid ── */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          {/* Left: headline */}
          <div>
            <h2 style={{
              fontSize: 'clamp(2.4rem, 4.5vw, 3.8rem)',
              fontWeight: 900, lineHeight: 1.05,
              letterSpacing: '-0.03em', color: '#0a1628',
              marginBottom: '1.5rem',
            }}>
              Empowering the{' '}
              <span style={{
                color: '#0D4A3E',
                borderBottom: '3px solid #34d399',
                paddingBottom: 2,
              }}>Kenyan Vendor</span>{' '}
              to Scale.
            </h2>
            <p style={{
              fontSize: '1.05rem', color: '#475569',
              lineHeight: 1.75, fontWeight: 400, maxWidth: 460,
            }}>
              hlynk was built to bridge the gap in business clarity. We give vendors the tools to track every shilling, understand their real profit, and grow with confidence — all in Swahili-friendly design.
            </p>

            {/* Value tags */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Transparency', 'Growth', 'Reliability', 'Local-First'].map(val => (
                <span key={val} style={{
                  padding: '6px 16px', borderRadius: 999,
                  background: '#fff', border: '1.5px solid #e2e8f0',
                  fontSize: '0.7rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  color: '#334155', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                }}>
                  {val}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Mission card */}
          <div style={{
            background: '#0D4A3E',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 24px 60px rgba(13,74,62,0.25)',
          }}>
            {/* Soft glow */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(52,211,153,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={18} color="#34d399" />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                Our Mission
              </span>
            </div>

            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Every small business deserves enterprise-grade clarity.
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '1.75rem' }}>
              In Kenya's vibrant economy, local merchants handle M-Pesa, cash, and bank transactions simultaneously — yet most rely on paper notebooks. hlynk digitalises the ledger for every merchant, turning raw numbers into actionable profit insights.
            </p>

            {/* Mini stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { val: '5 min', label: 'To set up your shop' },
                { val: '100%', label: 'M-Pesa compatible' },
              ].map(s => (
                <div key={s.label} style={{
                  background: 'rgba(255,255,255,0.07)', borderRadius: '0.85rem',
                  padding: '1rem', border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Three pillars ── */}
        <div style={{ marginBottom: '3rem' }}>
          <h3 style={{
            fontSize: '0.72rem', fontWeight: 900, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#94a3b8', marginBottom: '2rem',
          }}>
            Built on three principles
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: 'Professional Integrity',
                desc: 'Your business data is protected by bank-grade encryption. hlynk is built on trust — your records, your access.',
                accent: '#0D4A3E',
                bg: '#f0fdf4',
              },
              {
                icon: CheckCircle2,
                title: 'Local Relevance',
                desc: 'Built specifically for Kenya. From deep M-Pesa integration to local county listings, we speak your language.',
                accent: '#0369a1',
                bg: '#f0f9ff',
              },
              {
                icon: BarChart3,
                title: 'Data-Driven Success',
                desc: "What gets measured gets managed. Our dashboard turns daily sales records into clear growth insights you can act on.",
                accent: '#7c3aed',
                bg: '#faf5ff',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2rem',
                  borderRadius: '1.25rem',
                  background: '#fff',
                  border: '1.5px solid #e8f0eb',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.09)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = pillar.accent + '44'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'none'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.04)'
                  ;(e.currentTarget as HTMLDivElement).style.borderColor = '#e8f0eb'
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: pillar.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <pillar.icon size={22} color={pillar.accent} />
                </div>
                <h4 style={{
                  fontSize: '1rem', fontWeight: 800,
                  color: '#0a1628', marginBottom: '0.6rem',
                  letterSpacing: '-0.01em',
                }}>
                  {pillar.title}
                </h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.7 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
