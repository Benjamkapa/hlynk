import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import {
  DollarSign, Wallet, TrendingUp, TrendingDown, Package,
  ShoppingCart, Activity, PlusCircle, Globe, FileText,
  AlertTriangle, History, ArrowUpRight, ArrowDownRight,
  ChevronRight, Zap, Clock, BarChart3, RefreshCw
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ADMIN_CSS } from '../admin/hl-design-system'

/* ─── HELPERS ─── */
const fmt = (v: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v)

/* ─── ANIMATED COUNTER ─── */
function Counter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [v, setV] = useState(0)
  const did = useRef(false)
  useEffect(() => {
    if (did.current) return; did.current = true
    let t0: number | null = null; const dur = 1100
    const run = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / dur, 1)
      setV(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(run)
    }
    requestAnimationFrame(run)
  }, [target])
  return <>{prefix}{v.toLocaleString()}{suffix}</>
}

/* ─── CHART TOOLTIP ─── */
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(13,36,25,.08)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-lg)', fontFamily: "'Figtree',sans-serif", backdropFilter: 'blur(10px)' }}>
      <p style={{ fontSize: '.72rem', color: '#8FA398', marginBottom: 5 }}>{label}</p>
      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0D1B12' }}>{payload[0].name === 'sales' ? fmt(payload[0].value) : payload[0].value}</p>
    </div>
  )
}

/* ─── HERO STAT (dark, flagship number) ─── */
function HeroStat({ label, value, sub, icon: Icon, delay = 0 }: any) {
  return (
    <div className="hl-card-dark hl-kpi" style={{ padding: '30px 26px', animation: `hl-up .45s ease ${delay}s both` }}>
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,186,135,.25) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(29,186,135,.15)', border: '1px solid rgba(29,186,135,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1DBA87' }}>
          <Icon size={16} />
        </div>
        <ArrowUpRight size={15} color="rgba(255,255,255,.2)" />
      </div>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '2.5rem', color: '#fff', lineHeight: 1, letterSpacing: '-.03em' }}>{value}</p>
      {sub && (
        <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="hl-live" />
          <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.75rem', color: 'rgba(255,255,255,.35)' }}>{sub}</span>
        </div>
      )}
    </div>
  )
}

/* ─── LIGHT STAT ─── */
function LightStat({ label, value, icon: Icon, trend, accent = '#1DBA87', delay = 0, note }: any) {
  const up = trend === undefined ? null : trend >= 0
  return (
    <div className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .5s ease ${delay}s both` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: `${accent}12`, border: `1px solid ${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent }}>
          <Icon size={16} />
        </div>
        {up !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: up ? 'rgba(29,186,135,.08)' : 'rgba(239,68,68,.06)' }}>
            {up ? <ArrowUpRight size={10} color="#1DBA87" /> : <ArrowDownRight size={10} color="#EF4444" />}
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: up ? '#1DBA87' : '#EF4444', fontWeight: 800 }}>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.85rem', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-.02em' }}>{value}</p>
      {note && <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.72rem', color: 'var(--ink3)', marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 8 }}>{note}</p>}
    </div>
  )
}

