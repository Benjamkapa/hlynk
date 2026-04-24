import { BarChart3, TrendingUp, Users, DollarSign, Download, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar
} from 'recharts'
import { PROVIDER_CSS, fmt } from '../admin/hl-design-system'

const CHART_DATA = [
  { name: 'MON', revenue: 4200, sales: 5 },
  { name: 'TUE', revenue: 3800, sales: 4 },
  { name: 'WED', revenue: 5100, sales: 7 },
  { name: 'THU', revenue: 4600, sales: 6 },
  { name: 'FRI', revenue: 7200, sales: 10 },
  { name: 'SAT', revenue: 8500, sales: 12 },
  { name: 'SUN', revenue: 3200, sales: 3 },
]

export default function ReportsPage() {
  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Executive Analytics</h1>
            <p className="hl-page-subtitle">Deep dive into revenue streams and operational efficiency</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="hl-btn-outline" style={{ borderRadius: 10 }}>
              <Calendar size={15} /> Last 7 Days
            </button>
            <button className="hl-btn-primary">
              <Download size={15} /> Export Intelligence
            </button>
          </div>
        </div>

        {/* Intelligence Cards */}
        <div className="hl-grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Weekly Gross', value: '36,640', trend: '+18.4%', Icon: DollarSign, accent: '#1DBA87', up: true },
            { label: 'New Client Flow', value: '14', trend: '+5.2%', Icon: Users, accent: '#3B82F6', up: true },
            { label: 'Average Payload', value: '1,450', trend: '-2.1%', Icon: BarChart3, accent: '#F5A623', up: false },
            { label: 'Fulfillment Rate', value: '98.2%', trend: '+0.8%', Icon: TrendingUp, accent: '#8B5CF6', up: true },
          ].map((s, i) => (
            <div key={i} className="hl-card hl-kpi" style={{ padding: '24px', animation: `hl-up .4s ease ${i * .08}s both` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.accent}12`, border: `1px solid ${s.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent }}>
                  <s.Icon size={16} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: s.up ? 'var(--mint)' : '#EF4444', fontSize: '.7rem', fontWeight: 800, fontFamily: "'JetBrains Mono',monospace" }}>
                   {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                   {s.trend}
                </div>
              </div>
              <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink3)', marginBottom: 6 }}>{s.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                 {s.label.includes('Gross') && <span style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--ink3)' }}>KES</span>}
                 <p style={{ fontFamily: "'Saira',sans-serif", fontWeight: 800, fontSize: '1.8rem', color: 'var(--ink)', lineHeight: 1 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hl-grid-2">
          {/* Revenue Chart */}
          <div className="hl-card" style={{ padding: '24px', animation: 'hl-up .5s ease .2s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
               <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Revenue Velocity</h3>
               <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>7-DAY WINDOW</span>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--mint)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="var(--mint)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--ink3)', fontWeight: 800, fontFamily: 'JetBrains Mono' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--ink3)', fontWeight: 800, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontFamily: 'Nunito', fontSize: '.8rem' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--mint)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="hl-card" style={{ padding: '24px', animation: 'hl-up .5s ease .25s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
               <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '.85rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>Transactional Volume</h3>
               <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '.58rem', color: 'var(--ink3)', fontWeight: 600 }}>DAILY SUCCESSFUL SALES</span>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--ink3)', fontWeight: 800, fontFamily: 'JetBrains Mono' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--ink3)', fontWeight: 800, fontFamily: 'JetBrains Mono' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', fontFamily: 'Nunito', fontSize: '.8rem' }}
                    cursor={{ fill: 'var(--surface2)' }}
                  />
                  <Bar dataKey="sales" fill="var(--forest)" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
