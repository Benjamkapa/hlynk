import { useQuery } from '@tanstack/react-query'
import { 
  Users, Activity, TrendingUp, AlertCircle, TrendingDown, 
  ShieldCheck, Globe, Zap, Server, Database, PlusCircle,
  Clock, CreditCard, DollarSign, Megaphone, BarChart3,
  ExternalLink, ChevronRight, Ban, Play
} from 'lucide-react'
import { adminApi } from '../../lib/api/providers'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

const formatKES = (val: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val)

export default function AdminDashboardPage() {
  const { data: statsData, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: adminApi.getStats })

  const stats = statsData?.data || {
    overview: { totalProviders: 0, activeToday: 0, trialsRunning: 0, expiredTrials: 0, payingProviders: 0, revenueThisMonth: 0 },
    trials: { newToday: 0, expiringSoon: 0, conversions: 0, conversionRate: 0 },
    atRisk: [],
    recentRegistrations: [],
    trends: { weeklyGrowth: [], monthlyRevenue: [], dailyActive: [] }
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* ── Section 6: Quick Admin Actions ─────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground font-ubuntu tracking-tight">Platform Operations</h1>
          <p className="text-muted-foreground text-sm font-nunito mt-1">Global growth and performance monitor</p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          <button className="btn-secondary h-11 px-4 text-xs font-black uppercase tracking-widest"><Megaphone size={16} /> Broadcast</button>
          <button className="btn-secondary h-11 px-4 text-xs font-black uppercase tracking-widest"><BarChart3 size={16} /> Export</button>
          <button className="btn-primary h-11 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"><PlusCircle size={18} /> Add Provider</button>
        </div>
      </div>

      {/* ── Section 1: Platform Overview ───────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Providers', value: stats.overview.totalProviders, icon: Users, color: 'text-primary' },
          { label: 'Active Today', value: stats.overview.activeToday, icon: Activity, color: 'text-emerald-600' },
          { label: 'Trials Running', value: stats.overview.trialsRunning, icon: Zap, color: 'text-amber-500' },
          { label: 'Expired Trials', value: stats.overview.expiredTrials, icon: AlertCircle, color: 'text-red-500' },
          { label: 'Paying Clients', value: stats.overview.payingProviders, icon: ShieldCheck, color: 'text-blue-600' },
          { label: 'Revenue (KES)', value: formatKES(stats.overview.revenueThisMonth), icon: DollarSign, color: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className={`h-10 w-10 rounded-xl ${s.color.replace('text-', 'bg-')}/10 ${s.color} flex items-center justify-center mb-4 border border-current/5`}>
              <s.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-base font-black text-foreground font-ubuntu truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ── Section 4: Growth Trends ─────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="card p-8">
                <h3 className="text-lg font-black text-foreground font-ubuntu mb-8">New Providers</h3>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.trends.weeklyGrowth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9EC" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7A8896', fontWeight: 800 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7A8896', fontWeight: 800 }} />
                      <Tooltip 
                        cursor={{ fill: '#F5F7F8' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#20C997" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="card p-8">
                <h3 className="text-lg font-black text-foreground font-ubuntu mb-8">Revenue Trend</h3>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.trends.monthlyRevenue}>
                      <defs>
                        <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#20C997" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#20C997" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9EC" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7A8896', fontWeight: 800 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7A8896', fontWeight: 800 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#20C997" strokeWidth={4} fill="url(#adminRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* ── Section 5: Recent Registrations ──────────────────────── */}
          <div className="card overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground font-ubuntu">Recent Registrations</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-transform flex items-center gap-2">
                All Businesses <ChevronRight size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F9FAFB]/50">
                  <tr>
                    <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Business</th>
                    <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Owner / Location</th>
                    <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Plan</th>
                    <th className="text-right px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stats.recentRegistrations.map((biz: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="font-bold text-foreground font-ubuntu truncate max-w-[150px]">{biz.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tight">{new Date(biz.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="font-bold text-foreground text-xs">{biz.owner}</p>
                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tight">{biz.location}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${biz.plan === 'TRIAL' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          {biz.plan}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button className="h-8 w-8 rounded-lg bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm">
                          <ExternalLink size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ── Section 2: Trial Conversion Monitor ──────────────────── */}
          <div className="card p-8 bg-white border-blue-100">
            <h3 className="text-lg font-black text-foreground font-ubuntu mb-8">Trial Conversions</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">New Trials</p>
                <p className="text-2xl font-black text-foreground font-ubuntu">{stats.trials.newToday}</p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Expiring</p>
                <p className="text-2xl font-black text-foreground font-ubuntu">{stats.trials.expiringSoon}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-muted-foreground">Conversion Rate</span>
                 <span className="text-xs font-black text-primary">{stats.trials.conversionRate.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${stats.trials.conversionRate}%` }} />
              </div>
            </div>
          </div>

          {/* ── Section 3: At-Risk Businesses ────────────────────────── */}
          <div className="card p-8">
            <h3 className="text-lg font-black text-foreground font-ubuntu mb-8">At-Risk Businesses</h3>
            <div className="space-y-4">
              {stats.atRisk.map((biz: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl border border-border hover:bg-muted/30 transition-all group">
                   <div className="flex justify-between items-start mb-2">
                     <p className="font-bold text-sm text-foreground font-ubuntu">{biz.name}</p>
                     <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">At Risk</span>
                   </div>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">Last Activity: {new Date(biz.lastLogin).toLocaleDateString()}</p>
                   <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="flex-1 py-2 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Remind</button>
                     <button className="p-2 bg-white border border-border rounded-lg text-red-500 hover:bg-red-50"><Ban size={14} /></button>
                   </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 7: System Status ─────────────────────────────── */}
          <div className="card p-8 bg-[#F9FAFB] border-border">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6">System Health</h3>
            <div className="space-y-4">
               {[
                 { label: 'API Gateway', status: 'Healthy', icon: Zap, color: 'text-emerald-500' },
                 { label: 'Database', status: 'Steady', icon: Database, color: 'text-blue-500' },
                 { label: 'SMS Gateway', status: 'Active', icon: Megaphone, color: 'text-emerald-500' },
               ].map((s, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <s.icon size={16} className="text-muted-foreground" />
                     <span className="text-xs font-bold text-foreground">{s.label}</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <div className={`h-1.5 w-1.5 rounded-full ${s.color.replace('text-', 'bg-')} animate-pulse`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${s.color}`}>{s.status}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
