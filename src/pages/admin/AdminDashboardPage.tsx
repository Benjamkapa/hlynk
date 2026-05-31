import { useState } from 'react'
import {
  Users, Bell, Activity, 
  DollarSign, Landmark, 
  Zap, AlertTriangle, CheckCircle2,
  AlertCircle, TrendingUp, ArrowUpRight
} from 'lucide-react'
import {
  ResponsiveContainer, Tooltip, AreaChart, Area,
  XAxis, YAxis, CartesianGrid
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import Pagination from '../../components/shared/Pagination'


import { useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<'HOURLY' | 'DAILY'>('HOURLY')
  const [page, setPage] = useState(1)
  const { data: rawStats, isLoading, error } = useQuery<any>({
    queryKey: ['admin-stats-', timeframe],
    queryFn: () => adminApi.getStats(timeframe)
  })

  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => adminApi.getHealth(),
    refetchInterval: 10000 // Refetch every 10s
  })
  
  const stats = rawStats?.data || rawStats;
  const health = healthData?.data || healthData;

  useEffect(() => {
    if (error) toast.error('Failed to load system stats')
  }, [error])

  // Use API data or fallback to empty state for chart
  const revenueData = stats?.trends?.revenueTrend || []
  const recentEvents = stats?.recentActivity?.map((a: any) => ({
    id: `LOG-${a.id.substring(0,6)}`,
    event: a.event,
    entity: a.entity,
    user: a.user,
    time: new Date(a.time).toLocaleTimeString(),
    date: new Date(a.time).toLocaleDateString(),
    severity: a.event.toLowerCase().includes('delete') || a.event.toLowerCase().includes('error') ? 'High' : 'Medium'
  })) || []

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">System Overview</h1>
          <p className="text-slate-500 font-medium text-xl">Operational intelligence for hlynk platform</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex -space-x-3 pr-2">
              {stats?.overview?.activeAvatars?.length > 0 ? (
                stats.overview.activeAvatars.map((u: any, i: number) => (
                  <div key={i} className="relative group">
                    <img 
                      src={u.photoUrl} 
                      className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 object-cover" 
                      title={u.name} 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-200">
                  Awaiting Identities...
                </div>
              )}
            </div>
            {stats?.overview?.activeToday > 0 && (
              <div className="h-8 w-8 rounded-full border-2 border-white bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">+{stats?.overview?.activeToday || 0}</div>
            )}
           <div className="h-8 w-[1px] bg-slate-200" />
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest hl-mono">Cloud Active</span>
           </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
        <KpiCard title="Platform Revenue" value={`KES ${stats?.revenue?.total?.toLocaleString() || '0'}`} sub="Subscription Income" icon={DollarSign} trend="up" color="emerald" />
        <KpiCard title="Gross Volume (GMV)" value={`KES ${stats?.revenue?.platformVolume?.toLocaleString() || '0'}`} sub="Total sales processed" icon={Activity} trend="up" color="purple" />
        <KpiCard title="Paybill Collections" value={`KES ${stats?.revenue?.mpesaCollections?.toLocaleString() || '0'}`} sub="M-Pesa system flow" icon={Landmark} trend="up" color="blue" />
        <KpiCard title="Active Business" value={stats?.overview?.totalProviders?.toLocaleString() || '0'} sub={`${stats?.overview?.payingProviders || 0} Paying Subs`} icon={Users} trend="up" color="emerald" />
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Main Chart */}
        <div className="xl:col-span-2 bg-white p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Revenue Trajectory</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Global platform income over 24h</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-100">
              <button 
                onClick={() => setTimeframe('HOURLY')} 
                className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'HOURLY' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
              >
                Hourly
              </button>
              <button 
                onClick={() => setTimeframe('DAILY')} 
                className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === 'DAILY' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
              >
                Daily View
              </button>
            </div>
          </div>
          
          <div className="h-[400px] w-full relative z-10" style={{ minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={400} minWidth={0} debounce={100}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dx={-10} />
                <Tooltip 
                  cursor={{ stroke: '#F1F5F9', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={1} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  dot={false}
                  activeDot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
        </div>

        {/* Side Panel: Intelligence */}
        <div className="space-y-10">
          <div className="bg-slate-900 rounded-lg p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
             <div className="relative z-10">
               <h4 className="text-xl font-black mb-2">Live Intelligence</h4>
               <p className="text-slate-400 text-sm font-medium leading-relaxed">
                 {health?.database === 'up' 
                   ? 'Systems are operational. Cloud infrastructure is performing at peak efficiency.' 
                   : 'Attention: Database connectivity is experiencing high latency.'}
               </p>
               <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-md border border-white/10">
                     <span className="text-xs font-bold text-slate-400">Database Status</span>
                     <span className={`text-xs font-black uppercase ${health?.database === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {health?.database === 'up' ? 'Online' : 'Degraded'}
                     </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-md border border-white/10">
                     <span className="text-xs font-bold text-slate-400">Memory Cluster</span>
                     <span className="text-xs font-black text-blue-400 hl-mono">{health?.memoryUsage || 'Calculating...'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-md border border-white/10">
                     <span className="text-xs font-bold text-slate-400">DB Intelligence</span>
                     <span className="text-xs font-black text-emerald-400 hl-mono">{health?.dbLatency || '0ms'} Pulse</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-md border border-white/10">
                     <span className="text-xs font-bold text-slate-400">Errors (24h)</span>
                     <span className={`text-xs font-black hl-mono ${health?.errorsLast24h > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {health?.errorsLast24h || 0} Events
                     </span>
                  </div>
               </div>
             </div>
             <Activity size={180} className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12" />
          </div>

          <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm">
             <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center justify-between">
                Critical Events
                <span className="bg-red-50 text-red-600 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Live Audit</span>
             </h4>
             <div className="space-y-6">
                {recentEvents.length > 0 ? recentEvents.slice(0, 3).map((ev: any, i: number) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 ${
                      ev.severity === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <AlertCircle size={18} />
                    </div>
                    <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-none group-last:pb-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h5 className="text-xs font-black text-slate-900">{ev.event}</h5>
                        <span className="text-[9px] font-black text-slate-400 hl-mono">{ev.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{ev.entity}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 font-bold text-center py-4">No recent events</p>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Global Ledger Section */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black text-slate-900">Financial Ledger</h3>
            <p className="text-sm text-slate-400 font-medium">Real-time platform-wide transaction flow</p>
          </div>
          <Link to="/admin/audit" className="px-6 py-3 bg-slate-50 text-slate-600 rounded-md text-xs font-black hover:bg-slate-100 transition-all uppercase tracking-widest flex items-center gap-2">
            Global Audit
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity / Business</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.recentTransactions?.length > 0 ? stats.recentTransactions.slice((page - 1) * 5, page * 5).map((tx: any, i: number) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                  <td className="px-10 py-6 text-xs font-black text-slate-900 hl-mono">{tx.id}</td>
                  <td className="px-10 py-6">
                    <p className="font-black text-slate-900 text-sm">{tx.entity}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.user}</p>
                       <div className="h-1 w-1 rounded-full bg-slate-300" />
                       <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">{tx.status}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      tx.type === 'SALE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex flex-col items-end">
                       <p className="text-sm font-black text-slate-900 hl-mono">
                         {tx.amount > 0 ? `KES ${tx.amount.toLocaleString()}` : '--'}
                       </p>
                       <p className="text-[9px] font-bold text-slate-400 hl-mono">{new Date(tx.time).toLocaleTimeString()}</p>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                    No transactions recorded in the current window
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {stats?.recentTransactions?.length > 5 && (
          <div className="border-t border-slate-50 p-6">
            <Pagination 
              page={page}
              pages={Math.ceil((stats?.recentTransactions?.length || 0) / 5)}
              total={stats?.recentTransactions?.length || 0}
              onPageChange={setPage}
              label="Transaction"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({ title, value, sub, icon: Icon, color }: any) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    red: 'text-red-600 bg-red-50 border-red-100',
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
      <div className={`h-14 w-14 rounded-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorMap[color as keyof typeof colorMap]}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex items-baseline gap-3">
           <h2 className="text-3xl font-black text-slate-900 hl-mono tracking-tighter">{value}</h2>
           <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 hl-mono">
              <TrendingUp size={12} /> 12%
           </span>
        </div>
        <p className="text-xs text-slate-400 font-bold mt-2">{sub}</p>
      </div>
      <div className="absolute -right-2 -bottom-2 h-16 w-16 bg-slate-50 rounded-full opacity-50 transition-all group-hover:scale-150" />
    </div>
  )
}