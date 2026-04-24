import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  PlusCircle, Search, Download, ArrowUpRight, ArrowDownRight, RefreshCw,
  ChevronLeft, ChevronRight, Eye, Filter
} from 'lucide-react'
import { providersApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmt, fmtDate } from '../admin/hl-design-system'

const METHOD_BADGE: Record<string, string> = {
  mpesa: 'hl-badge-active',
  cash:  'hl-badge-neutral',
  card:  'hl-badge-info',
}

export default function SalesHistoryPage() {
  const [search,   setSearch]   = useState('')
  const [method,   setMethod]   = useState('')
  const [range,    setRange]    = useState('7d')
  const [page,     setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['sales', search, method, range, page],
    queryFn: () => providersApi.getSales?.({ search, method, range, page }) ?? Promise.resolve({ data: { sales: [], total: 0, pages: 1 } }),
  })

  const sales  = data?.data?.sales  || []
  const total  = data?.data?.total  || 0
  const pages  = data?.data?.pages  || 1
  const totRev = data?.data?.totalRevenue || 0
  const totTx  = data?.data?.totalTransactions || 0

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
 
         <div className="hl-page-header">
           <div>
             <h1 className="hl-page-title">Ledger & Revenue</h1>
             <p className="hl-page-subtitle">Comprehensive audit of all sales transactions · {total} entries</p>
           </div>
           <div style={{ display: 'flex', gap: 10 }}>
             <button className="hl-btn-outline" style={{ borderRadius: 8 }}><Download size={14} /> Export CSV</button>
             <Link to="/dashboard/sales/new" className="hl-btn-primary" style={{ textDecoration: 'none' }}>
               <PlusCircle size={14} /> Log New Sale
             </Link>
           </div>
         </div>
 
         {/* KPIs */}
         <div className="hl-grid-4" style={{ marginBottom: 26 }}>
           {[
             { label: 'Cumulative Revenue', value: fmt(totRev),    trend: 12,  up: true,  accent: '#1DBA87' },
             { label: 'Volume of Sales',   value: totTx,           trend: 8,   up: true,  accent: '#1DBA87' },
             { label: 'Average Ticket',    value: fmt(totRev / (totTx || 1)), trend: 3, up: true, accent: '#3B82F6' },
             { label: 'Payment Velocity',  value: 'High',          trend: undefined, accent: '#F5A623' },
           ].map((k, i) => (
             <div key={i} className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .45s ease ${i * .06}s both` }}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', background: k.accent || 'var(--forest)', marginBottom: 14 }} />
               <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{k.label}</p>
               <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: 'var(--ink)', lineHeight: 1, marginBottom: k.trend !== undefined ? 12 : 0 }}>{k.value}</p>
               {k.trend !== undefined && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                   <span className={`hl-trend ${k.up ? 'hl-trend-up' : 'hl-trend-dn'}`} style={{ fontSize: '.55rem', padding: '2px 6px' }}>
                     {k.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}{k.trend}%
                   </span>
                   <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>vs PREV PERIOD</span>
                 </div>
               )}
             </div>
           ))}
         </div>
 
         {/* Table card */}
         <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .28s both' }}>
           {/* Toolbar */}
           <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'var(--surface2)' }}>
             <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
               <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}><Search size={15} /></span>
               <input className="hl-form-input icon-left"
                 style={{ paddingLeft: 40, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                 placeholder="Search by client or note…" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <Filter size={14} color="var(--ink3)" />
               <select className="hl-form-input" style={{ width: 'auto', minWidth: 140, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                 value={method} onChange={e => setMethod(e.target.value)}>
                 <option value="">All Payment Modes</option>
                 <option value="mpesa">M-Pesa Express</option>
                 <option value="cash">Direct Cash</option>
                 <option value="card">Debit/Credit Card</option>
               </select>
               <select className="hl-form-input" style={{ width: 'auto', minWidth: 140, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                 value={range} onChange={e => setRange(e.target.value)}>
                 <option value="7d">Last 7 Cycles</option>
                 <option value="30d">Last 30 Cycles</option>
                 <option value="90d">Quarterly View</option>
               </select>
             </div>
           </div>
 
           <div style={{ overflowX: 'auto' }}>
             <table className="hl-table">
               <thead>
                 <tr>
                   <th>Ref ID</th>
                   <th>Client details</th>
                   <th>Item count</th>
                   <th>Method</th>
                   <th>Settlement</th>
                   <th>Timestamp</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {isLoading ? (
                   <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px 0' }}>
                     <RefreshCw size={24} style={{ animation: 'hl-spin .8s linear infinite', margin: '0 auto 12px', color: 'var(--ink3)' }} />
                     <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>AUDITING LEDGER…</p>
                   </td></tr>
                 ) : sales.length === 0 ? (
                   <tr><td colSpan={7} style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--ink3)' }}>
                     <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.9rem', fontWeight: 600 }}>No matching transactions found.</p>
                     <Link to="/dashboard/sales/new" style={{ color: 'var(--forest)', fontWeight: 800, textDecoration: 'none', display: 'inline-block', marginTop: 10 }}>Record your first sale →</Link>
                   </td></tr>
                 ) : sales.map((s: any, i: number) => (
                   <tr key={s.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .03}s both` }}>
                     <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.72rem', fontWeight: 800, color: 'var(--mint)' }}>
                       #{s.id?.slice(0, 8).toUpperCase()}
                     </td>
                     <td style={{ fontWeight: 800, fontSize: '.88rem' }}>{s.customerName || 'Walk-in Client'}</td>
                     <td><span className="hl-badge hl-badge-neutral">{s.itemCount ?? s.items?.length ?? 1} ITEM{(s.itemCount ?? 1) !== 1 ? 'S' : ''}</span></td>
                     <td>
                       <span className={`hl-badge ${METHOD_BADGE[s.paymentMethod] || 'hl-badge-neutral'}`} style={{ padding: '4px 10px' }}>
                         {s.paymentMethod?.toUpperCase() || 'CASH'}
                       </span>
                     </td>
                     <td>
                       <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)' }}>
                         {fmt(s.totalAmount || s.total || 0)}
                       </span>
                     </td>
                     <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>
                       {fmtDate(s.createdAt)}
                     </td>
                     <td style={{ textAlign: 'right' }}>
                       <button className="hl-btn-ghost" style={{ borderRadius: 8 }}><Eye size={14} /></button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
 
           {pages > 1 && (
             <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)' }}>
               <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>PAGE {page} OF {pages}</span>
               <div style={{ display: 'flex', gap: 8 }}>
                 <button className="hl-btn-outline" style={{ padding: '8px 16px', fontSize: '.78rem', borderRadius: 8 }}
                   disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                   <ChevronLeft size={14} /> PREV
                 </button>
                 <button className="hl-btn-outline" style={{ padding: '8px 16px', fontSize: '.78rem', borderRadius: 8 }}
                   disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                   NEXT <ChevronRight size={14} />
                 </button>
               </div>
             </div>
           )}
         </div>
       </div>
    </>
  )
}
