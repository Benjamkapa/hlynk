import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { adminApi } from '../../lib/api/providers'
import {
  Download, ArrowUpRight, ArrowDownRight, TrendingUp, Signal
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { ADMIN_CSS } from './hl-design-system'

const REVENUE_MIX = [
  { label: 'M-Pesa (Direct)', pct: 78, color: '#1DBA87' },
  { label: 'Bank Transfers',  pct: 15, color: '#3B82F6' },
  { label: 'Cards (Stripe)',  pct: 7,  color: '#F5A623' },
]

const CATEGORY_REVENUE = [
  { category: 'Barber & Salon',    providers: 42, revenue: 88200,  share: '26%' },
  { category: 'Cleaning Services', providers: 31, revenue: 65100,  share: '19%' },
  { category: 'Mechanic',          providers: 28, revenue: 58800,  share: '17%' },
  { category: 'Plumbing',          providers: 22, revenue: 46200,  share: '14%' },
  { category: 'Other',             providers: 41, revenue: 82700,  share: '24%' },
]

const fmt = (v: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v)

const fmtK = (v: number) => v >= 1000 ? `${Math.round(v / 1000)}K` : String(v)

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(13,36,25,.1)', borderRadius: 6, padding: '10px 14px', boxShadow: '0 8px 24px rgba(13,36,25,.1)', fontFamily: "'Figtree',sans-serif" }}>
      <p style={{ fontSize: '.72rem', color: '#8FA398', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '.92rem', fontWeight: 800, color: '#0D1B12' }}>
        KES {fmtK(payload[0].value)}
      </p>
    </div>
  )
}

export default function AdminRevenuePage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.pathname.includes('/payments') ? 'payments' : 'report')
  
  useEffect(() => {
    setActiveTab(location.pathname.includes('/payments') ? 'payments' : 'report')
  }, [location.pathname])

  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats })
  const stats = data?.data
  const revenueTrend = stats?.trends?.monthlyRevenue || []
  const monthly = stats?.overview?.revenueThisMonth || 0

  const kpis = [
    { label: 'Monthly Revenue', value: fmt(monthly || 340000), trend: '+12%', up: true },
    { label: 'Avg Revenue/User', value: 'KES 2,450', trend: '+2%', up: true },
    { label: 'Outstanding Dues', value: 'KES 12,800', trend: '-5%', up: false },
    { label: 'Lifetime Revenue', value: 'KES 1.2M', trend: '+9%', up: true },
  ]

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Financial Intelligence</h1>
            <p className="hl-page-subtitle">Global revenue tracking and platform earnings</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="hl-tab-bar">
              <button className={`hl-tab ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>Earnings Report</button>
              <button className={`hl-tab ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => setActiveTab('payments')}>Payments History</button>
            </div>
            <button className="hl-btn-outline"><Download size={14} /> Export</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="hl-grid-4" style={{ marginBottom: 20 }}>
          {kpis.map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '22px', animation: `hl-up .45s ease ${i * .06}s both` }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(13,36,25,.06)', border: '1px solid rgba(13,36,25,.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <TrendingUp size={14} color="var(--forest)" />
              </div>
              <p className="hl-kpi-label">{k.label}</p>
              <p className="hl-kpi-value" style={{ fontSize: '1.5rem' }}>{k.value}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                <div className={`hl-trend ${k.up ? 'hl-trend-up' : 'hl-trend-dn'}`}>
                  {k.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                  {k.trend}
                </div>
                <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.7rem', color: 'var(--ink3)' }}>vs last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="hl-main-grid">
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Revenue Trend Chart */}
            <div className="hl-card" style={{ animation: 'hl-up .5s ease .28s both' }}>
              <div className="hl-card-header">
                <h3>Platform Revenue Trend</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['6M', '1Y'].map(p => (
                    <button key={p} style={{
                      padding: '5px 12px', borderRadius: 100,
                      background: p === '6M' ? 'var(--surface2)' : 'none',
                      border: '1px solid var(--border)', cursor: 'pointer',
                      fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', fontWeight: 700,
                      color: p === '6M' ? 'var(--ink)' : 'var(--ink3)',
                    }}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="hl-card-body" style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend.length ? revenueTrend : [
                    { name: 'Nov', value: 195000 }, { name: 'Dec', value: 220000 },
                    { name: 'Jan', value: 255000 }, { name: 'Feb', value: 280000 },
                    { name: 'Mar', value: 310000 }, { name: 'Apr', value: 340000 },
                  ]}>
                    <defs>
                      <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1DBA87" stopOpacity={0.14} />
                        <stop offset="100%" stopColor="#1DBA87" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                      tick={{ fontSize: 9, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} dy={8} />
                    <YAxis axisLine={false} tickLine={false}
                      tick={{ fontSize: 9, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }}
                      tickFormatter={fmtK} />
                    <Tooltip content={<ChartTip />} />
                    <Area type="monotone" dataKey="value" stroke="#1DBA87" strokeWidth={2.5}
                      fill="url(#rev-grad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Revenue Table */}
            <div className="hl-card" style={{ overflow: 'hidden', animation: 'hl-up .5s ease .34s both' }}>
              <div className="hl-card-header"><h3>Revenue by Category</h3></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="hl-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Providers</th>
                      <th>Revenue</th>
                      <th>Platform Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORY_REVENUE.map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700 }}>{r.category}</td>
                        <td style={{ color: 'var(--ink3)', fontFamily: "'JetBrains Mono',monospace", fontSize: '.72rem' }}>{r.providers}</td>
                        <td style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.75rem', fontWeight: 700 }}>{fmt(r.revenue)}</td>
                        <td><span className="hl-badge hl-badge-active">{r.share}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Revenue Mix */}
            <div className="hl-card" style={{ animation: 'hl-up .5s ease .32s both' }}>
              <div className="hl-card-header"><h3>Revenue Mix</h3></div>
              <div className="hl-card-body">
                {REVENUE_MIX.map((m, i) => (
                  <div key={i} style={{ marginBottom: i < REVENUE_MIX.length - 1 ? 16 : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.82rem', color: 'var(--ink)' }}>{m.label}</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', fontWeight: 700, color: m.color }}>{m.pct}%</span>
                    </div>
                    <div className="hl-bar-track">
                      <div className="hl-bar-fill" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
                <div className="hl-stat-highlight" style={{ marginTop: 18 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 6, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 4px rgba(13,36,25,.08)' }}>
                      <TrendingUp size={16} color="var(--mint)" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Forecasting</p>
                      <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.8rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4 }}>
                        Next month projected to hit{' '}
                        <span style={{ color: 'var(--mint)' }}>KES 480K</span> based on current growth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MRR Dark Card */}
            <div className="hl-card-dark" style={{ padding: '22px', animation: 'hl-up .5s ease .38s both' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 90, height: 90, background: 'radial-gradient(circle, rgba(29,186,135,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                <Signal size={12} color="#1DBA87" />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', textTransform: 'uppercase' }}>MRR Growth</span>
              </div>
              <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '2.4rem', color: '#fff', lineHeight: 1, letterSpacing: '-.03em', marginBottom: 4 }}>+22%</p>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: 'rgba(255,255,255,.4)' }}>month-over-month</p>
              <div className="hl-uptime-track" style={{ marginTop: 16 }}>
                <div className="hl-uptime-fill" style={{ width: '78%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: 'rgba(255,255,255,.3)' }}>Target: KES 500K</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.52rem', color: '#1DBA87' }}>78% to goal</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}