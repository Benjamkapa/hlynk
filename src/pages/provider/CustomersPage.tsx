import { useState } from 'react'
import { Users, Search, Plus, Phone, Mail, MoreHorizontal, Loader2, UserPlus, Calendar, ExternalLink } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { customersApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmtDate } from '../admin/hl-design-system'

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.list({ search })
  })

  const customers = customersData?.data || []

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Client Directory</h1>
            <p className="hl-page-subtitle">Unified registry of your business relationships and history</p>
          </div>
          <button className="hl-btn-primary">
            <Plus size={16} /> Register Client
          </button>
        </div>

        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .15s both' }}>
          {/* Search Toolbar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface2)' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}><Search size={15} /></span>
              <input 
                type="text" 
                placeholder="Search by client name or mobile..." 
                className="hl-form-input icon-left"
                style={{ borderRadius: 'var(--radius-md)', paddingLeft: 40 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
               <Users size={14} color="var(--ink3)" />
               <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>{customers.length} REGISTERED ENTITIES</span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            {isLoading ? (
              <div style={{ padding: '80px 0', textAlign: 'center' }}>
                <Loader2 size={32} style={{ animation: 'hl-spin .7s linear infinite', margin: '0 auto 16px', color: 'var(--ink3)' }} />
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>RETRIEVING CLIENT DATA…</p>
              </div>
            ) : customers.length === 0 ? (
              <div style={{ padding: '100px 24px', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <UserPlus size={32} color="var(--ink3)" />
                </div>
                <h4 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>No Clients Recorded</h4>
                <p style={{ fontFamily: "'Figtree',sans-serif", color: 'var(--ink3)', fontSize: '.88rem', maxWidth: 340, margin: '0 auto 24px' }}>
                  {search ? 'No clients match your current search criteria.' : 'Transactions will automatically populate your directory as you record sales.'}
                </p>
                {!search && <button className="hl-btn-primary" style={{ margin: '0 auto' }}><Plus size={16} /> Add First Client</button>}
              </div>
            ) : (
              <table className="hl-table">
                <thead>
                  <tr>
                    <th>Client Identity</th>
                    <th>Connectivity</th>
                    <th>Engagement Frequency</th>
                    <th>Last Interaction</th>
                    <th style={{ textAlign: 'right' }}>Analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any, i: number) => (
                    <tr key={c.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .025}s both` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '.9rem', color: 'var(--mint)' }}>
                            {c.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: '.92rem', color: 'var(--ink)' }}>{c.name}</p>
                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>ID: {c.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink2)', fontWeight: 700, fontSize: '.78rem' }}>
                            <Phone size={12} /> {c.phone}
                          </div>
                          {c.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink3)', fontSize: '.7rem', fontWeight: 500 }}>
                              <Mail size={11} /> {c.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <div style={{ padding: '4px 10px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={12} color="var(--mint)" />
                              <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '.9rem', color: 'var(--ink)' }}>{c.visits || 0}</span>
                           </div>
                           <span style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>In-Store Visits</span>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>{c.lastVisit ? fmtDate(c.lastVisit) : 'NO HISTORY'}</p>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="hl-btn-ghost" style={{ width: 36, height: 36, padding: 0, justifyContent: 'center', borderRadius: 10 }}>
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
