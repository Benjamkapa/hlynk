import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Phone, MessageSquare, Filter, ChevronLeft, ChevronRight, User, MoreHorizontal, CheckCircle, XCircle } from 'lucide-react'
import { requestsApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmtDate } from '../admin/hl-design-system'

const STATUSES = ['ALL', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED']

const statusMeta: Record<string, { cls: string; label: string; icon: any }> = {
  PENDING:   { cls: 'hl-badge-trial',   label: 'PENDING',   icon: Loader2 },
  ACCEPTED:  { cls: 'hl-badge-active',  label: 'ACCEPTED',  icon: CheckCircle },
  COMPLETED: { cls: 'hl-badge-active',  label: 'COMPLETED', icon: CheckCircle },
  CANCELLED: { cls: 'hl-badge-expired', label: 'CANCELLED', icon: XCircle },
}

const nextActions: Record<string, { label: string; status: string; cls: string; icon: any }[]> = {
  PENDING: [
    { label: 'Accept',  status: 'ACCEPTED',  cls: 'hl-btn-primary', icon: CheckCircle },
    { label: 'Decline', status: 'CANCELLED', cls: 'hl-btn-ghost danger', icon: XCircle },
  ],
  ACCEPTED: [
    { label: 'Finish',  status: 'COMPLETED', cls: 'hl-btn-primary', icon: CheckCircle },
    { label: 'Cancel',  status: 'CANCELLED', cls: 'hl-btn-ghost danger', icon: XCircle },
  ],
}

export default function RequestsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = useState('ALL')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['requests', filter, page],
    queryFn: () => requestsApi.list({ status: filter === 'ALL' ? undefined : filter, page }),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => requestsApi.updateStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['requests'] }); toast.success('Lead status updated') },
    onError: () => toast.error('Update synchronization failed'),
  })

  const requests = data?.data?.requests || []
  const total = data?.data?.total || 0
  const pages = data?.data?.pages || 1

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Service Leads</h1>
            <p className="hl-page-subtitle">Track and manage incoming customer inquiries · {total} active</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
             {/* Potential global actions here */}
          </div>
        </div>

        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .15s both' }}>
          {/* Status Segment Control */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface2)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', padding: '4px', borderRadius: 12, border: '1px solid var(--border)' }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setFilter(s); setPage(1) }}
                  style={{ 
                    padding: '8px 16px', borderRadius: 8, fontSize: '.72rem', fontWeight: 800, transition: 'all .25s', border: 'none', cursor: 'pointer',
                    background: filter === s ? 'var(--mint)' : 'transparent',
                    color: filter === s ? '#fff' : 'var(--ink3)',
                    boxShadow: filter === s ? '0 4px 12px rgba(29,186,135,.2)' : 'none'
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
               <Filter size={14} color="var(--ink3)" />
               <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>FILTERING BY {filter}</span>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <Loader2 size={32} style={{ animation: 'hl-spin .7s linear infinite', margin: '0 auto 16px', color: 'var(--ink3)' }} />
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>FETCHING LEADS…</p>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: '100px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <MessageSquare size={30} color="var(--ink3)" />
              </div>
              <h4 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>Quiet at the moment</h4>
              <p style={{ fontFamily: "'Figtree',sans-serif", color: 'var(--ink3)', fontSize: '.88rem', maxWidth: 300, margin: '0 auto 24px' }}>
                {filter !== 'ALL' ? `You have no leads with status ${filter}.` : 'New customer requests will appear here once they find your profile.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="hl-table">
                <thead>
                  <tr>
                    <th>Lead Identity</th>
                    <th>Requested Service</th>
                    <th>Customer Brief</th>
                    <th>Inflow Date</th>
                    <th>Status</th>
                    <th>Communications</th>
                    <th style={{ textAlign: 'right' }}>Lead Operations</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any, i: number) => {
                    const meta = statusMeta[req.status] || { cls: 'hl-badge-neutral', label: req.status, icon: MoreHorizontal }
                    return (
                      <tr key={req.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .025}s both` }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '.9rem', color: 'var(--forest)' }}>
                              {req.customerName?.charAt(0).toUpperCase() || <User size={16} />}
                            </div>
                            <div>
                              <p style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--ink)' }}>{req.customerName}</p>
                              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>{req.customerPhone}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="hl-badge hl-badge-neutral" style={{ padding: '4px 10px' }}>
                            {req.service?.name || 'General Inquiry'}
                          </span>
                        </td>
                        <td style={{ maxWidth: 220 }}><p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.82rem', color: 'var(--ink3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.message || '—'}</p></td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>{fmtDate(req.createdAt)}</td>
                        <td>
                           <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <meta.icon size={12} className={meta.cls === 'hl-badge-trial' ? 'hl-spin' : ''} style={{ color: `var(--${meta.cls.split('-')[2]})` }} />
                              <span className={`hl-badge ${meta.cls}`} style={{ padding: '4px 12px' }}>{meta.label}</span>
                           </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <a href={`tel:${req.customerPhone}`} className="hl-btn-ghost" style={{ width: 32, height: 32, borderRadius: 10, padding: 0, justifyContent: 'center' }} title="Voice Call">
                              <Phone size={14} />
                            </a>
                            <a href={`https://wa.me/${req.customerPhone?.replace(/^0/, '254')}`} target="_blank" rel="noreferrer"
                              className="hl-btn-ghost" style={{ width: 32, height: 32, borderRadius: 10, padding: 0, justifyContent: 'center', color: '#25D366' }} title="Secure WhatsApp">
                              <MessageSquare size={14} />
                            </a>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            {(nextActions[req.status] || []).map(({ label, status, cls, icon: Icon }) => (
                              <button key={status} onClick={() => updateMut.mutate({ id: req.id, status })}
                                disabled={updateMut.isPending} className={cls} style={{ padding: '6px 12px', fontSize: '.7rem', borderRadius: 8 }}>
                                <Icon size={12} /> {label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>PAGE {page} OF {pages}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="hl-btn-outline" style={{ padding: '8px 16px', fontSize: '.78rem', borderRadius: 8 }}><ChevronLeft size={14} /> PREV</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="hl-btn-outline" style={{ padding: '8px 16px', fontSize: '.78rem', borderRadius: 8 }}>NEXT <ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
