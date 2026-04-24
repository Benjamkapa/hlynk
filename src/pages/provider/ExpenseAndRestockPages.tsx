/* ─────────────────────────────────────────────
   RESTOCK HISTORY PAGE
───────────────────────────────────────────── */
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  RefreshCw, Search, PlusCircle, ChevronLeft, ChevronRight,
  Download, ArrowLeft, Package, Wallet, Tag, AlignLeft, Loader2,
  Calendar, Filter, DollarSign, TrendingUp, TrendingDown
} from 'lucide-react'
import { providersApi, expensesApi } from '../../lib/api/providers'
import { PROVIDER_CSS, fmt, fmtDate } from '../admin/hl-design-system'

export function RestockHistoryPage() {
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['restock-history', search, page],
    queryFn: () => providersApi.getRestockHistory?.({ search, page }) ?? Promise.resolve({ data: { entries: [], total: 0, pages: 1 } }),
  })

  const entries = data?.data?.entries || []
  const total   = data?.data?.total   || 0
  const pages   = data?.data?.pages   || 1

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>

        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Restock Logs</h1>
            <p className="hl-page-subtitle">Track every inventory replenishment session</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="hl-btn-outline" style={{ borderRadius: 8 }}><Download size={14} /> Export CSV</button>
            <Link to="/dashboard/inventory/stock" className="hl-btn-primary" style={{ textDecoration: 'none' }}>
              <PlusCircle size={14} /> Add New Entry
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="hl-grid-3" style={{ marginBottom: 26 }}>
          {[
            { label: 'Total Replenishments', value: total, icon: RefreshCw, accent: '#1DBA87' },
            { label: 'Volume This Cycle',     value: data?.data?.thisMonth ?? 0, icon: Package, accent: '#3B82F6' },
            { label: 'Units Integrated',     value: data?.data?.totalUnits ?? 0, icon: TrendingUp, accent: '#F5A623' },
          ].map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .45s ease ${i * .07}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${k.accent}12`, border: `1px solid ${k.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>
                  <k.icon size={16} />
                </div>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.9rem', color: 'var(--ink)', lineHeight: 1 }}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .25s both' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface2)' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}><Search size={15} /></span>
              <input className="hl-form-input icon-left"
                style={{ paddingLeft: 40, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                placeholder="Search products in logs…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="hl-table">
              <thead>
                <tr>
                  <th>Product Asset</th>
                  <th>Quantity Added</th>
                  <th>Inventory Level</th>
                  <th>Cost Basis</th>
                  <th>Supplier / Entity</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px 0' }}>
                    <RefreshCw size={24} style={{ animation: 'hl-spin .8s linear infinite', margin: '0 auto 12px', color: 'var(--ink3)' }} />
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>RETRIEVING LOGS…</p>
                  </td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--ink3)' }}>
                    <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.9rem', fontWeight: 600 }}>No restock activity recorded.</p>
                  </td></tr>
                ) : entries.map((e: any, i: number) => (
                  <tr key={e.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .03}s both` }}>
                    <td style={{ fontWeight: 800, fontSize: '.88rem' }}>{e.productName || e.product?.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mint)' }} />
                        <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--mint)' }}>+{e.quantityAdded}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', fontWeight: 700 }}>{e.newLevel ?? '–'}</td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', color: 'var(--ink2)' }}>{e.cost ? fmt(e.cost) : '–'}</td>
                    <td style={{ fontWeight: 600, fontSize: '.84rem' }}>{e.supplier || '–'}</td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>{fmtDate(e.createdAt)}</td>
                  </tr>
                ))}
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

/* ─────────────────────────────────────────────
   RECORD EXPENSE PAGE
───────────────────────────────────────────── */
const EXPENSE_CATEGORIES = [
  'Rent / Utilities', 'Stock / Supplies', 'Salaries', 'Transport',
  'Marketing', 'Maintenance', 'Equipment', 'Other',
]

export function RecordExpensePage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', amount: '', category: '', date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'cash', notes: '', receipt: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await expensesApi.create({
        ...form,
        amount: parseFloat(form.amount)
      })
      toast.success('Expense recorded successfully!')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      qc.invalidateQueries({ queryKey: ['provider-stats'] })
      navigate('/dashboard/expenses')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>

        <div className="hl-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="hl-btn-outline" style={{ width: 42, height: 42, padding: 0, justifyContent: 'center', borderRadius: 12 }} onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="hl-page-title">New Expense</h1>
              <p className="hl-page-subtitle">Synchronize business outgoings with your ledger</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
            
            {/* Left Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="hl-card" style={{ animation: 'hl-up .4s ease both' }}>
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}><h3>Core Transaction Data</h3></div>
                <div className="hl-card-body">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="hl-form-label">Expense Title / Vendor</label>
                      <div className="hl-input-wrap">
                        <span className="hl-input-icon"><AlignLeft size={14} /></span>
                        <input required className="hl-form-input icon-left" placeholder="e.g. Monthly Studio Rent"
                          style={{ borderRadius: 'var(--radius-md)' }}
                          value={form.title} onChange={set('title')} />
                      </div>
                    </div>
                    <div>
                      <label className="hl-form-label">Category</label>
                      <div className="hl-input-wrap">
                        <span className="hl-input-icon"><Tag size={14} /></span>
                        <select required className="hl-form-input icon-left" style={{ borderRadius: 'var(--radius-md)' }}
                          value={form.category} onChange={set('category')}>
                          <option value="">Select category</option>
                          {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="hl-form-label">Date of Payment</label>
                      <div className="hl-input-wrap">
                        <span className="hl-input-icon"><Calendar size={14} /></span>
                        <input type="date" required className="hl-form-input icon-left"
                          style={{ borderRadius: 'var(--radius-md)' }}
                          value={form.date} onChange={set('date')} />
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="hl-form-label">Additional Annotations</label>
                      <textarea className="hl-form-input" rows={4} style={{ resize: 'none', borderRadius: 'var(--radius-md)' }}
                        placeholder="Detail any specifics about this transaction…"
                        value={form.notes} onChange={set('notes')} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div className="hl-card" style={{ animation: 'hl-up .45s ease .1s both' }}>
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}><h3>Value & Settlement</h3></div>
                <div className="hl-card-body">
                  <div style={{ marginBottom: 20 }}>
                    <label className="hl-form-label">Settlement Amount</label>
                    <div className="hl-input-wrap">
                      <span className="hl-input-icon" style={{ color: 'var(--forest)', fontWeight: 800 }}>KES</span>
                      <input required type="number" min="0" className="hl-form-input" placeholder="0.00"
                        style={{ paddingLeft: 48, fontSize: '1.2rem', fontWeight: 800, fontFamily: "'Saira',sans-serif", borderRadius: 'var(--radius-md)' }}
                        value={form.amount} onChange={set('amount')} />
                    </div>
                  </div>
                  <div>
                    <label className="hl-form-label">Payment Gateway</label>
                    <select className="hl-form-input" style={{ borderRadius: 'var(--radius-md)' }}
                      value={form.paymentMethod} onChange={set('paymentMethod')}>
                      <option value="cash">Direct Cash</option>
                      <option value="mpesa">M-Pesa Business</option>
                      <option value="bank">Bank Wire</option>
                      <option value="card">Corporate Card</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Preview Card */}
              {form.amount && (
                <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--forest)', animation: 'hl-up .3s ease both', boxShadow: '0 12px 32px rgba(13,36,25,.18)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: 'radial-gradient(circle, rgba(255,255,255,.1) 0%, transparent 70%)' }} />
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Ledger Impact</p>
                  <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '2.4rem', color: '#fff', letterSpacing: '-.03em', lineHeight: 1 }}>
                    {fmt(parseFloat(form.amount || '0'))}
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                     <span className="hl-badge" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', fontSize: '.55rem' }}>{form.category || 'NO CAT'}</span>
                     <span className="hl-badge" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', fontSize: '.55rem' }}>{form.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'hl-up .4s ease .15s both' }}>
                <button type="submit" disabled={loading} className="hl-btn-primary" style={{ width: '100%', padding: '16px', fontSize: '.95rem', borderRadius: 'var(--radius-md)', boxShadow: '0 8px 24px rgba(13,36,25,.12)' }}>
                  {loading ? <Loader2 size={18} style={{ animation: 'hl-spin .7s linear infinite' }} /> : <><Wallet size={16} /> Finalize Expense</>}
                </button>
                <button type="button" className="hl-btn-outline" style={{ width: '100%', padding: '12px', justifyContent: 'center' }} onClick={() => navigate(-1)}>Abort Transaction</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────
   EXPENSE HISTORY PAGE
───────────────────────────────────────────── */
export function ExpenseHistoryPage() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('')
  const [range,    setRange]    = useState('30d')
  const [page,     setPage]     = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', search, category, range, page],
    queryFn: () => providersApi.getExpenses?.({ search, category, range, page }) ?? Promise.resolve({ data: { expenses: [], total: 0, pages: 1, totalAmount: 0 } }),
  })

  const expenses    = data?.data?.expenses    || []
  const total       = data?.data?.total       || 0
  const pages       = data?.data?.pages       || 1
  const totalAmount = data?.data?.totalAmount || 0

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>

        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Expense Audit</h1>
            <p className="hl-page-subtitle">Complete chronological record of all business outgoings</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="hl-btn-outline" style={{ borderRadius: 8 }}><Download size={14} /> Export Logs</button>
            <Link to="/dashboard/expenses/new" className="hl-btn-primary" style={{ textDecoration: 'none' }}>
              <PlusCircle size={14} /> Log Expense
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="hl-grid-3" style={{ marginBottom: 26 }}>
          {[
            { label: 'Total Expenditure', value: fmt(totalAmount), icon: Wallet, accent: '#EF4444' },
            { label: 'Current Cycle',     value: fmt(data?.data?.thisMonth ?? 0), icon: Calendar, accent: '#F5A623' },
            { label: 'Average Payload',  value: fmt(totalAmount / (total || 1)), icon: TrendingDown, accent: '#3B82F6' },
          ].map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .45s ease ${i * .07}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${k.accent}12`, border: `1px solid ${k.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.accent }}>
                  <k.icon size={16} />
                </div>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: 'var(--ink)', lineHeight: 1 }}>{k.value}</p>
            </div>
          ))}
        </div>

        <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .25s both' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'var(--surface2)' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)' }}><Search size={15} /></span>
              <input className="hl-form-input icon-left"
                style={{ paddingLeft: 40, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                placeholder="Search by title or vendor…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Filter size={14} color="var(--ink3)" />
              <select className="hl-form-input" style={{ width: 'auto', minWidth: 160, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Expense Categories</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="hl-form-input" style={{ width: 'auto', minWidth: 140, fontSize: '.85rem', borderRadius: 'var(--radius-md)' }}
                value={range} onChange={e => setRange(e.target.value)}>
                <option value="7d">Last 7 Cycles</option>
                <option value="30d">Last 30 Cycles</option>
                <option value="90d">Quarterly Audit</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="hl-table">
              <thead>
                <tr>
                  <th>Expense Asset</th>
                  <th>Classification</th>
                  <th>Payment Gateway</th>
                  <th>Settlement Amount</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px 0' }}>
                    <RefreshCw size={24} style={{ animation: 'hl-spin .8s linear infinite', margin: '0 auto 12px', color: 'var(--ink3)' }} />
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.1em', color: 'var(--ink3)' }}>AUDITING COSTS…</p>
                  </td></tr>
                ) : expenses.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--ink3)' }}>
                    <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.9rem', fontWeight: 600 }}>No expenses found in this period.</p>
                  </td></tr>
                ) : expenses.map((e: any, i: number) => (
                  <tr key={e.id} className="hl-tr" style={{ animation: `hl-fade .3s ease ${i * .03}s both` }}>
                    <td>
                      <p style={{ fontWeight: 800, fontSize: '.88rem', color: 'var(--ink)' }}>{e.title}</p>
                      {e.notes && <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.72rem', color: 'var(--ink3)', marginTop: 2 }}>{e.notes}</p>}
                    </td>
                    <td><span className="hl-badge hl-badge-neutral">{e.category}</span></td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink2)' }}>{e.paymentMethod || 'CASH'}</td>
                    <td>
                      <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: '#EF4444' }}>{fmt(e.amount)}</span>
                    </td>
                    <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 600 }}>{fmtDate(e.date || e.createdAt)}</td>
                  </tr>
                ))}
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
