import { TrendingUp, TrendingDown, Download, BarChart3, PieChart, Loader2, RefreshCcw, Filter, ChevronLeft, ChevronRight, FileText, Sparkles, Copy, BrainCircuit, Receipt } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import { useState, useEffect } from 'react'
import { ProviderStats } from '../../lib/types/api'
import FeatureGate from '../../components/shared/FeatureGate'

export default function ReportsPage() {
  const [logPage, setLogPage] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ProviderStats & { aiReportData?: any }>({
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

  const chartData = stats?.salesChart && stats.salesChart.length > 0 
    ? stats.salesChart 
    : Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          sales: 0,
          profit: 0
        };
      });

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
    <FeatureGate feature="advanced_reports">
      <div className="space-y-8 animate-in fade-in duration-500 pt-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Reports</h1>
            <p className="text-gray-500 font-medium">Deep dive into your sales velocity and profit margins</p>
          </div>
          <button 
            onClick={handleExport}
            className="bg-white text-gray-600 h-12 px-6 rounded-[.5em] border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <Download size={18} />
            Export All Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[.5em] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-900">Weekly Performance</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Comparison of your total sales vs actual take-home profit</p>
              </div>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gross Sales</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Net Profit</span>
                 </div>
              </div>
            </div>
            <div className="h-[300px] w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dx={-10} />
                    <Tooltip 
                      cursor={{ stroke: '#F1F5F9', strokeWidth: 1 }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', padding: '12px 16px' }}
                      itemStyle={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={1} fillOpacity={1} fill="url(#colorSales)" dot={false} activeDot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
                    <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={1} fillOpacity={1} fill="url(#colorProfit)" dot={false} activeDot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            {/* Gross Margin Card */}
            <div className="bg-[#0D4A3E] p-6 rounded-[.5rem] text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Gross Margin (MTD)</p>
                <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-3">Revenue − Cost of Goods</p>
                <h2 className="text-2xl font-black mb-4 hl-mono">KES {Number(stats?.cumulativeProfit || 0).toLocaleString()}</h2>
                <div className="flex items-center gap-2 text-xs font-black bg-white/10 w-fit px-4 py-2 rounded-[.5em] uppercase tracking-widest hl-mono">
                  <TrendingUp size={14} />
                  All Time
                </div>
              </div>
              <BarChart3 size={100} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
            </div>

            {/* True Net Profit Card */}
            {(() => {
              const mtdExpenses = stats?.mtdExpenses || 0;
              const mtdGross = stats?.mtdProfit || 0;
              const netProfit = stats?.mtdNetProfit ?? (mtdGross - mtdExpenses);
              const isPositive = netProfit >= 0;
              return (
                <div className={`p-6 rounded-[.5rem] text-white shadow-xl relative overflow-hidden ${
                  isPositive ? 'bg-blue-700 shadow-blue-900/20' : 'bg-rose-700 shadow-rose-900/20'
                }`}>
                  <div className="relative z-10">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">True Net Profit (MTD)</p>
                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-3">Gross Margin − Monthly Expenses</p>
                    <h2 className="text-2xl font-black mb-3 hl-mono">
                      {isPositive ? '' : '−'}KES {Math.abs(netProfit).toLocaleString()}
                    </h2>
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex justify-between text-[9px] font-black opacity-60 uppercase tracking-widest">
                        <span>MTD Gross Margin</span>
                        <span className="hl-mono">KES {mtdGross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-black opacity-60 uppercase tracking-widest">
                        <span>MTD Expenses</span>
                        <span className="hl-mono text-rose-300">− KES {mtdExpenses.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 text-xs font-black w-fit px-4 py-2 rounded-[.5em] uppercase tracking-widest hl-mono ${
                      isPositive ? 'bg-white/10' : 'bg-rose-900/40'
                    }`}>
                      {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {isPositive ? 'Profitable' : 'Loss'}
                    </div>
                  </div>
                  <Receipt size={100} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
                </div>
              );
            })()}

            <div className="bg-white p-8 rounded-[.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Out of Stock Alerts</p>
              <h2 className="text-3xl font-black text-gray-900 mb-6 hl-mono">{stats?.outOfStockCount || 0} ITEMS</h2>
              <div className="flex items-center gap-2 text-xs font-black text-red-500 bg-red-50 w-fit px-4 py-2 rounded-[.5em] uppercase tracking-widest hl-mono">
                <TrendingDown size={16} />
                Requires Action
              </div>
              <PieChart size={120} className="absolute -right-6 -bottom-6 text-gray-50 opacity-50 rotate-12" />
            </div>
          </div>
        </div>

      </div>
    </FeatureGate>
  )
}