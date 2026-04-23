import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, X, Package, Search } from 'lucide-react'
import { servicesApi } from '../../lib/api/providers'

type Service = { id: string; name: string; description?: string; price?: number; duration?: number }

function ServiceModal({ initial, onSave, onClose, saving }: {
  initial?: Partial<Service>; onSave: (d: any) => void; onClose: () => void; saving: boolean
}) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '', price: initial?.price?.toString() || '', duration: initial?.duration?.toString() || '' })
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{initial?.id ? 'Edit Service' : 'Add New Service'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="form-label">Service Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Haircut & Style" className="form-input" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief description of this service…" className="form-input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Price (KES)</label>
              <input value={form.price} onChange={e => set('price', e.target.value)} type="number" placeholder="500" className="form-input" />
            </div>
            <div>
              <label className="form-label">Duration (minutes)</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} type="number" placeholder="30" className="form-input" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border">
          <button onClick={() => onSave({ name: form.name, description: form.description || undefined, price: form.price ? Number(form.price) : undefined, duration: form.duration ? Number(form.duration) : undefined })}
            disabled={!form.name.trim() || saving} className="btn-primary flex-1 justify-center">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : initial?.id ? 'Update Service' : 'Add Service'}
          </button>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setModal(null); toast.success('Service added!') },
    onError: () => toast.error('Failed to add service'),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setModal(null); toast.success('Service updated!') },
    onError: () => toast.error('Failed to update service'),
  })
  const deleteMut = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Service removed') },
    onError: () => toast.error('Failed to delete service'),
  })

  return (
    <div>
      {modal && (
        <ServiceModal
          initial={modal === 'create' ? {} : modal as Service}
          onSave={d => modal === 'create' ? createMut.mutate(d) : updateMut.mutate({ id: (modal as Service).id, data: d })}
          onClose={() => setModal(null)}
          saving={createMut.isPending || updateMut.isPending}
        />
      )}

      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Services</h1>
          <p className="page-subtitle">Manage the services you offer to customers</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div className="page-body">
        <div className="card">
          {/* Search & filter bar */}
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search services…" className="search-input w-full" />
            </div>
            <span className="text-sm text-muted-foreground">{services.length} service{services.length !== 1 ? 's' : ''}</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : services.length === 0 ? (
            <div className="py-20 text-center">
              <Package size={40} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">No services found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Try a different search term' : 'Add your first service to attract customers'}
              </p>
              {!search && <button onClick={() => setModal('create')} className="btn-primary mx-auto mt-4"><Plus size={15} />Add Service</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Description</th>
                    <th>Price (KES)</th>
                    <th>Duration</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((svc) => (
                    <tr key={svc.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{svc.name}</span>
                        </div>
                      </td>
                      <td className="max-w-[200px]"><p className="text-muted-foreground text-sm truncate">{svc.description || '—'}</p></td>
                      <td className="font-semibold text-primary">{svc.price ? `${Number(svc.price).toLocaleString()}` : '—'}</td>
                      <td className="text-sm text-muted-foreground">{svc.duration ? `${svc.duration} min` : '—'}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModal(svc)} className="btn-ghost p-1.5"><Pencil size={14} /></button>
                          <button onClick={() => { if (confirm('Delete this service?')) deleteMut.mutate(svc.id) }}
                            className="btn-ghost p-1.5 hover:!text-destructive hover:!bg-red-50"><Trash2 size={14} /></button>
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
    </div>
  )
}
