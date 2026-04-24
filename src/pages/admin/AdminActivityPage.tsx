import { useState } from 'react'
import {
  Activity, Clock, User, Shield, AlertTriangle, 
  ArrowUpRight, ExternalLink, Filter, Search
} from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

const ACTIVITIES = [
  { id: 1, type: 'LOGIN', user: 'Mama Njeri', business: 'Njeri Beauty Salon', time: '2 mins ago', details: 'Web login from Nairobi, KE', status: 'SUCCESS' },
  { id: 2, type: 'SALE', user: 'Mama Njeri', business: 'Njeri Beauty Salon', time: '14 mins ago', details: 'Recorded sale: KES 1,200 (Haircut)', status: 'SUCCESS' },
  { id: 3, type: 'INV_LOW', user: 'System', business: 'Kamau Electronics', time: '1 hour ago', details: 'Low stock alert: AAA Batteries (5 left)', status: 'WARNING' },
  { id: 4, type: 'PLAN_UP', user: 'Aisha Osman', business: 'Clean & Shine', time: '3 hours ago', details: 'Upgraded to Growth Plan', status: 'SUCCESS' },
  { id: 5, type: 'SUSPEND', user: 'Admin (You)', business: 'Old Workshop', time: '5 hours ago', details: 'Manual suspension due to non-payment', status: 'ALERT' },
  { id: 6, type: 'NEW_REQ', user: 'Customer', business: 'Njeri Beauty Salon', time: 'Yesterday', details: 'New service request received via WhatsApp link', status: 'SUCCESS' },
  { id: 7, type: 'LOGIN', user: 'John Kamau', business: 'Kamau Electronics', time: 'Yesterday', details: 'Web login from Thika, KE', status: 'SUCCESS' },
]

export default function AdminActivityPage() {
  const [search, setSearch] = useState('')

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>
        
        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Platform Activity</h1>
            <p className="hl-page-subtitle">Real-time audit log and event monitoring</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}>
                <Search size={14} />
              </span>
              <input className="hl-form-input" placeholder="Filter by business…" 
                style={{ paddingLeft: 34, width: 220, fontSize: '.82rem' }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="hl-btn-outline"><Filter size={14} /> Filter</button>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="hl-card" style={{ animation: 'hl-up .5s ease both' }}>
          <div className="hl-card-header" style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="hl-live" />
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase' }}>Live Audit Stream</h3>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '.58rem', color: 'var(--ink3)', letterSpacing: '.06em' }}>ALL SYSTEM EVENTS</p>
          </div>

          <div style={{ padding: '10px 0' }}>
            {ACTIVITIES.map((a, i) => (
              <div key={a.id} className="hl-activity-item" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 1fr 140px 100px', 
                  alignItems: 'center', 
                  padding: '16px 24px', 
                  borderBottom: i < ACTIVITIES.length - 1 ? '1px solid var(--border)' : 'none',
                  animation: `hl-fade .3s ease ${i * .05}s both`
                }}>
                
                {/* Type Icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: 8, 
                    background: a.status === 'ALERT' ? 'rgba(239,68,68,.1)' : a.status === 'WARNING' ? 'rgba(245,166,35,.1)' : 'rgba(29,186,135,.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: a.status === 'ALERT' ? '#EF4444' : a.status === 'WARNING' ? '#D97706' : '#1DBA87'
                  }}>
                    {a.type === 'LOGIN' ? <User size={14} /> : a.type === 'SALE' ? <ArrowUpRight size={14} /> : <Activity size={14} />}
                  </div>
                </div>

                {/* Main Text */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2 }}>
                    <span style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{a.business}</span>
                    <span style={{ fontSize: '.75rem', color: 'var(--ink3)' }}>·</span>
                    <span style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600, fontSize: '.78rem', color: 'var(--ink2)' }}>{a.user}</span>
                  </div>
                  <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '.8rem', color: 'var(--ink3)' }}>{a.details}</p>
                </div>

                {/* Time */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, color: 'var(--ink3)' }}>
                    <Clock size={12} />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '.65rem' }}>{a.time}</span>
                  </div>
                </div>

                {/* Action */}
                <div style={{ textAlign: 'right' }}>
                  <button className="hl-arrow-btn" style={{ width: 30, height: 30 }}><ExternalLink size={12} /></button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <button style={{ 
              background: 'none', border: 'none', color: 'var(--forest)', 
              fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '.75rem', 
              textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer' 
            }}>Load More History</button>
          </div>
        </div>

        {/* System Health Snapshot */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {[
            { label: 'Event Throughput', value: '142/min', Icon: Activity, color: '#1DBA87' },
            { label: 'Security Blocks', value: '12 Today', Icon: Shield, color: '#3B82F6' },
            { label: 'Active Errors', value: '0 Detected', Icon: AlertTriangle, color: '#EF4444' },
          ].map((s, i) => (
            <div key={i} className="hl-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.Icon size={16} />
              </div>
              <div>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '.55rem', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</p>
                <p style={{ fontFamily: "'Saira', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)', lineHeight: 1.2 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}
