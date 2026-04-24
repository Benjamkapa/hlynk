import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, X, Package, Search, Clock, Tag } from 'lucide-react'
import { servicesApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmt } from '../admin/hl-design-system'

type Service = { id: string; name: string; description?: string; price?: number; duration?: number }

function ServiceModal({ initial, onSave, onClose, saving }: {
  initial?: Partial<Service>; onSave: (d: any) => void; onClose: () => void; saving: boolean
}) {
  const [form, setForm] = useState({ 
    name: initial?.name || '', 
    description: initial?.description || '', 
    price: initial?.price?.toString() || '', 
    duration: initial?.duration?.toString() || '' 
  })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(13,36,25,.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="hl-card" style={{ width: '100%', maxWidth: 480, animation: 'hl-up .4s ease both', overflow: 'hidden' }}>
        <div className="hl-card-header" style={{ background: 'var(--surface2)', padding: '18px 24px' }}>
          <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase' }}>{initial?.id ? 'Edit Service' : 'Define New Service'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink3)' }}><X size={18} /></button>
        </div>
        <div className="hl-card-body" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="hl-form-label">Service Label</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Professional Consulting" className="hl-form-input" style={{ borderRadius: 'var(--radius-md)' }} />
            </div>
            <div>
              <label className="hl-form-label">Service Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Detailed breakdown of what this service entails…" className="hl-form-input" style={{ resize: 'none', borderRadius: 'var(--radius-md)' }} />
            </div>
            <div className="hl-grid-2">
              <div>
                <label className="hl-form-label">Base Price (KES)</label>
                <div className="hl-input-wrap">
                   <span className="hl-input-icon"><Tag size={14} /></span>
                   <input value={form.price} onChange={e => set('price', e.target.value)} type="number" placeholder="0.00" className="hl-form-input icon-left" style={{ borderRadius: 'var(--radius-md)' }} />
                </div>
              </div>
              <div>
                <label className="hl-form-label">Duration (Min)</label>
                <div className="hl-input-wrap">
                   <span className="hl-input-icon"><Clock size={14} /></span>
                   <input value={form.duration} onChange={e => set('duration', e.target.value)} type="number" placeholder="45" className="hl-form-input icon-left" style={{ borderRadius: 'var(--radius-md)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 12, background: 'var(--surface2)' }}>
          <button onClick={() => onSave({ name: form.name, description: form.description || undefined, price: form.price ? Number(form.price) : undefined, duration: form.duration ? Number(form.duration) : undefined })}
            disabled={!form.name.trim() || saving} className="hl-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? <Loader2 size={16} style={{ animation: 'hl-spin .7s linear infinite' }} /> : (initial?.id ? 'Commit Changes' : 'Register Service')}
          </button>
          <button onClick={onClose} className="hl-btn-outline" style={{ borderRadius: 'var(--radius-md)' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | Service | null>(null)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['services'], queryFn: servicesApi.list })
  const services: Service[] = (data?.data || []).filter((s: Service) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const createMut = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setModal(null); toast.success('Service published!') },
    onError: () => toast.error('Publication failed'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setModal(null); toast.success('Service updated!') },
    onError: () => toast.error('Update failed'),
  })
  const deleteMut = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Service archived') },
    onError: () => toast.error('Deletion failed'),
  })

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        {modal && (
          <ServiceModal
            initial={modal === 'create' ? {} : modal as Service}
            onSave={d => modal === 'create' ? createMut.mutate(d) : updateMut.mutate({ id: (modal as Service).id, data: d })}
            onClose={() => setModal(null)}
            saving={createMut.isPending || updateMut.isPending}
          />
        )}

        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Service Portfolio</h1>
            <p className="hl-page-subtitle">Configure your public offering and pricing model</p>
          </div>
          <button onClick={() => setModal('create')} className="hl-btn-primary">
            <Plus size={16} /> New Listing
          </button>
        </div>

        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .15s both' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface2)' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}><Search size={15} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter listings…" className="hl-form-input icon-left" style={{ borderRadius: 'var(--radius-md)' }} />
            </div>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>{services.length} ACTIVE SERVICES</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <Loader2 size={32} style={{ animation: 'hl-spin .7s linear infinite', margin: '0 auto 16px', color: 'var(--ink3)' }} />
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>SYNCHRONIZING PORTFOLIO…</p>
            </div>
          ) : services.length === 0 ? (
            <div style={{ padding: '100px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Package size={32} color="var(--ink3)" />
              </div>
              <h4 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>Empty Portfolio</h4>
              <p style={{ fontFamily: "'Figtree',sans-serif", color: 'var(--ink3)', fontSize: '.88rem', maxWidth: 300, margin: '0 auto 24px' }}>
                {search ? 'No services match your current filter.' : 'Launch your first service listing to start receiving customer requests.'}
              </p>
              {!search && <button onClick={() => setModal('create')} className="hl-btn-primary" style={{ margin: '0 auto' }}><Plus size={16} /> Create Listing</button>}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="hl-table">
                <thead>
                  <tr>
                    <th>Service Identity</th>
                    <th>Full Description</th>
                    <th>Standard Rate</th>
                    <th>Estimated Time</th>
                    <th style={{ textAlign: 'right' }}>Management</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc, i) => (
                    <tr key={svc.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .025}s both` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(29,186,135,.1)', border: '1px solid rgba(29,186,135,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mint)', flexShrink: 0 }}>
                            <Package size={16} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{svc.name}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 300 }}><p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.82rem', color: 'var(--ink3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{svc.description || 'No description provided'}</p></td>
                      <td><span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--forest)' }}>{svc.price ? fmt(svc.price) : '—'}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink2)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', fontWeight: 600 }}>
                           <Clock size={12} /> {svc.duration ? `${svc.duration} MIN` : '—'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                          <button onClick={() => setModal(svc)} className="hl-btn-ghost" style={{ borderRadius: 8, padding: '6px 10px' }}><Pencil size={14} /></button>
                          <button onClick={() => { if (confirm('Permanently remove this service?')) deleteMut.mutate(svc.id) }}
                            className="hl-btn-ghost danger" style={{ borderRadius: 8, padding: '6px 10px' }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
