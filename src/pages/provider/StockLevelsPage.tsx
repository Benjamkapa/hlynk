import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Package, AlertTriangle, History, RefreshCw, ArrowUpRight, TrendingDown, CheckCircle } from 'lucide-react'
import { providersApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmt } from '../admin/hl-design-system'

const levelMeta = (stock: number, min: number) => {
  if (stock === 0)       return { label: 'OUT OF STOCK', color: '#EF4444', bg: 'rgba(239,68,68,.06)',  bd: 'rgba(239,68,68,.18)',  barColor: '#EF4444', pct: 0 }
  if (stock <= min / 2)  return { label: 'CRITICAL',     color: '#EF4444', bg: 'rgba(239,68,68,.04)',  bd: 'rgba(239,68,68,.14)',  barColor: '#EF4444', pct: Math.round(stock / (min * 2) * 100) }
  if (stock <= min)      return { label: 'LOW',          color: '#D97706', bg: 'rgba(245,166,35,.06)', bd: 'rgba(245,166,35,.18)', barColor: '#F5A623', pct: Math.round(stock / (min * 2) * 100) }
  return                        { label: 'HEALTHY',      color: '#0d8a62', bg: 'rgba(29,186,135,.04)', bd: 'rgba(29,186,135,.15)', barColor: '#1DBA87', pct: Math.min(100, Math.round(stock / (min * 2) * 100)) }
}

