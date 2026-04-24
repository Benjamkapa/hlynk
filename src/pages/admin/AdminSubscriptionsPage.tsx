import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { adminApi } from '../../lib/api/providers'
import {
  CheckCircle2, Clock, AlertTriangle, Search,
  ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight
} from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

const TABS = [
  { id: 'active',  label: 'Active',  Icon: CheckCircle2, color: '#1DBA87' },
  { id: 'trials',  label: 'Trials',  Icon: Clock,        color: '#F5A623' },
  { id: 'expired', label: 'Expired', Icon: AlertTriangle, color: '#EF4444' },
]

const statusBadge = (s: string) => {
  if (s === 'ACTIVE')  return 'hl-badge-active'
  if (s === 'TRIAL')   return 'hl-badge-trial'
  if (s === 'EXPIRED') return 'hl-badge-expired'
  return 'hl-badge-suspended'
}

export default function AdminSubscriptionsPage() {
  const location = useLocation()
  
  const getInitialTab = () => {
    if (location.pathname.includes('/trials')) return 'trials'
    if (location.pathname.includes('/expired')) return 'expired'
    return 'active'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setActiveTab(getInitialTab())
  }, [location.pathname])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => adminApi.getTenants({ limit: 100 }),
  })

  const tenants = data?.data?.tenants || []
  const filtered = tenants.filter((t: any) => {
    const st = t.subscription?.status || 'TRIAL'
    if (activeTab === 'active'  && st !== 'ACTIVE')  return false
    if (activeTab === 'trials'  && st !== 'TRIAL')   return false
    if (activeTab === 'expired' && st !== 'EXPIRED') return false
    if (search && !t.businessName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const perPage = 8
  const pages = Math.ceil(filtered.length / perPage) || 1
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  const kpis = [
    { label: 'Active Subscriptions', value: tenants.filter((t: any) => t.subscription?.status === 'ACTIVE').length, trend: '+18%', up: true, Icon: CheckCircle2, accent: '#1DBA87' },
    { label: 'Open Trials',          value: tenants.filter((t: any) => t.subscription?.status === 'TRIAL').length,  trend: '-3%',  up: false, Icon: Clock, accent: '#F5A623' },
    { label: 'Monthly Churn',        value: '4.2%', trend: '-8%', up: false, Icon: AlertTriangle, accent: '#EF4444' },
  ]

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Subscription Management</h1>
            <p className="hl-page-subtitle">Monitor plan health, conversion rates & churn</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="hl-grid-3" style={{ marginBottom: 22 }}>
          {kpis.map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '22px', animation: `hl-up .45s ease ${i * .07}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${k.accent}14`, border: `1px solid ${k.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>
                  <k.Icon size={15} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }} className={`hl-trend ${k.up ? 'hl-trend-up' : 'hl-trend-dn'}`}>
                  {k.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}{k.trend}
                </div>
              </div>
              <p className="hl-kpi-label">{k.label}</p>
              <p className="hl-kpi-value">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Main Table Card */}
        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .24s both' }}>

          {/* Toolbar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div className="hl-tab-bar">
              {TABS.map(t => (
                <button key={t.id} className={`hl-tab${activeTab === t.id ? ' active' : ''}`}
                  onClick={() => { setActiveTab(t.id); setPage(1) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <t.Icon size={13} color={activeTab === t.id ? t.color : 'var(--ink3)'} />
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}>
                <Search size={14} />
              </span>
              <input className="hl-form-input" placeholder="Search businesses…"
                style={{ paddingLeft: 34, width: 230, fontSize: '.82rem' }}
                value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="hl-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink3)' }}>Loading…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink3)' }}>No subscriptions found</td></tr>
                ) : paginated.map((t: any, i: number) => (
                  <tr key={t.id} style={{ animation: `hl-fade .3s ease ${i * .03}s both` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(13,36,25,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '.72rem', color: 'var(--forest)', flexShrink: 0 }}>
                          {t.businessName?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700 }}>{t.businessName}</span>
                      </div>
                    </td>
                    <td><span className="hl-badge hl-badge-active">{t.subscription?.planName || 'TRIAL'}</span></td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.68rem', color: 'var(--ink3)' }}>
                      {new Date(t.subscription?.startDate || t.createdAt).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.68rem', color: 'var(--ink3)' }}>
                      {t.subscription?.endDate ? new Date(t.subscription.endDate).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`hl-badge ${statusBadge(t.subscription?.status || 'TRIAL')}`}>
                        {t.subscription?.status || 'TRIAL'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button style={{ background: 'none', border: 'none', fontFamily: "'JetBrains Mono',monospace", fontSize: '.57rem', fontWeight: 700, letterSpacing: '.06em', color: 'var(--forest)', cursor: 'pointer', textTransform: 'uppercase' }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)' }}>
                Page {page} of {pages} · {filtered.length} results
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