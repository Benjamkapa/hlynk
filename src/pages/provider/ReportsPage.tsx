import { TrendingUp, TrendingDown, Download, BarChart3, PieChart, Loader2 } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { useQuery } from '@tanstack/react-query'
import { providersApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { exportToCSV } from '../../lib/utils/export'

import { useEffect } from 'react'
import { ProviderStats } from '../../lib/types/api'

export default function ReportsPage() {
  const { data: stats, isLoading, error } = useQuery<ProviderStats>({
    queryKey: ['provider-reports'],
    queryFn: providersApi.getStats
  })

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  if (isLoading) return (
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600, fontFamily: 'JetBrains Mono'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF', fontWeight: 600, fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  cursor={{stroke: '#10B981', strokeWidth: 2}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
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
    </div>
  )
}