export default function StockLevelsPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: () => providersApi.getProducts?.() ?? Promise.resolve({ data: { products: [] } }),
  })

  const products = data?.data?.products || []

  const outOfStock = products.filter((p: any) => (p.stockLevel || 0) === 0)
  const critical   = products.filter((p: any) => (p.stockLevel || 0) > 0 && (p.stockLevel || 0) <= (p.minLevel || 5) / 2)
  const low        = products.filter((p: any) => (p.stockLevel || 0) > (p.minLevel || 5) / 2 && (p.stockLevel || 0) <= (p.minLevel || 5))
  const healthy    = products.filter((p: any) => (p.stockLevel || 0) > (p.minLevel || 5))

  const kpis = [
    { label: 'Out of Stock', value: outOfStock.length, accent: '#EF4444', Icon: TrendingDown },
    { label: 'Critical',     value: critical.length,   accent: '#EF4444', Icon: AlertTriangle },
    { label: 'Low Stock',    value: low.length,        accent: '#F5A623', Icon: AlertTriangle },
    { label: 'Healthy',      value: healthy.length,    accent: '#1DBA87', Icon: CheckCircle },
  ]

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
 
         <div className="hl-page-header">
           <div>
             <h1 className="hl-page-title">Stock Levels</h1>
             <p className="hl-page-subtitle">Real-time inventory health & automated alerts</p>
           </div>
           <div style={{ display: 'flex', gap: 10 }}>
             <Link to="/dashboard/inventory/history" className="hl-btn-outline" style={{ textDecoration: 'none' }}>
               <History size={14} /> View History
             </Link>
             <Link to="/dashboard/inventory" className="hl-btn-primary" style={{ textDecoration: 'none' }}>
               <Package size={14} /> Catalog
             </Link>
           </div>
         </div>
 
         {/* KPIs */}
         <div className="hl-grid-4" style={{ marginBottom: 26 }}>
           {kpis.map((k, i) => (
             <div key={i} className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .45s ease ${i * .06}s both` }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                 <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${k.accent}12`, border: `1px solid ${k.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>
                   <k.Icon size={16} />
                 </div>
               </div>
               <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{k.label}</p>
               <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.9rem', color: 'var(--ink)', lineHeight: 1 }}>{k.value}</p>
             </div>
           ))}
         </div>
 
         {/* Alerts first — then all products */}
         {(outOfStock.length > 0 || critical.length > 0) && (
           <div className="hl-card" style={{ overflow: 'hidden', marginBottom: 24, animation: 'hl-up .5s ease .25s both', border: '1px solid rgba(239,68,68,.15)' }}>
             <div className="hl-card-header" style={{ background: 'rgba(239,68,68,.03)', padding: '18px 24px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <AlertTriangle size={15} color="#EF4444" />
                 </div>
                 <h3 style={{ color: '#DC2626', fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.95rem', textTransform: 'uppercase' }}>Critical Stock Alerts</h3>
               </div>
               <span className="hl-badge hl-badge-expired" style={{ padding: '4px 12px' }}>{outOfStock.length + critical.length} URGENT</span>
             </div>
             <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
               {[...outOfStock, ...critical].map((p: any) => {
                 const m = levelMeta(p.stockLevel || 0, p.minLevel || 5)
                 return (
                   <div key={p.id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: m.bg, border: `1.5px solid ${m.bd}`, transition: 'transform .2s' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                       <p style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{p.name}</p>
                       <span style={{ padding: '3px 10px', borderRadius: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: '.5rem', fontWeight: 800, background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}28` }}>{m.label}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                       <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.25rem', color: 'var(--ink)' }}>{p.stockLevel ?? 0}</span>
                       <div className="hl-bar-track" style={{ flex: 1, height: 6 }}>
                         <div className="hl-bar-fill" style={{ width: `${m.pct}%`, background: m.barColor }} />
                       </div>
                       <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: 'var(--ink3)', fontWeight: 600 }}>MIN {p.minLevel || 5}</span>
                     </div>
                     <Link to={`/dashboard/inventory/stock?id=${p.id}`} className="hl-btn-primary"
                       style={{ display: 'flex', width: '100%', justifyContent: 'center', padding: '9px 0', fontSize: '.78rem', textDecoration: 'none' }}>
                       Restock Now
                     </Link>
                   </div>
                 )
               })}
             </div>
           </div>
         )}
 
         {/* All products grid */}
         <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .33s both' }}>
           <div className="hl-card-header" style={{ background: 'var(--surface2)', padding: '18px 24px' }}>
             <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.95rem', textTransform: 'uppercase' }}>Detailed Inventory Status</h3>
             <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', letterSpacing: '.06em', fontWeight: 600 }}>{products.length} REGISTERED PRODUCTS</span>
           </div>
           <div style={{ overflowX: 'auto' }}>
             <table className="hl-table">
               <thead>
                 <tr>
                   <th>Product Name</th>
                   <th>Current Stock</th>
                   <th>Min. Buffer</th>
                   <th>Health Indicator</th>
                   <th>Status</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {isLoading ? (
                   <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink3)' }}>
                     <RefreshCw size={24} style={{ animation: 'hl-spin .8s linear infinite', margin: '0 auto 12px' }} />
                     <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em' }}>SYNCHRONIZING STOCK DATA…</p>
                   </td></tr>
                 ) : products.map((p: any, i: number) => {
                   const m = levelMeta(p.stockLevel || 0, p.minLevel || 5)
                   return (
                     <tr key={p.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .025}s both` }}>
                       <td style={{ fontWeight: 800, fontSize: '.88rem' }}>{p.name}</td>
                       <td>
                         <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.2rem', color: m.color }}>{p.stockLevel ?? 0}</span>
                       </td>
                       <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--ink3)', fontWeight: 600 }}>{p.minLevel || 5}</td>
                       <td style={{ width: 160 }}>
                         <div className="hl-bar-track" style={{ height: 6 }}>
                           <div className="hl-bar-fill" style={{ width: `${m.pct}%`, background: m.barColor }} />
                         </div>
                       </td>
                       <td>
                         <span style={{ padding: '4px 12px', borderRadius: 100, fontFamily: "'JetBrains Mono',monospace", fontSize: '.5rem', fontWeight: 800, background: `${m.color}14`, color: m.color, border: `1px solid ${m.color}22` }}>
                           {m.label}
                         </span>
                       </td>
                       <td style={{ textAlign: 'right' }}>
                         <Link to={`/dashboard/inventory/stock?id=${p.id}`} className="hl-btn-outline"
                           style={{ padding: '6px 14px', fontSize: '.7rem', textDecoration: 'none', borderRadius: 8, gap: 5 }}>
                           Update <ArrowUpRight size={12} />
                         </Link>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
         </div>
       </div>
    </>
  )
}
