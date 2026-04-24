import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  ShoppingCart, Search, Plus, Minus, Trash2,
  User, CreditCard, Smartphone, Banknote, Loader2, ArrowLeft, ChevronRight
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { providersApi, salesApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmt } from '../admin/hl-design-system'

type LineItem = { id: string; name: string; price: number; qty: number }

const PAYMENT_METHODS = [
  { id: 'mpesa',  label: 'M-Pesa',       Icon: Smartphone },
  { id: 'cash',   label: 'Cash',          Icon: Banknote },
  { id: 'card',   label: 'Card',          Icon: CreditCard },
]

export default function RecordSalePage() {
  const navigate = useNavigate()
  const [items, setItems]       = useState<LineItem[]>([])
  const [search, setSearch]     = useState('')
  const [payment, setPayment]   = useState('mpesa')
  const [customer, setCustomer] = useState('')
  const [note, setNote]         = useState('')
  const [loading, setLoading]   = useState(false)

  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: providersApi.getProducts,
  })

  const qc = useQueryClient()

  const products = (productsData?.data?.products || []).filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const addItem = (p: any) => {
    setItems(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { id: p.id, name: p.name, price: p.sellingPrice || p.price || 0, qty: 1 }]
    })
    setSearch('')
  }

  const adjustQty = (id: string, delta: number) =>
    setItems(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    )

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0)
  const tax      = Math.round(subtotal * 0.16)
  const total    = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) { toast.error('Add at least one item'); return }
    setLoading(true)
    try {
      await salesApi.create({
        items: items.map(i => ({ productId: i.id, quantity: i.qty, unitPrice: i.price })),
        paymentMethod: payment,
        customerName: customer || 'Walk-in',
        notes: note,
        totalAmount: total,
      })
      toast.success('Sale recorded successfully!')
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['provider-stats'] })
      navigate('/dashboard/sales')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record sale')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '24px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button className="hl-btn-outline" style={{ padding: '9px 12px' }} onClick={() => navigate(-1)}>
              <ArrowLeft size={15} />
            </button>
            <div>
              <h1 className="hl-page-title">Record Sale</h1>
              <p className="hl-page-subtitle">Add items and complete the transaction</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="hl-btn-outline" onClick={() => setItems([])}>Clear</button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="hl-main-grid">

            {/* LEFT — Item builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Product search */}
              <div className="hl-card" style={{ animation: 'hl-up .4s ease both' }}>
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}><h3>Add Products</h3></div>
                <div className="hl-card-body">
                  <div className="hl-input-wrap" style={{ marginBottom: 14 }}>
                    <span className="hl-input-icon"><Search size={15} /></span>
                    <input className="hl-form-input icon-left" placeholder="Search products by name…"
                      style={{ borderRadius: 'var(--radius-md)' }}
                      value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  {search && (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 4, boxShadow: 'var(--shadow)' }}>
                      {products.slice(0, 6).map((p: any) => (
                        <button key={p.id} type="button"
                          onClick={() => addItem(p)}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'all .14s', fontFamily: "'Figtree',sans-serif" }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                          <div style={{ textAlign: 'left' }}>
                            <p style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--ink)', marginBottom: 3 }}>{p.name}</p>
                            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>STOCK: {p.stockLevel ?? '–'}</p>
                          </div>
                          <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--forest)' }}>{fmt(p.sellingPrice || p.price || 0)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Line items */}
              <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .45s ease .07s both' }}>
                <div className="hl-card-header" style={{ borderBottom: '2px solid var(--surface2)' }}>
                  <h3>Transaction Cart</h3>
                  <span className="hl-badge hl-badge-neutral" style={{ padding: '4px 12px', borderRadius: 100 }}>
                    {items.length} ITEM{items.length !== 1 ? 'S' : ''}
                  </span>
                </div>
                {items.length === 0 ? (
                  <div style={{ padding: '50px 24px', textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <ShoppingCart size={28} color="var(--ink3)" />
                    </div>
                    <p style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, color: 'var(--ink2)', fontSize: '.95rem' }}>
                      Ready to start a new sale?
                    </p>
                    <p style={{ fontFamily: "'Figtree',sans-serif", color: 'var(--ink3)', fontSize: '.82rem', marginTop: 4 }}>
                      Search and select items above to build the cart
                    </p>
                  </div>
                ) : (
                  <table className="hl-table">
                    <thead style={{ background: 'var(--surface2)' }}>
                      <tr>
                        <th>Product Details</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="hl-tr">
                          <td style={{ fontWeight: 800, fontSize: '.9rem' }}>{item.name}</td>
                          <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.78rem', fontWeight: 700 }}>{fmt(item.price)}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface2)', padding: '4px', borderRadius: 10, width: 'fit-content' }}>
                              <button type="button" className="hl-btn-ghost" style={{ width: 28, height: 28, borderRadius: 6 }}
                                onClick={() => adjustQty(item.id, -1)}><Minus size={11} /></button>
                              <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.05rem', minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                              <button type="button" className="hl-btn-ghost" style={{ width: 28, height: 28, borderRadius: 6 }}
                                onClick={() => adjustQty(item.id, 1)}><Plus size={11} /></button>
                            </div>
                          </td>
                          <td style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1rem', color: 'var(--forest)' }}>{fmt(item.price * item.qty)}</td>
                          <td>
                            <button type="button" className="hl-btn-ghost danger"
                              onClick={() => setItems(p => p.filter(i => i.id !== item.id))}
                              style={{ width: 30, height: 30, borderRadius: 8 }}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Customer + Note */}
              <div className="hl-card" style={{ animation: 'hl-up .45s ease .12s both' }}>
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}><h3>Customer & Session Info</h3></div>
                <div className="hl-card-body">
                  <div className="hl-grid-2">
                    <div>
                      <label className="hl-form-label">Client Name</label>
                      <div className="hl-input-wrap">
                        <span className="hl-input-icon"><User size={14} /></span>
                        <input className="hl-form-input icon-left" placeholder="Walk-in customer"
                          style={{ borderRadius: 'var(--radius-md)' }}
                          value={customer} onChange={e => setCustomer(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="hl-form-label">Transaction Note</label>
                      <input className="hl-form-input" placeholder="e.g. Bulk discount 5%"
                        style={{ borderRadius: 'var(--radius-md)' }}
                        value={note} onChange={e => setNote(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Summary + Payment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Payment method */}
              <div className="hl-card" style={{ animation: 'hl-up .4s ease .1s both' }}>
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}><h3>Settlement</h3></div>
                <div className="hl-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {PAYMENT_METHODS.map(m => (
                      <button key={m.id} type="button"
                        onClick={() => setPayment(m.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all .25s',
                          border: payment === m.id ? '2.5px solid var(--mint)' : '1.5px solid var(--border)',
                          background: payment === m.id ? 'rgba(29,186,135,.06)' : 'var(--surface)',
                          boxShadow: payment === m.id ? '0 4px 12px rgba(29,186,135,.1)' : 'none'
                        }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: payment === m.id ? 'rgba(29,186,135,.15)' : 'var(--surface2)', border: `1px solid ${payment === m.id ? 'rgba(29,186,135,.25)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: payment === m.id ? 'var(--mint)' : 'var(--ink3)' }}>
                          <m.Icon size={18} />
                        </div>
                        <span style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 800, fontSize: '.95rem', color: payment === m.id ? 'var(--forest)' : 'var(--ink)' }}>{m.label}</span>
                        {payment === m.id && <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'var(--mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={10} color="#fff" style={{ transform: 'rotate(45deg)' }} /></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="hl-card" style={{ animation: 'hl-up .45s ease .16s both', background: 'var(--surface2)' }}>
                <div className="hl-card-header" style={{ borderBottom: '1px solid rgba(13,36,25,.06)' }}><h3>Summary</h3></div>
                <div className="hl-card-body">
                  {[['Sub-total', fmt(subtotal)], ['Tax (VAT 16%)', fmt(tax)]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.86rem', color: 'var(--ink2)', fontWeight: 600 }}>{k}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8rem', color: 'var(--ink)', fontWeight: 800 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '2.5px dashed rgba(13,36,25,.1)', marginTop: 18, paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Grand Total</span>
                    <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.8rem', color: 'var(--forest)', letterSpacing: '-0.02em' }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading || !items.length} className="hl-btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '.95rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 8px 24px rgba(13,36,25,.15)' }}>
                {loading
                  ? <Loader2 size={18} style={{ animation: 'hl-spin .7s linear infinite' }} />
                  : <><ShoppingCart size={16} /> Complete & Finalize Sale</>}
              </button>

            </div>
          </div>
        </form>
      </div>
    </>
  )
}
