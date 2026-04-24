import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp, TrendingDown, Package, DollarSign, PlusCircle,
  History, Wallet, ShoppingCart, Globe, FileText, Activity,
  AlertTriangle, ArrowUpRight, BarChart3, ChevronRight,
  ExternalLink, MousePointer2
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'

const formatKES = (val: number) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(val)

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: statsData, isLoading } = useQuery({ queryKey: ['provider-stats'], queryFn: providersApi.getStats })

  const stats = statsData?.data || {
    snapshot: { salesToday: 0, expensesToday: 0, profitToday: 0, lowStockCount: 0, transactionsToday: 0 },
    trends: { sales7Days: [], profit6Months: [] },
    topProducts: [],
    health: 'Stable',
    recentLogs: [],
    restockAlerts: []
  }

  const trialDays = stats.snapshot.subscription?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(stats.snapshot.subscription.trialEndDate).getTime() - Date.now()) / 86400000))
    : null

  const healthColors: Record<string, string> = {
    'Growing': 'text-emerald-500 bg-emerald-50',
    'Stable': 'text-blue-500 bg-blue-50',
    'Declining': 'text-red-500 bg-red-50',
  }

  return (
    <div className="animate-fade-in space-y-8 pb-20">
      {/* ── Section 4: Quick Actions Panel ───────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground font-ubuntu tracking-tight">Business Overview</h1>
          <p className="text-muted-foreground text-sm font-nunito mt-1">Daily control panel for {user?.businessName}</p>
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-3">
          <button className="btn-secondary h-11 px-4 text-xs font-black uppercase tracking-widest"><FileText size={16} /> Reports</button>
          <button className="btn-secondary h-11 px-4 text-xs font-black uppercase tracking-widest"><Globe size={16} /> Public Page</button>
          <button className="btn-primary h-11 px-6 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"><PlusCircle size={18} /> Record Sale</button>
        </div>
      </div>

      {/* ── Section 1: Today's Snapshot ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Sales Today', value: formatKES(stats.snapshot.salesToday), icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Expenses Today', value: formatKES(stats.snapshot.expensesToday), icon: Wallet, color: 'text-red-500' },
          { label: 'Profit Today', value: formatKES(stats.snapshot.profitToday), icon: TrendingUp, color: 'text-primary' },
          { label: 'Low Stock', value: stats.snapshot.lowStockCount, icon: Package, color: 'text-amber-500' },
          { label: 'Transactions', value: stats.snapshot.transactionsToday, icon: ShoppingCart, color: 'text-blue-500' },
          { label: 'Subscription', value: stats.snapshot.subscription?.planName || 'Trial', sub: `${trialDays} days left`, icon: Activity, color: 'text-purple-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group">
            <div className={`h-10 w-10 rounded-xl ${s.color.replace('text-', 'bg-')}/10 ${s.color} flex items-center justify-center mb-4 border border-current/5`}>
              <s.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-base font-black text-foreground font-ubuntu truncate">{s.value}</p>
            {s.sub && <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-tight">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* ── Section 3: Sales Performance ─────────────────────────── */}
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-black text-foreground font-ubuntu">Sales Performance</h3>
                <p className="text-xs text-muted-foreground font-nunito">Weekly revenue tracking</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gross Sales</span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends.sales7Days}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#20C997" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#20C997" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9EC" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7A8896', fontWeight: 800 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#7A8896', fontWeight: 800 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#20C997" strokeWidth={4} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ── Section 5: Top Products ────────────────────────────── */}
            <div className="card p-8">
              <h3 className="text-lg font-black text-foreground font-ubuntu mb-6">Top Products</h3>
              <div className="space-y-4">
                {stats.topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:bg-muted/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground font-ubuntu truncate max-w-[120px]">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{p._sum.quantity} units sold</p>
                      </div>
                    </div>
                    <ArrowUpRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 6: Business Health ─────────────────────────── */}
            <div className="card p-8 flex flex-col items-center justify-center text-center">
              <div className={`h-20 w-20 rounded-3xl flex items-center justify-center mb-6 shadow-inner ${healthColors[stats.health]}`}>
                <Activity size={40} />
              </div>
              <h3 className="text-xl font-black text-foreground font-ubuntu tracking-tight">Business Health</h3>
              <p className={`mt-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${healthColors[stats.health]}`}>
                {stats.health}
              </p>
              <p className="text-xs text-muted-foreground mt-4 font-nunito leading-relaxed px-4">
                Your revenue is <span className="font-bold text-foreground">{stats.health === 'Growing' ? 'up' : 'stable'}</span> compared to last month. Keep recording sales to maintain accuracy.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* ── Section 2: Restock Alerts ───────────────────────────── */}
          <div className="card p-8 bg-white border-amber-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-black text-foreground font-ubuntu">Restock Alerts</h3>
              </div>
              <Link to="/dashboard/inventory" className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-all">
                <PlusCircle size={18} />
              </Link>
            </div>
            <div className="space-y-4">
              {stats.restockAlerts.map((item: any, i: number) => (
                <div key={i} className="p-4 rounded-2xl border border-border bg-[#FFFBF0] border-amber-100">
                  <div className="flex justify-between items-start mb-3">
                    <p className="font-bold text-sm text-foreground font-ubuntu">{item.name}</p>
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${item.stockLevel === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                      {item.stockLevel === 0 ? 'Out of Stock' : item.stockLevel <= item.minLevel / 2 ? 'Critical' : 'Low'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground">{item.stockLevel}</span>
                      <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(item.stockLevel / item.minLevel) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Min: {item.minLevel}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 bg-white border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50">Restock</button>
                    <button className="p-2 bg-white border border-border rounded-lg text-muted-foreground hover:text-foreground"><History size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 7: Recent Activity Feed ─────────────────────── */}
          <div className="card p-8">
            <h3 className="text-lg font-black text-foreground font-ubuntu mb-8">Recent Activity</h3>
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
              {stats.recentLogs.map((log: any, i: number) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full bg-white border border-border flex items-center justify-center z-10">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground font-ubuntu leading-tight">{log.action}</p>
                  <p className="text-xs text-muted-foreground font-nunito mt-1">{log.details}</p>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-2">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-muted text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all">
              View Activity History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
