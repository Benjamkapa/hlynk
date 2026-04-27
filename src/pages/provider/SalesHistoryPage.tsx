import { useState } from 'react'
import { Search, Filter, Download, Calendar, Eye, Receipt, User, CreditCard, X, Printer } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { useQuery } from '@tanstack/react-query'
import { salesApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { SlideOver } from '../../components/shared/SlideOver'

import { useEffect } from 'react'
import { PaginatedResponse } from '../../lib/types/api'

export default function SalesHistoryPage() {
  const [search, setSearch] = useState('')
  const [selectedSale, setSelectedSale] = useState<any>(null)
  
  const { data: salesData, isLoading, error } = useQuery<PaginatedResponse<any> & { stats: any }>({
    queryKey: ['sales-history', search],
    queryFn: () => salesApi.list({ search })
  })

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const sales = salesData?.items || []
  const stats = salesData?.stats || { totalToday: 0, transactions: 0, avgSale: 0 }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales History</h1>
          <p className="text-gray-500 font-medium">Review and manage all recorded transactions</p>
        </div>
        <button className="bg-gray-100 text-gray-600 h-12 px-6 rounded-md font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
          <Download size={18} /> Export Daily Report
        </button>
      </div>

      <SlideOver 
        isOpen={!!selectedSale} 
        onClose={() => setSelectedSale(null)} 
        title="Transaction Receipt"
      >
        {selectedSale && <ReceiptDetail sale={selectedSale} />}
      </SlideOver>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Today" value={`KES ${stats.totalToday.toLocaleString()}`} sub="Gross Revenue" icon={Receipt} variant="emerald" />
        <StatCard title="Transactions" value={stats.transactions.toString()} sub="Sales processed" icon={CreditCard} variant="blue" />
        <StatCard title="Avg. Sale" value={`KES ${stats.avgSale.toLocaleString()}`} sub="Per customer" icon={User} variant="amber" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by receipt # or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium" 
            />
          </div>
          <button className="bg-gray-50 text-gray-500 h-12 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
            <Calendar size={16} />
            Today
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Receipt #</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Method</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : sales.length > 0 ? sales.map((s: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">#{s.id.slice(-5).toUpperCase()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{s.customerName || 'Walk-in'}</td>
                  <td className="px-8 py-5 text-center text-sm font-black hl-mono">{s.items?.length || 0}</td>
                  <td className="px-8 py-5 text-right font-black text-[#0D4A3E] text-sm hl-mono">KES {Number(s.totalAmount).toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                      s.paymentMethod === 'MPESA' ? 'text-emerald-600 bg-emerald-50' : 'text-blue-600 bg-blue-50'
                    }`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => setSelectedSale(s)}
                      className="p-2 hover:bg-emerald-50 rounded-md transition-all text-gray-300 hover:text-emerald-600"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ReceiptDetail({ sale }: { sale: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 space-y-6">
        <div className="flex justify-between items-start border-b border-slate-200 pb-6 border-dashed">
          <div>
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Receipt</h4>
            <p className="text-[10px] font-black text-slate-400 hl-mono">#{sale.id.toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
            <p className="text-xs font-bold text-slate-900">{new Date(sale.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Sold</p>
          <div className="space-y-3">
            {sale.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex gap-3 items-center">
                  <span className="h-6 w-6 rounded bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black hl-mono">{item.quantity}</span>
                  <span className="font-bold text-slate-700">{item.name}</span>
                </div>
                <span className="font-black text-slate-900 hl-mono">KES {(Number(item.price) * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 border-dashed space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">Payment Method</span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{sale.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-lg font-black text-slate-900">Total Paid</span>
            <span className="text-2xl font-black text-[#0D4A3E] hl-mono">KES {Number(sale.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 h-14 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0A3D33] transition-all shadow-xl shadow-emerald-900/10">
          <Printer size={18} /> Print Receipt
        </button>
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
      <div className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 ${variants[variant as keyof typeof variants]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h3 className="text-xl font-black text-gray-900 hl-mono">{value}</h3>
        <p className="text-[10px] text-gray-500 font-bold">{sub}</p>
      </div>
    </div>
  )
}
