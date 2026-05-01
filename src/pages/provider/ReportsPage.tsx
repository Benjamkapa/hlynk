import { TrendingUp, TrendingDown, Download, BarChart3, PieChart, Loader2, RefreshCcw, Filter, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import { useState, useEffect } from 'react'
import { ProviderStats } from '../../lib/types/api'

export default function ReportsPage() {
  const [logPage, setLogPage] = useState(1)
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ProviderStats>({
    queryKey: ['provider-reports'],
    queryFn: providersApi.getStats
  })

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['activity-logs', logPage],
    queryFn: () => providersApi.getActivityLogs({ page: logPage, limit: 10 })
  })

  useEffect(() => {
    if (statsError) toast.error(getErrorMessage(statsError))
  }, [statsError])

  if (statsLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 size={40} className="animate-spin text-emerald-600" />
    </div>
  )

  const chartData = stats?.salesChart || []

  const handleExport = () => {
    if (!stats) return
    exportToCSV(chartData, 'weekly_performance')
    toast.success('Report exported to CSV')
  }

  const handleLogExport = () => {
    if (!logsData?.items) return
    exportToCSV(logsData.items, 'activity_logs')
    toast.success('Logs exported to CSV')
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Reports</h1>
          <p className="text-gray-500 font-medium">Deep dive into your sales velocity and profit margins</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-white text-gray-600 h-12 px-6 rounded-xl border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Download size={18} />
          Export All Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900">Weekly Performance</h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gross Sales</span>
               </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600, fontFamily: 'JetBrains Mono'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600, fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  cursor={{stroke: '#10B981', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono', fontWeight: 800 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0D4A3E] p-8 rounded-[14px] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-2">Estimated Profit (MTD)</p>
              <h2 className="text-3xl font-black mb-6 hl-mono">KES {Number(stats?.profit || 0).toLocaleString()}</h2>
              <div className="flex items-center gap-2 text-xs font-black bg-white/10 w-fit px-4 py-2 rounded-lg uppercase tracking-widest hl-mono">
                <TrendingUp size={16} />
                +15.4%
              </div>
            </div>
            <BarChart3 size={120} className="absolute -right-6 -bottom-6 text-white opacity-5 rotate-12" />
          </div>

          <div className="bg-white p-8 rounded-[14px] border border-gray-100 shadow-sm relative overflow-hidden">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Out of Stock Alerts</p>
            <h2 className="text-3xl font-black text-gray-900 mb-6 hl-mono">{stats?.outOfStockCount || 0} ITEMS</h2>
            <div className="flex items-center gap-2 text-xs font-black text-red-500 bg-red-50 w-fit px-4 py-2 rounded-lg uppercase tracking-widest hl-mono">
              <TrendingDown size={16} />
              Requires Action
            </div>
            <PieChart size={120} className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 rotate-12" />
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm overflow-hidden mt-12">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h3 className="text-xl font-black text-gray-900 mb-1">User Activity Logs</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{logsData?.pagination?.total || 0} log entries recorded</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => refetchLogs()} className="h-10 px-4 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all border border-gray-100">
                <RefreshCcw size={14} /> Refresh
             </button>
             <button onClick={handleLogExport} className="h-10 px-4 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all border border-gray-100">
                <FileText size={14} /> Export CSV
             </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-8 py-4 bg-slate-50/50 border-b border-gray-50 flex gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search log name or details..." className="w-full bg-white border border-gray-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium" />
           </div>
           <button className="h-10 px-6 bg-[#0D4A3E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Filter size={14} /> Filter
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Date & Time</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">User</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Log Name</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">Details</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-center">IP Address</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 text-right">Action ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logsLoading ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic">Accessing system logs...</td></tr>
              ) : logsData?.items?.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-400 italic font-medium">No activity recorded in this period</td></tr>
              ) : (
                logsData?.items.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-6">
                       <p className="text-sm font-black text-gray-900 leading-none mb-1">{new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                       <p className="text-[10px] font-bold text-gray-400 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center overflow-hidden border border-emerald-50">
                             {log.user?.photoUrl ? (
                               <img src={log.user.photoUrl} alt="" className="h-full w-full object-cover" />
                             ) : (
                               <span className="text-[10px] font-black text-emerald-600">{log.user?.name?.substring(0, 2).toUpperCase()}</span>
                             )}
                          </div>
                          <div>
                             <p className="text-xs font-black text-gray-900 leading-none mb-1">{log.user?.name || 'System'}</p>
                             <p className="text-[10px] font-medium text-gray-400">{log.user?.email}</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                       <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                          {log.logName || log.action}
                       </span>
                    </td>
                    <td className="p-6">
                       <p className="text-xs font-medium text-gray-500 max-w-[240px] truncate">{log.details}</p>
                    </td>
                    <td className="p-6 text-center">
                       <p className="text-[10px] font-black text-gray-400 hl-mono">{log.ipAddress || '192.168.1.1'}</p>
                    </td>
                    <td className="p-6 text-right">
                       <p className="text-[10px] font-black text-emerald-600/40 hl-mono group-hover:text-emerald-600 transition-colors uppercase">{log.actionId || '#LOG-ID'}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-slate-50/20">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing {logsData?.items?.length || 0} of {logsData?.pagination?.total || 0} records
           </p>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="px-4 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-[10px] font-black hl-mono">
                 {logPage} / {logsData?.pagination?.pages || 1}
              </div>
              <button 
                onClick={() => setLogPage(p => Math.min(logsData?.pagination?.pages || 1, p + 1))}
                disabled={logPage === (logsData?.pagination?.pages || 1)}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}

function Search({ className, size }: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  )
}
