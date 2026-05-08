import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { DollarSign, TrendingUp, PieChart, ArrowUpRight, Download, Search, Filter, CheckCircle2, Clock, CreditCard, Activity, Landmark, Wallet } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

import { useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function FinancialsPage() {
  const { data: rawStats, error } = useQuery<any>({
    queryKey: ['financial-stats'],
    queryFn: () => adminApi.getStats('DAILY')
  })
  
  const stats = rawStats?.data || rawStats;

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const revenueData = stats?.trends?.revenueTrend?.map((r: any) => ({
    name: r.name,
    revenue: r.value,
    profit: r.value * 0.8 // Simulate net profit
  })) || []

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Financial Ledger</h1>
          <p className="text-slate-500 font-medium text-xl">Global revenue orchestration and payout monitoring</p>
        </div>
        <div className="flex gap-4">
           <a href="/admin/audit" className="px-6 py-3 bg-white border border-slate-200 rounded-md text-xs font-black hover:bg-slate-50 transition-all uppercase tracking-widest text-slate-600 block flex items-center justify-center">
             Audit Trail
           </a>
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('accessToken')
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/admin/financials/export?type=SALES`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                  })
                  if (!response.ok) throw new Error('Export failed')
                  const blob = await response.blob()
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `financial-report-${Date.now()}.csv`
                  document.body.appendChild(a)
                  a.click()
                  a.remove()
                } catch (err) {
                  toast.error('Failed to export report')
                }
              }}
              className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 shadow-xl shadow-emerald-900/10"
            >
              <Download size={18} /> Export Reports
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <FinancialStatCard title="Total Volume (YTD)" value={`KES ${(stats?.overview?.revenueThisMonth || 0).toLocaleString()}`} sub="This Month" icon={Landmark} color="emerald" />
        <FinancialStatCard title="Platform Fees" value={`KES ${((stats?.overview?.revenueThisMonth || 0) * 0.05).toLocaleString()}`} sub="Gross Fees collected (Est 5%)" icon={DollarSign} color="blue" />
        <FinancialStatCard title="Paying Providers" value={`${(stats?.overview?.payingProviders || 0).toLocaleString()}`} sub="Active Subscriptions" icon={CreditCard} color="purple" />
        <FinancialStatCard title="New Providers" value={`${(stats?.overview?.activeToday || 0).toLocaleString()}`} sub="Current Day" icon={Wallet} color="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 bg-white p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-12 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Revenue Performance</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Comparing Platform Gross vs Net Income</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</span>
              </div>
            </div>
          </div>
          <div className="h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  cursor={{fill: '#F8FAFC'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="profit" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute bottom-0 right-0 h-64 w-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mb-32 opacity-50" />
        </div>

        <div className="space-y-10">
            <div className="bg-emerald-900 rounded-lg p-10 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
               <div className="relative z-10">
                 <PieChart size={40} className="text-emerald-400 mb-6" />
                 <h4 className="text-xl font-black mb-2">Payout Health</h4>
                 <p className="text-emerald-200/80 text-sm font-medium leading-relaxed mb-8">
                   Platform fee collection is active. Settlements are calculated based on the last 48 hours of transaction volume.
                 </p>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-4">
                       <span className="text-emerald-400">Pending Settlement</span>
                       <span className="hl-mono">KES {(stats?.overview?.totalPendingPayouts || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold pt-2">
                       <span className="text-emerald-400">Total Gross Fees</span>
                       <span className="hl-mono">KES {(stats?.overview?.totalGrossFees || 0).toLocaleString()}</span>
                    </div>
                 </div>
               </div>
               <Landmark size={180} className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12" />
            </div>

           <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
              <h4 className="text-lg font-black text-slate-900 mb-6">Recent Adjustments</h4>
              <div className="space-y-6">
                 {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((adj: any, i: number) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                             <Activity size={18} />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">{adj.event}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{adj.entity}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black hl-mono text-slate-900">SYSTEM</p>
                          <p className="text-[10px] text-slate-400 font-bold hl-mono uppercase">
                            {new Date(adj.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                       </div>
                    </div>
                 )) : (
                    <p className="text-xs text-slate-400 font-bold text-center py-4">No recent adjustments</p>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}

function FinancialStatCard({ title, value, sub, icon: Icon, color }: any) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
      <div className={`h-14 w-14 rounded-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorMap[color as keyof typeof colorMap]}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex items-baseline gap-3">
           <h2 className="text-3xl font-black text-slate-900 hl-mono tracking-tighter">{value}</h2>
           <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 hl-mono">
              <TrendingUp size={12} /> 8.4%
           </span>
        </div>
        <p className="text-xs text-gray-500 font-bold mt-2">{sub}</p>
      </div>
    </div>
  )
}
