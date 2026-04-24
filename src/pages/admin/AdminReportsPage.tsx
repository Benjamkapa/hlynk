import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import {
  Download, Calendar, ArrowUpRight, ArrowDownRight,
  TrendingUp, Filter
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell
} from 'recharts'
import { ADMIN_CSS } from './hl-design-system'

/* ─── Static data (replace with real API calls as needed) ─── */
const CATEGORY_DATA = [
  { name: 'Barber & Salon', value: 42, color: '#0D2419' },
  { name: 'Cleaning', value: 31, color: '#1DBA87' },
  { name: 'Mechanic', value: 28, color: '#F5A623' },
  { name: 'Plumbing', value: 22, color: '#3B82F6' },
  { name: 'Electrical', value: 17, color: '#8B5CF6' },
  { name: 'Moving', value: 14, color: '#EC4899' },
]

const GROWTH_DATA = [
  { name: 'Nov', signups: 18, churn: 4 },
  { name: 'Dec', signups: 24, churn: 6 },
  { name: 'Jan', signups: 21, churn: 3 },
  { name: 'Feb', signups: 28, churn: 5 },
  { name: 'Mar', signups: 32, churn: 4 },
  { name: 'Apr', signups: 38, churn: 3 },
]

const GEO_DATA = [
  { county: 'Nairobi', providers: 62, pct: 62 },
  { county: 'Mombasa', providers: 18, pct: 18 },
  { county: 'Nakuru', providers: 10, pct: 10 },
  { county: 'Kisumu', providers: 7, pct: 7 },
  { county: 'Other', providers: 3, pct: 3 },
]

const GEO_COLORS = ['#1DBA87', '#F5A623', '#3B82F6', '#8B5CF6', '#8FA398']

const PLAN_DATA = [
  { name: 'Trial', value: 38, color: '#F5A623' },
  { name: 'Starter', value: 28, color: '#1DBA87' },
  { name: 'Growth', value: 22, color: '#0D2419' },
  { name: 'Enterprise', value: 12, color: '#3B82F6' },
]

/* ─── Chart tooltip ─── */
function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(13,36,25,.1)', borderRadius: 6, padding: '10px 14px', boxShadow: '0 8px 24px rgba(13,36,25,.1)', fontFamily: "'Figtree',sans-serif" }}>
      <p style={{ fontSize: '.72rem', color: '#8FA398', marginBottom: 4 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ fontSize: '.88rem', fontWeight: 800, color: p.color || '#0D1B12' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

function TrendChip({ val, up }: { val: string; up: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
      <div className={`hl-trend ${up ? 'hl-trend-up' : 'hl-trend-dn'}`}>
        {up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
        {val}
      </div>
      <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.7rem', color: 'var(--ink3)' }}>vs last month</span>
    </div>
  )
}

export default function AdminReportsPage() {
  const { data } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats })
  const revenue = data?.data?.trends?.monthlyRevenue || []
  const [period, setPeriod] = useState<'6m' | '1y'>('6m')

  const kpis = [
    { label: 'Conversion Rate', value: '18.4%', trend: '+12%', up: true },
    { label: 'Retention (90d)', value: '92%', trend: '+2%', up: true },
    { label: 'Avg Session', value: '4m 12s', trend: '+5%', up: true },
    { label: 'Ticket Resolution', value: '98%', trend: '+1%', up: true },
  ]

  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>

        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Advanced Analytics</h1>
            <p className="hl-page-subtitle">Deep insights into platform performance & user behavior</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="hl-btn-outline"><Calendar size={14} /> This Quarter</button>
            <button className="hl-btn-primary"><Download size={14} /> Generate PDF</button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="hl-grid-4" style={{ marginBottom: 20 }}>
          {kpis.map((k, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '22px', animation: `hl-up .45s ease ${i * .06}s both` }}>
              <p className="hl-kpi-label">{k.label}</p>
              <p className="hl-kpi-value">{k.value}</p>
              <TrendChip val={k.trend} up={k.up} />
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="hl-grid-2" style={{ marginBottom: 18, animation: 'hl-up .5s ease .28s both' }}>

          {/* Category Popularity Bar */}
          <div className="hl-card">
            <div className="hl-card-header"><h3>Category Popularity</h3></div>
            <div className="hl-card-body" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_DATA} barCategoryGap="36%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} />
                  <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(13,36,25,.03)', radius: 8 }} />
                  <Bar dataKey="value" radius={[8, 8, 4, 4]}>
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="hl-card">
            <div className="hl-card-header">
              <h3>Geographic Distribution</h3>
              <span className="hl-badge hl-badge-active">Live</span>
            </div>
            <div className="hl-card-body">
              {GEO_DATA.map((g, i) => (
                <div key={i} style={{ marginBottom: i < GEO_DATA.length - 1 ? 14 : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontFamily: "'Figtree',sans-serif", fontWeight: 700, fontSize: '.82rem', color: 'var(--ink)' }}>{g.county}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.6rem', color: GEO_COLORS[i], fontWeight: 700 }}>{g.pct}%</span>
                  </div>
                  <div className="hl-bar-track">
                    <div className="hl-bar-fill" style={{ width: `${g.pct}%`, background: GEO_COLORS[i] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18, animation: 'hl-up .5s ease .34s both' }}>

          {/* Signups vs Churn */}
          <div className="hl-card">
            <div className="hl-card-header">
              <h3>Monthly Signups vs Churn</h3>
              <div style={{ display: 'flex', gap: 14 }}>
                {[['Signups', '#1DBA87'], ['Churn', '#EF4444']].map(([lbl, c]) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c as string, display: 'inline-block' }} />
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)' }}>{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hl-card-body" style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={GROWTH_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false}
                    tick={{ fontSize: 9, fill: '#8FA398', fontFamily: "'JetBrains Mono',monospace" }} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="signups" stroke="#1DBA87" strokeWidth={2.5} dot={{ r: 4, fill: '#1DBA87' }} name="Signups" />
                  <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#EF4444' }} name="Churn" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="hl-card">
            <div className="hl-card-header"><h3>Plan Distribution</h3></div>
            <div className="hl-card-body">
              <div style={{ height: 140, marginBottom: 16 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={PLAN_DATA} cx="50%" cy="50%" innerRadius={42} outerRadius={62}
                      dataKey="value" paddingAngle={3}>
                      {PLAN_DATA.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {PLAN_DATA.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
                      <span style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.8rem', fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
                    </div>
                    <span style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{p.value}%</span>
                  </div>
                ))}
              </div>
              <div className="hl-stat-highlight" style={{ marginTop: 16 }}>
                <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.55rem', color: 'var(--ink3)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Top Insight</p>
                <p style={{ fontFamily: "'Figtree',sans-serif", fontSize: '.8rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4 }}>
                  62% of trials convert within <span style={{ color: 'var(--mint)' }}>10 days</span> when a follow-up nudge is sent.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}