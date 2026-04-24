import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Package, PlusCircle, Search, Edit2, Trash2, RefreshCw,
  ArrowUpRight, Filter, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, TrendingUp, Wallet
} from 'lucide-react'
import { providersApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmt } from '../admin/hl-design-system'

const stockStatus = (stock: number, min: number) => {
  if (stock === 0)          return { label: 'OUT OF STOCK', cls: 'hl-badge-expired' }
  if (stock <= min)         return { label: 'LOW',          cls: 'hl-badge-trial' }
  return                           { label: 'IN STOCK',     cls: 'hl-badge-active' }
}

export default function ProductsPage() {
  const qc = useQueryClient()
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [page,     setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category, page],
    queryFn: () => providersApi.getProducts?.({ search, category, page }) ?? Promise.resolve({ data: { products: [], total: 0, pages: 1 } }),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => providersApi.deleteProduct?.(id) ?? Promise.resolve(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted') },
    onError: () => toast.error('Delete failed'),
  })

  const products = data?.data?.products || []
  const total    = data?.data?.total    || 0
  const pages    = data?.data?.pages    || 1

  const totalValue = products.reduce((s: number, p: any) => s + (p.costPrice || 0) * (p.stockLevel || 0), 0)
  const lowStock   = products.filter((p: any) => (p.stockLevel || 0) <= (p.minLevel || 5)).length

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
 
         <div className="hl-page-header">
           <div>
             <h1 className="hl-page-title">Product Catalog</h1>
             <p className="hl-page-subtitle">Centralized inventory management · {total} active items</p>
           </div>
           <div style={{ display: 'flex', gap: 10 }}>
             <Link to="/dashboard/inventory/stock" className="hl-btn-outline" style={{ textDecoration: 'none' }}>
               <AlertTriangle size={14} /> Stock Health
             </Link>
             <Link to="/dashboard/inventory/new" className="hl-btn-primary" style={{ textDecoration: 'none' }}>
               <PlusCircle size={14} /> New Product
             </Link>
           </div>
         </div>
 
         {/* KPIs */}
         <div className="hl-grid-4" style={{ marginBottom: 26 }}>
           {[
             { label: 'Total Products', value: total,               accent: '#1DBA87', Icon: Package },
             { label: 'In Stock',       value: products.filter((p: any) => (p.stockLevel || 0) > 0).length, accent: '#1DBA87', Icon: CheckCircle },
             { label: 'Low / Critical', value: lowStock,            accent: '#F5A623', Icon: AlertTriangle },
             { label: 'Estimated Value', value: fmt(totalValue),    accent: '#3B82F6', Icon: TrendingUp },
           ].map((k: any, i) => (
             <div key={i} className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .45s ease ${i * .06}s both` }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                 <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${k.accent}12`, border: `1px solid ${k.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>
                   <k.Icon size={16} />
                 </div>
               </div>
               <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{k.label}</p>
               <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.75rem', color: 'var(--ink)', lineHeight: 1 }}>{k.value}</p>
             </div>
           ))}
         </div>
 
         <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .28s both' }}>
 
           {/* Toolbar */}
           <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'var(--surface2)' }}>
             <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
               <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}><Search size={15} /></span>
               <input className="hl-form-input icon-left"
                 style={{ paddingLeft: 40, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                 placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
               <Filter size={14} color="var(--ink3)" />
               <select className="hl-form-input" style={{ width: 'auto', minWidth: 160, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                 value={category} onChange={e => setCategory(e.target.value)}>
                 <option value="">All Categories</option>
                 <option value="raw">Raw Materials</option>
                 <option value="finished">Finished Goods</option>
                 <option value="equipment">Equipment</option>
                 <option value="supplies">Supplies</option>
               </select>
             </div>
           </div>
 
           <div style={{ overflowX: 'auto' }}>
             <table className="hl-table">
               <thead>
                 <tr>
                   <th>Product Details</th>
                   <th>Category</th>
                   <th>Cost</th>
                   <th>Selling Price</th>
                   <th>Stock</th>
                   <th>Status</th>
                   <th style={{ textAlign: 'right' }}>Actions</th>
                 </tr>
               </thead>
               <tbody>
                 {isLoading ? (
                   <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px 0' }}>
                     <RefreshCw size={24} style={{ animation: 'hl-spin .8s linear infinite', margin: '0 auto 12px', color: 'var(--ink3)' }} />
                     <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>FETCHING CATALOG…</p>
                   </td></tr>
                 ) : products.length === 0 ? (
                   <tr>
                     <td colSpan={7} style={{ textAlign: 'center', padding: '80px 24px' }}>
                       <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                         <Package size={32} color="var(--ink3)" />
                       </div>
                       <h4 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 8 }}>Empty Catalog</h4>
                       <p style={{ fontFamily: "'Figtree',sans-serif", color: 'var(--ink3)', fontSize: '.88rem', maxWidth: 300, margin: '0 auto 24px' }}>
                         You haven't added any products to your inventory yet.
                       </p>
                       <Link to="/dashboard/inventory/new" className="hl-btn-primary" style={{ textDecoration: 'none' }}>
                         <PlusCircle size={14} /> Add Your First Product
                       </Link>
                     </td>
                   </tr>
                 ) : products.map((p: any, i: number) => {
                   const st = stockStatus(p.stockLevel ?? 0, p.minLevel ?? 5)
                   return (
                     <tr key={p.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .03}s both` }}>
                       <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(13,36,25,.06)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                             <Package size={16} color="var(--forest)" />
                           </div>
                           <div>
                             <p style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)' }}>{p.name}</p>
                             {p.sku && <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)', fontWeight: 600 }}>SKU: {p.sku.toUpperCase()}</p>}
                           </div>
                         </div>
                       </td>
                       <td><span className="hl-badge hl-badge-neutral">{p.category || 'General'}</span></td>
                       <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.78rem', color: 'var(--ink3)' }}>{fmt(p.costPrice || 0)}</td>
                       <td style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--ink)' }}>{fmt(p.sellingPrice || 0)}</td>
                       <td>
                         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                           <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.2rem', color: 'var(--ink)' }}>{p.stockLevel ?? 0}</span>
                           <div className="hl-bar-track" style={{ width: 60, height: 6 }}>
                             <div className="hl-bar-fill" style={{ width: `${Math.min(100, ((p.stockLevel || 0) / Math.max(p.minLevel * 2, 10)) * 100)}%`, background: st.cls === 'hl-badge-expired' ? '#EF4444' : st.cls === 'hl-badge-trial' ? '#F5A623' : '#1DBA87' }} />
                           </div>
                         </div>
                       </td>
                       <td><span className={`hl-badge ${st.cls}`} style={{ padding: '4px 12px' }}>{st.label}</span></td>
                       <td style={{ textAlign: 'right' }}>
                         <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                           <Link to={`/dashboard/inventory/${p.id}/edit`} className="hl-btn-ghost" style={{ textDecoration: 'none' }}>
                             <Edit2 size={14} />
                           </Link>
                           <button className="hl-btn-ghost danger" onClick={() => deleteMut.mutate(p.id)}>
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
 
           {pages > 1 && (
             <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)' }}>
               <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>PAGE {page} OF {pages}</span>
               <div style={{ display: 'flex', gap: 8 }}>
                 <button className="hl-btn-outline" style={{ padding: '8px 16px', fontSize: '.78rem', borderRadius: 8 }} disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> PREV</button>
                 <button className="hl-btn-outline" style={{ padding: '8px 16px', fontSize: '.78rem', borderRadius: 8 }} disabled={page === pages} onClick={() => setPage(p => p + 1)}>NEXT <ChevronRight size={14} /></button>
               </div>
             </div>
           )}
         </div>
       </div>
    </>
  )
}
