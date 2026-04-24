import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import {
  BarChart3, TrendingUp, Users, CreditCard, 
  ArrowUpRight, Download, Filter, Calendar, Loader2
} from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Line, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area
} from 'recharts'
import { ADMIN_CSS } from './hl-design-system'

const fmt = (v: number) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(v)

export default function AdminReportsPage() {
  const { data: statsData, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats })
  
  const stats = statsData?.data || {
    overview: { totalProviders: 0, revenueThisMonth: 0 },
    trials: { conversionRate: 0 },
    trends: { monthlyRevenue: [], weeklyGrowth: [] }
  }

  const reportData = stats.trends.monthlyRevenue.map((r: any, i: number) => ({
    name: r.name,
    revenue: r.value,
    users: stats.trends.weeklyGrowth[i]?.value || 0,
    trials: (stats.trends.weeklyGrowth[i]?.value || 0) * 1.5
  }))
  return (
    <>
      <style>{ADMIN_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 28px 60px' }}>
        
        {/* Header */}
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Growth Analytics</h1>
            <p className="hl-page-subtitle">Deep dive into platform KPIs and performance metrics</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="hl-btn-outline"><Calendar size={14} /> Last 30 Days</button>
            <button className="hl-btn-outline"><Filter size={14} /> Categories</button>
            <button className="hl-btn-primary"><Download size={14} /> Generate PDF</button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="hl-grid-4" style={{ marginBottom: 20 }}>
          {[
            { label: 'Active Users', value: '1,284', trend: '+14%', Icon: Users, color: '#3B82F6' },
            { label: 'MRR Growth', value: 'KES 420K', trend: '+8%', Icon: TrendingUp, color: '#1DBA87' },
            { label: 'Conversion', value: '12.4%', trend: '+2%', Icon: BarChart3, color: '#F5A623' },
            { label: 'Churn Rate', value: '2.1%', trend: '-1%', Icon: CreditCard, color: '#EF4444' },
          ].map((s, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '20px', animation: `hl-up .4s ease ${i * .06}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                  <s.Icon size={14} />
                </div>
                <span className="hl-trend-up" style={{ fontSize: '.65rem', fontWeight: 700 }}>{s.trend}</span>
              </div>
              <p className="hl-kpi-label">{s.label}</p>
              <p className="hl-kpi-value" style={{ fontSize: '1.4rem' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="hl-card" style={{ marginBottom: 20, animation: 'hl-up .5s ease .25s both' }}>
          <div className="hl-card-header">
            <h3>Combined Performance Overview</h3>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '.58rem', color: 'var(--ink3)', letterSpacing: '.06em' }}>REVENUE VS USER GROWTH</p>
          </div>
          <div className="hl-card-body" style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={reportData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1DBA87" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1DBA87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(13,36,25,.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8FA398', fontFamily: "'JetBrains Mono', monospace" }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8FA398', fontFamily: "'JetBrains Mono', monospace" }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8FA398', fontFamily: "'JetBrains Mono', monospace" }} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: "'Figtree', sans-serif" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: 20, fontFamily: "'Figtree', sans-serif", fontSize: '12px' }} />
                <Area yAxisId="left" type="monotone" dataKey="revenue" fill="url(#colorRev)" stroke="#1DBA87" strokeWidth={2} />
                <Bar yAxisId="right" dataKey="users" barSize={40} fill="#0D2419" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="trials" stroke="#F5A623" strokeWidth={2} dot={{ r: 4, fill: '#F5A623' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="hl-card" style={{ animation: 'hl-up .5s ease .35s both' }}>
            <div className="hl-card-header"><h3>Top Categories by Revenue</h3></div>
            <div className="hl-card-body">
              {[
                { label: 'Beauty & Wellness', value: 42, pct: 85 },
                { label: 'Electronics Repair', value: 38, pct: 72 },
                { label: 'Home Services', value: 25, pct: 45 },
                { label: 'Catering & Food', value: 18, pct: 30 },
              ].map((c, i) => (
                <div key={i} style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 700 }}>{c.label}</span>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--mint)' }}>{c.value}%</span>
                  </div>
                  <div className="hl-bar-track">
                    <div className="hl-bar-fill" style={{ width: `${c.pct}%`, background: 'var(--mint)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hl-card" style={{ padding: '24px', animation: 'hl-up .5s ease .4s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={20} color="var(--forest)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Quick Insights</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(29,186,135,.06)', border: '1px solid rgba(29,186,135,.12)' }}>
                <p style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--forest)', marginBottom: 4 }}>Conversion High</p>
                <p style={{ fontSize: '.78rem', color: 'var(--ink2)' }}>Trials from Beauty category are converting 2.4x faster than others.</p>
              </div>
              <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.12)' }}>
                <p style={{ fontSize: '.82rem', fontWeight: 700, color: '#1E40AF', marginBottom: 4 }}>Retention Alert</p>
                <p style={{ fontSize: '.78rem', color: 'var(--ink2)' }}>Expired trials have increased by 5% this week in Nairobi North region.</p>
              </div>
              <button className="hl-btn-primary" style={{ marginTop: 10, width: '100%' }}>View Full Detailed Report</button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}