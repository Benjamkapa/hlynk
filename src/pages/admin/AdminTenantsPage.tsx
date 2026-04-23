import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Search, ChevronUp, Ban, CheckCircle, Filter } from 'lucide-react'
import { adminApi } from '../../lib/api/providers'

const planColors: Record<string, string> = { TRIAL: 'badge-trial', BASIC: 'badge-active', PRO: 'badge-active' }
const statusColors: Record<string, string> = { TRIAL: 'badge-trial', ACTIVE: 'badge-active', EXPIRED: 'badge-expired', SUSPENDED: 'badge-suspended' }

export default function AdminTenantsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants', debouncedSearch, page],
    queryFn: () => adminApi.getTenants({ page, search: debouncedSearch || undefined }),
  })

  const suspendMut = useMutation({
    mutationFn: adminApi.suspendTenant,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast.success('Tenant suspended') },
    onError: () => toast.error('Action failed'),
  })
  const activateMut = useMutation({
    mutationFn: adminApi.activateTenant,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast.success('Tenant activated') },
    onError: () => toast.error('Action failed'),
  })
  const upgradeMut = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) => adminApi.upgradePlan(id, plan),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-tenants'] }); toast.success('Plan upgraded') },
    onError: () => toast.error('Action failed'),
  })

  const tenants = data?.data?.tenants || []
  const total = data?.data?.total || 0
  const pages = data?.data?.pages || 1

  const handleSearch = (v: string) => {
    setSearch(v)
    clearTimeout((window as any)._searchTimer)
    ;(window as any)._searchTimer = setTimeout(() => { setDebouncedSearch(v); setPage(1) }, 400)
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title font-ubuntu text-2xl">Tenants Management</h1>
          <p className="page-subtitle">Monitor and manage all registered businesses — {total} total</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          {/* Search bar */}
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search by business name or slug…" className="search-input w-full" />
            </div>
            <Filter size={15} className="text-muted-foreground" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
          ) : tenants.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-medium text-foreground">No tenants found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>Services</th>
                    <th>Requests</th>
                    <th>Users</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t: any) => (
                    <tr key={t.id} className="animate-fade-in">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">{t.businessName?.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-sm text-foreground">{t.businessName}</span>
                        </div>
                      </td>
                      <td className="text-xs font-mono text-muted-foreground">/{t.slug}</td>
                      <td><span className={`badge ${planColors[t.subscription?.planName] || 'badge-trial'}`}>{t.subscription?.planName || 'TRIAL'}</span></td>
                      <td><span className={`badge ${statusColors[t.subscription?.status] || 'badge-trial'}`}>{t.subscription?.status || '—'}</span></td>
                      <td className="text-sm">{t._count?.services ?? 0}</td>
                      <td className="text-sm">{t._count?.requests ?? 0}</td>
                      <td className="text-sm">{t._count?.users ?? 0}</td>
                      <td>
                        <div className="flex gap-1">
                          {t.isActive ? (
                            <button onClick={() => suspendMut.mutate(t.id)} disabled={suspendMut.isPending}
                              title="Suspend" className="btn-ghost p-1.5 hover:!text-destructive hover:!bg-red-50">
                              <Ban size={14} />
                            </button>
                          ) : (
                            <button onClick={() => activateMut.mutate(t.id)} disabled={activateMut.isPending}
                              title="Activate" className="btn-ghost p-1.5 hover:!text-primary hover:!bg-primary/10">
                              <CheckCircle size={14} />
                            </button>
                          )}
                          {t.subscription?.planName !== 'BASIC' && (
                            <button onClick={() => upgradeMut.mutate({ id: t.id, plan: 'BASIC' })} disabled={upgradeMut.isPending}
                              title="Upgrade to Basic" className="btn-ghost p-1.5 hover:!text-primary hover:!bg-primary/10">
                              <ChevronUp size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">Page {page} of {pages}</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Prev</button>
                <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary text-xs py-1.5 px-3">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
