import { TrendingUp, TrendingDown, Download, BarChart3, PieChart, Loader2, Receipt } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'
import { useEffect } from 'react'
import { ProviderStats } from '../../lib/types/api'
import FeatureGate from '../../components/shared/FeatureGate'

export default function ReportsPage() {
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<ProviderStats & { aiReportData?: any }>({
    queryKey: ['provider-reports'],
    queryFn: providersApi.getStats,
    refetchInterval: 15_000
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['activity-logs', 1],
    queryFn: () => providersApi.getActivityLogs({ page: 1, limit: 10 })
  })

  useEffect(() => {
    if (statsError) toast.error(getErrorMessage(statsError))
  }, [statsError])

  if (statsLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#0D4A3E]" />
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

  const mtdExpenses = stats?.mtdExpenses || 0;
  const mtdGross = stats?.mtdProfit || 0;
  const netProfit = stats?.mtdNetProfit ?? (mtdGross - mtdExpenses);
  const netIsPositive = netProfit >= 0;

  return (
    <FeatureGate feature="advanced_reports">
      <div className="space-y-8 pt-4">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Business reports</h1>
            <p className="text-gray-400 text-sm mt-0.5">Deep dive into your sales velocity and profit margins</p>
          </div>
          <button
            onClick={handleExport}
            className="h-9 px-4 rounded-[.5rem] text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download size={15} /> Export all data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly performance chart */}
          <div className="lg:col-span-2 bg-white rounded-[.5rem] border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Weekly performance</h3>
                <p className="text-xs text-gray-400 mt-0.5">Total sales vs actual take-home profit</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#0D4A3E]" />
                  <span className="text-xs text-gray-400">Gross sales</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-400">Net profit</span>
                </div>
              </div>
            </div>
            <div className="h-[260px] w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D4A3E" stopOpacity={0.06}/>
                      <stop offset="95%" stopColor="#0D4A3E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.06}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F9FAFB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dx={-10} />
                  <Tooltip
                    cursor={{ stroke: '#F3F4F6', strokeWidth: 1 }}
                    contentStyle={{ borderRadius: '.5rem', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.04)', padding: '10px 14px', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0D4A3E" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSales)" dot={false} activeDot={{ r: 4, fill: '#0D4A3E', strokeWidth: 2, stroke: '#fff' }} />
                  <Area type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorProfit)" dot={false} activeDot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            {/* Gross margin */}
            <div className="bg-[#0D4A3E] p-6 rounded-[.5rem] text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs opacity-60 mb-1">Gross margin (MTD)</p>
                <p className="text-xs opacity-40 mb-3">Revenue − cost of goods</p>
                <h2 className="text-2xl font-semibold mb-4 hl-mono">KES {Number(stats?.cumulativeProfit || 0).toLocaleString()}</h2>
                <div className="flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-[.5rem] hl-mono">
                  <TrendingUp size={13} />
                  All time
                </div>
              </div>
              <BarChart3 size={100} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
            </div>

            {/* True net profit */}
            <div className={`p-6 rounded-[.5rem] text-white relative overflow-hidden ${netIsPositive ? 'bg-blue-700' : 'bg-rose-700'}`}>
              <div className="relative z-10">
                <p className="text-xs opacity-60 mb-1">True net profit (MTD)</p>
                <p className="text-xs opacity-40 mb-3">Gross margin − monthly expenses</p>
                <h2 className="text-2xl font-semibold mb-3 hl-mono">
                  {netIsPositive ? '' : '−'}KES {Math.abs(netProfit).toLocaleString()}
                </h2>
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex justify-between text-xs opacity-60">
                    <span>MTD gross margin</span>
                    <span className="hl-mono">KES {mtdGross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs opacity-60">
                    <span>MTD expenses</span>
                    <span className="hl-mono text-rose-300">− KES {mtdExpenses.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-xs w-fit px-3 py-1.5 rounded-[.5rem] hl-mono ${netIsPositive ? 'bg-white/10' : 'bg-rose-900/40'}`}>
                  {netIsPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {netIsPositive ? 'Profitable' : 'Loss'}
                </div>
              </div>
              <Receipt size={100} className="absolute -right-4 -bottom-4 text-white opacity-5 rotate-12" />
            </div>

            {/* Out of stock */}
            <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 relative overflow-hidden">
              <p className="text-xs text-gray-400 mb-2">Out of stock alerts</p>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3 hl-mono">{stats?.outOfStockCount || 0} items</h2>
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 w-fit px-3 py-1.5 rounded-[.5rem]">
                <TrendingDown size={14} />
                Requires action
              </div>
              <PieChart size={110} className="absolute -right-6 -bottom-6 text-gray-50 opacity-70 rotate-12" />
            </div>
          </div>
        </div>

      </div>
    </FeatureGate>
  )
}