/* ─── MAIN ─── */
export default function DashboardPage() {
  const { user } = useAuth()
  const { data: statsData, isLoading, refetch } = useQuery({ queryKey: ['provider-stats'], queryFn: providersApi.getStats })
  const [time, setTime] = useState(new Date())
  const [spinning, setSpinning] = useState(false)

  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id) }, [])

  const doRefresh = async () => { setSpinning(true); await refetch(); setTimeout(() => setSpinning(false), 700) }

  const snap = statsData?.data?.snapshot || {
    salesToday: 0, expensesToday: 0, profitToday: 0,
    lowStockCount: 0, transactionsToday: 0, subscription: null
  }
  const trends = statsData?.data?.trends || { sales7Days: [], profit6Months: [] }
  const topProducts = statsData?.data?.topProducts || []
  const health = statsData?.data?.health || 'Stable'
  const recentLogs = statsData?.data?.recentLogs || []
  const restockAlerts = statsData?.data?.restockAlerts || []

  const trialDays = snap.subscription?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(snap.subscription.trialEndDate).getTime() - Date.now()) / 86400000))
    : null

  const healthMeta: Record<string, { color: string; bg: string; bd: string; icon: any }> = {
    Growing:  { color: '#1DBA87', bg: 'rgba(29,186,135,.08)',  bd: 'rgba(29,186,135,.15)',  icon: TrendingUp },
    Stable:   { color: '#3B82F6', bg: 'rgba(59,130,246,.08)',  bd: 'rgba(59,130,246,.15)',  icon: Activity },
    Declining:{ color: '#EF4444', bg: 'rgba(239,68,68,.08)',   bd: 'rgba(239,68,68,.15)',   icon: TrendingDown },
  }
  const hm = healthMeta[health] || healthMeta.Stable

  const hour = time.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap', animation: 'hl-up .4s ease both' }}>
          <div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>
              {greeting}, {user?.name?.split(' ')[0]}
            </p>
            <h1 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,2.2vw,1.85rem)', color: 'var(--ink)', letterSpacing: '-.025em', lineHeight: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              {user?.businessName || 'Business Overview'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="hl-live" />
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', letterSpacing: '.06em' }}>
                {time.toLocaleDateString('en-KE', { weekday: 'short', day: '2-digit', month: 'short' })} · {time.toLocaleTimeString('en-KE', { hour12: false })}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <button className="hl-btn-outline" onClick={doRefresh}>
              <RefreshCw size={12} style={{ animation: spinning ? 'hl-spin .7s linear infinite' : 'none' }} /> Refresh
            </button>
            <button className="hl-btn-outline">
              <FileText size={12} /> Reports
            </button>
            <button className="hl-btn-primary">
              <PlusCircle size={14} /> Record Sale
            </button>
          </div>
        </div>

        {/* ── ROW 1 — 3 heroes (2 dark + 1 tinted) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
          <HeroStat label="Sales Today" value={<Counter prefix="KES " target={snap.salesToday} />} sub="Transactions recorded today" icon={DollarSign} delay={.04} />
          <HeroStat label="Profit Today" value={<Counter prefix="KES " target={snap.profitToday} />} sub="After expenses" icon={TrendingUp} delay={.08} />
          {/* Subscription status as a hero-style accent card */}
          <div className="hl-card hl-kpi" style={{ padding: '26px 24px', animation: 'hl-up .45s ease .12s both', background: `linear-gradient(135deg, #fff 60%, ${hm.bg})` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: hm.bg, border: `1px solid ${hm.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: hm.color }}>
                <hm.icon size={15} />
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 4, background: hm.bg, border: `1px solid ${hm.bd}`, fontFamily: "'JetBrains Mono',monospace", fontSize: '.5rem', fontWeight: 700, color: hm.color, letterSpacing: '.06em', textTransform: 'uppercase' }}>{health}</span>
            </div>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.56rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 5 }}>Business Health</p>
            <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '2.3rem', color: 'var(--ink)', lineHeight: 1, letterSpacing: '-.03em' }}>
              {snap.subscription?.planName || 'Trial'}
            </p>
            {trialDays !== null && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Clock size={11} color="var(--ink3)" />
                <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.72rem', color: 'var(--ink3)' }}>{trialDays} days remaining</span>
              </div>
            )}
          </div>
        </div>

        {/* ── ROW 2 — 4 light KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
          <LightStat label="Expenses Today" value={<Counter prefix="KES " target={snap.expensesToday} />} icon={Wallet}       trend={-4}  accent="#EF4444" delay={.16} />
          <LightStat label="Transactions"   value={<Counter target={snap.transactionsToday} />}           icon={ShoppingCart} trend={11}  accent="#1DBA87" delay={.2} />
          <LightStat label="Low Stock Items" value={<Counter target={snap.lowStockCount} />}              icon={Package}      accent="#F5A623" delay={.24} note={snap.lowStockCount > 0 ? 'Needs attention' : 'All stocked'} />
          <LightStat label="Gross Revenue"  value={<Counter prefix="KES " target={snap.salesToday * 30} />} icon={BarChart3} accent="#8B5CF6" delay={.28} />
        </div>

        {/* ── MAIN GRID ── */}
        <div className="hl-main-grid">

          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Sales chart */}
            <div className="hl-card" style={{ padding: '24px', animation: 'hl-up .5s ease .3s both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 4 }}>Revenue Flux</p>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Sales Performance</h3>
                </div>
                <Link to="/dashboard/reports" className="hl-btn-outline" style={{ padding: '6px 12px', fontSize: '.72rem', borderRadius: 8 }}>
                  View Full <ChevronRight size={12} />
                </Link>
              </div>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends.sales7Days} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pv-sales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#1DBA87" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#1DBA87" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="sales" stroke="#1DBA87" strokeWidth={3} fill="url(#pv-sales)" dot={{ r: 3, fill: '#1DBA87', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5, fill: '#1DBA87', strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 4" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 20, marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {[['#1DBA87', 'Gross Sales'], ['#EF4444', 'Business Expenses']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink2)', letterSpacing: '.06em', fontWeight: 600 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .38s both' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface2)' }}>
                <div>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.05rem', color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>Top Products</h3>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.56rem', color: 'var(--ink3)', letterSpacing: '.08em', marginTop: 3 }}>MOST DEMANDED THIS PERIOD</p>
                </div>
                <Link to="/dashboard/inventory" className="hl-btn-outline" style={{ padding: '6px 12px', fontSize: '.72rem', borderRadius: 8 }}>
                  Inventory <ChevronRight size={12} />
                </Link>
              </div>
              <table className="hl-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Product Details</th>
                    <th>Volume</th>
                    <th>Gross</th>
                    <th style={{ textAlign: 'right' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.slice(0, 5).map((p: any, i: number) => {
                    const maxQty = topProducts[0]?._sum?.quantity || 1
                    const pct = Math.round((p._sum.quantity / maxQty) * 100)
                    return (
                      <tr key={i} className="hl-tr">
                        <td>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: i === 0 ? 'rgba(29,186,135,.15)' : 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '.8rem', color: i === 0 ? 'var(--mint)' : 'var(--ink3)' }}>
                            {i + 1}
                          </div>
                        </td>
                        <td>
                          <p style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.9rem', color: 'var(--ink)', marginBottom: 6 }}>{p.name}</p>
                          <div className="hl-bar-track" style={{ width: 120 }}>
                            <div className="hl-bar-fill" style={{ width: `${pct}%`, background: i === 0 ? 'var(--mint)' : 'var(--ink3)' }} />
                          </div>
                        </td>
                        <td>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8rem', color: 'var(--ink)', fontWeight: 700 }}>{p._sum.quantity}</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.8rem', color: 'var(--ink)', fontWeight: 700 }}>{fmt(p._sum.revenue || 0)}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <Link to={`/dashboard/inventory/${p.id}`} className="hl-btn-ghost">
                            <ChevronRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Restock Alerts */}
            <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .32s both' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'rgba(245,166,35,.1)', border: '1px solid rgba(245,166,35,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={14} color="#D97706" />
                  </div>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.95rem', color: 'var(--ink)', textTransform: 'uppercase' }}>Restock Alerts</h3>
                </div>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {restockAlerts.length === 0 && (
                  <div style={{ padding: '30px 0', textAlign: 'center' }}>
                    <Package size={32} color="var(--ink3)" style={{ margin: '0 auto 12px', opacity: .5 }} />
                    <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.85rem', color: 'var(--ink3)', fontWeight: 600 }}>Optimal stock levels</p>
                  </div>
                )}
                {restockAlerts.map((item: any, i: number) => {
                  const isCritical = item.stockLevel === 0 || item.stockLevel <= (item.minLevel || 5) / 2
                  const pct = Math.min(100, Math.round((item.stockLevel / (item.minLevel || 5)) * 100))
                  return (
                    <div key={i} className="hl-attention-card" style={{ borderColor: isCritical ? 'rgba(239,68,68,.15)' : 'rgba(245,166,35,.15)', background: isCritical ? 'rgba(239,68,68,.03)' : 'rgba(245,166,35,.03)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <p style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 800, fontSize: '.88rem', color: 'var(--ink)' }}>{item.name}</p>
                        <span style={{ padding: '2px 8px', borderRadius: 6, fontFamily: "'JetBrains Mono',monospace", fontSize: '.5rem', fontWeight: 800, background: isCritical ? 'rgba(239,68,68,.12)' : 'rgba(245,166,35,.12)', color: isCritical ? '#EF4444' : '#D97706' }}>
                          {item.stockLevel === 0 ? 'EMPTY' : isCritical ? 'CRIT' : 'LOW'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 900, fontSize: '1.1rem', color: 'var(--ink)' }}>{item.stockLevel}</span>
                        <div className="hl-bar-track" style={{ flex: 1, height: 6 }}>
                          <div className="hl-bar-fill" style={{ width: `${pct}%`, background: isCritical ? '#EF4444' : '#F5A623' }} />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: 'var(--ink3)', fontWeight: 600 }}>MIN {item.minLevel || 5}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/dashboard/inventory/stock?id=${item.id}`} className="hl-btn-primary" style={{ flex: 1, padding: '8px 0', fontSize: '.75rem', justifyContent: 'center' }}>
                          Restock
                        </Link>
                        <Link to={`/dashboard/inventory/history?id=${item.id}`} className="hl-btn-outline" style={{ width: 36, padding: 0, justifyContent: 'center' }}>
                          <History size={13} />
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="hl-card" style={{ padding: '24px', animation: 'hl-up .5s ease .4s both', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 4 }}>System Log</p>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.95rem', color: 'var(--ink)', textTransform: 'uppercase' }}>Recent Activity</h3>
                </div>
                <span className="hl-live" />
              </div>

              {/* Timeline */}
              <div style={{ position: 'relative', paddingLeft: 22 }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1.5, background: 'var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {recentLogs.slice(0, 5).map((log: any, i: number) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -19, top: 4, width: 10, height: 10, borderRadius: '50%', background: i === 0 ? 'var(--mint)' : 'var(--surface)', border: `2.5px solid ${i === 0 ? 'var(--mint)' : 'var(--border)'}`, boxShadow: i === 0 ? '0 0 8px rgba(29,186,135,.4)' : 'none' }} />
                      <p style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.86rem', color: 'var(--ink)', lineHeight: 1.3, marginBottom: 4 }}>{log.action}</p>
                      <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.76rem', color: 'var(--ink3)', marginBottom: 6 }}>{log.details}</p>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.54rem', color: 'var(--ink3)', letterSpacing: '.08em', fontWeight: 600 }}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · TODAY
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/dashboard/reports" className="hl-btn-outline" style={{ width: '100%', marginTop: 24, justifyContent: 'center', fontSize: '.78rem' }}>
                Full Audit Log <ChevronRight size={13} />
              </Link>
            </div>

            {/* Quick Actions dark card */}
            <div className="hl-card-dark" style={{ padding: '24px', animation: 'hl-up .5s ease .46s both' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle, rgba(29,186,135,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', marginBottom: 18 }}>Management Tools</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Record New Sale',       to: '/dashboard/sales/new',      icon: ShoppingCart },
                  { label: 'Log Business Expense',   to: '/dashboard/expenses/new',   icon: Wallet },
                  { label: 'Inventory Manager',     to: '/dashboard/inventory',      icon: Package },
                  { label: 'Performance Analytics',  to: '/dashboard/reports',        icon: BarChart3 },
                ].map((a, i) => (
                  <Link key={i} to={a.to} className="hl-nav-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', textDecoration: 'none', fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.84rem', transition: 'all .25s' }}
                    onMouseEnter={e => { (e.currentTarget as any).style.background = 'rgba(29,186,135,.15)'; (e.currentTarget as any).style.borderColor = 'rgba(29,186,135,.2)'; (e.currentTarget as any).style.color = '#fff' }}
                    onMouseLeave={e => { (e.currentTarget as any).style.background = 'rgba(255,255,255,.04)'; (e.currentTarget as any).style.borderColor = 'rgba(255,255,255,.06)'; (e.currentTarget as any).style.color = 'rgba(255,255,255,.7)' }}>
                    <a.icon size={15} />
                    {a.label}
                    <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: .3 }} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
