import { useState } from 'react'
import { 
  Receipt, Plus, Search, Filter, 
  ArrowUpRight, Download, Calendar,
  Loader2, ShoppingBag
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { salesApi } from '../../lib/api/providers'

export default function SalesPage() {
  const [search, setSearch] = useState('')
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales', search],
    queryFn: () => salesApi.list({ search })
  })

  const sales = salesData?.data || []
  const stats = salesData?.stats || { today: 0, monthly: 0, average: 0, trend: '0%' }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0D1B12] font-nunito uppercase tracking-tight">Sales Records</h1>
          <p className="text-sm text-[#8FA398] font-medium">Track your daily revenue and transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#20C997] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#20C997]/20 hover:scale-105 transition-transform">
            <Plus size={18} />
            <span>Record Sale</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today's Revenue", value: `KES ${stats.today.toLocaleString()}`, trend: stats.trend, color: "#20C997" },
          { label: "Monthly Total", value: `KES ${stats.monthly.toLocaleString()}`, trend: "", color: "#3B82F6" },
          { label: "Average Sale", value: `KES ${stats.average.toLocaleString()}`, trend: "Stable", color: "#F5A623" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
            <p className="text-[10px] font-black text-[#8FA398] uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-[#0D1B12] font-saira">{kpi.value}</p>
            {kpi.trend && <p className="text-xs font-bold text-[#20C997] mt-2">{kpi.trend} from yesterday</p>}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA398]" />
            <input 
              type="text" 
              placeholder="Search customers or invoice ID..." 
              className="w-full pl-10 pr-4 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-sm focus:outline-none focus:border-[#20C997] transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#8FA398] hover:bg-[#F9FAFB] rounded-lg transition-colors"><Filter size={20} /></button>
            <button className="p-2 text-[#8FA398] hover:bg-[#F9FAFB] rounded-lg transition-colors"><Calendar size={20} /></button>
            <button className="p-2 text-[#8FA398] hover:bg-[#F9FAFB] rounded-lg transition-colors"><Download size={20} /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 text-[#20C997] animate-spin" />
              <p className="text-sm font-bold text-[#8FA398] uppercase tracking-widest">Loading records...</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#F9FAFB] flex items-center justify-center text-[#8FA398] mb-4">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-lg font-black text-[#0D1B12] font-nunito uppercase">No sales yet</h3>
              <p className="text-sm text-[#8FA398] max-w-xs mt-2">Start recording sales to see your revenue growth and history.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Items</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[#8FA398] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {sales.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[#F9FAFB] transition-colors group">
                    <td className="px-6 py-4 font-bold text-xs text-[#8FA398]">{s.id}</td>
                    <td className="px-6 py-4 font-bold text-sm text-[#0D1B12]">{s.customerName || 'Walk-in'}</td>
                    <td className="px-6 py-4 text-xs text-[#4A5E52] font-medium">{s.itemsCount} items</td>
                    <td className="px-6 py-4 font-black text-sm font-saira text-[#20C997]">KES {s.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-[#8FA398] font-medium">{s.time}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-[#20C997]/10 text-[#20C997] text-[10px] font-black rounded-lg uppercase tracking-wider">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
