import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search, Ban, CheckCircle, ChevronUp,
  Loader2, ChevronLeft, ChevronRight, Filter
} from 'lucide-react'
import { adminApi } from '../../lib/api/providers'
import { ADMIN_CSS, avatarHue } from './hl-design-system'

const planBadge  = (p: string) => p === 'ENTERPRISE' ? 'hl-badge-trial' : 'hl-badge-active'
const statusBadge = (s: string) => {
  if (s === 'ACTIVE')    return 'hl-badge-active'
  if (s === 'TRIAL')     return 'hl-badge-trial'
  if (s === 'EXPIRED')   return 'hl-badge-expired'
  return 'hl-badge-suspended'
}

export default function AdminTenantsPage() {
  const qc = useQueryClient()
  const location = useLocation()
  
  const [activeTab, setActiveTab] = useState(location.pathname.includes('/activity') ? 'activity' : 'all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setActiveTab(location.pathname.includes('/activity') ? 'activity' : 'all')
  }, [location.pathname])

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
  const total   = data?.data?.total   || 0
  const pages   = data?.data?.pages   || 1

  const handleSearch = (v: string) => {
    setSearch(v)
    clearTimeout((window as any)._hl_search_timer)
    ;(window as any)._hl_search_timer = setTimeout(() => { setDebouncedSearch(v); setPage(1) }, 380)
  }

  const kpis = [
    { label: 'Total Tenants',  value: total, accent: '#1DBA87' },
    { label: 'Active',         value: tenants.filter((t: any) => t.isActive).length, accent: '#1DBA87' },
    { label: 'Suspended',      value: tenants.filter((t: any) => !t.isActive).length, accent: '#EF4444' },
    { label: 'Avg Services',   value: '4.2', accent: '#F5A623' },
  ]

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Tenants Management</h1>
            <p className="hl-page-subtitle">Monitor and manage all registered businesses — {total} total</p>
          </div>

          <div className="hl-tab-bar" style={{ marginTop: 20 }}>
            <button className={`hl-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Providers</button>
            <button className={`hl-tab ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>Activity Monitor</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="hl-grid-4" style={{ marginBottom: 22 }}>
          {kpis.map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '20px', animation: `hl-up .45s ease ${i * .06}s both` }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: k.accent, marginBottom: 12 }} />
              <p className="hl-kpi-label">{k.label}</p>
              <p className="hl-kpi-value">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .28s both' }}>

          {/* Toolbar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}>
                <Search size={14} />
              </span>
              <input className="hl-form-input" placeholder="Search by name or slug…"
                style={{ paddingLeft: 34, fontSize: '.82rem' }}
                value={search} onChange={e => handleSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={14} color="var(--ink3)" />
              <select className="hl-form-input select-input" style={{ width: 'auto', minWidth: 140, fontSize: '.82rem' }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="EXPIRED">Expired</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <Loader2 size={22} style={{ animation: 'hl-spin .7s linear infinite', color: 'var(--ink3)' }} />
            </div>
          ) : tenants.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink3)', fontFamily: "'Figtree',sans-serif", fontWeight: 600 }}>
              No tenants found
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="hl-table">
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
                  {tenants.map((t: any, i: number) => {
                    const hue = avatarHue(i)
                    return (
                      <tr key={t.id} style={{ animation: `hl-fade .3s ease ${i * .025}s both` }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 6, background: `hsl(${hue},38%,88%)`, border: `1px solid hsl(${hue},38%,78%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '.72rem', color: `hsl(${hue},55%,32%)`, flexShrink: 0 }}>
                              {t.businessName?.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: '.86rem' }}>{t.businessName}</span>
                          </div>
                        </td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.63rem', color: 'var(--ink3)' }}>/{t.slug}</td>
                        <td><span className={`hl-badge ${planBadge(t.subscription?.planName || 'TRIAL')}`}>{t.subscription?.planName || 'TRIAL'}</span></td>
                        <td><span className={`hl-badge ${statusBadge(t.subscription?.status || 'TRIAL')}`}>{t.subscription?.status || '—'}</span></td>
                        <td style={{ fontSize: '.85rem' }}>{t._count?.services ?? 0}</td>
                        <td style={{ fontSize: '.85rem' }}>{t._count?.requests ?? 0}</td>
                        <td style={{ fontSize: '.85rem' }}>{t._count?.users ?? 0}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 4 }}>
                            {t.isActive ? (
                              <button className="hl-btn-ghost danger" title="Suspend"
                                disabled={suspendMut.isPending}
                                onClick={() => suspendMut.mutate(t.id)}>
                                <Ban size={13} />
                              </button>
                            ) : (
                              <button className="hl-btn-ghost" title="Activate"
                                disabled={activateMut.isPending}
                                onClick={() => activateMut.mutate(t.id)}
                                style={{ color: 'var(--mint)' }}>
                                <CheckCircle size={13} />
                              </button>
                            )}
                            {t.subscription?.planName !== 'BASIC' && (
                              <button className="hl-btn-ghost" title="Upgrade to Basic"
                                disabled={upgradeMut.isPending}
                                onClick={() => upgradeMut.mutate({ id: t.id, plan: 'BASIC' })}>
                                <ChevronUp size={13} />
                              </button>
                            )}
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
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)' }}>
                Page {page} of {pages}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="hl-btn-outline" style={{ padding: '7px 12px', fontSize: '.75rem' }}
                  disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={13} /> Prev
                </button>
                <button className="hl-btn-outline" style={{ padding: '7px 12px', fontSize: '.75rem' }}
                  disabled={page === pages} onClick={() => setPage(p => Math.min(pages, p + 1))}>
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}