import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Clock, XCircle, Download, CreditCard, ArrowUpRight, Search, Filter, Landmark } from 'lucide-react'

import { useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function PaymentsPage() {
  const { data: rawStats, isLoading, error } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  useEffect(() => {
    if (error) toast.error('Failed to load transaction data')
  }, [error])

  const stats: AdminStats = rawStats?.data || rawStats
  const transactions = stats?.recentTransactions || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payments & Settlements</h1>
          <p className="text-gray-500 font-medium">Global ledger of platform transactions and vendor payouts</p>
        </div>
        <button className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2">
          <Download size={18} /> Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={`KES ${(stats?.totalVolume24h || 0).toLocaleString()}`} sub="Last 24h" icon={CreditCard} variant="emerald" />
        <StatCard title="Success Rate" value={`${stats?.successRate || 0}%`} sub="Global average" icon={ArrowUpRight} variant="blue" />
        <StatCard title="Pending Payouts" value={stats?.pendingPayoutsCount || '0'} sub={`KES ${(stats?.pendingPayoutsAmount || 0).toLocaleString()}`} icon={Clock} variant="amber" />
        <StatCard title="Failed TXNs" value={stats?.failedTransactionsCount || '0'} sub="Requires review" icon={XCircle} variant="red" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by transaction ID or business name..." 
              className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm" 
            />
          </div>
          <button className="bg-gray-50 text-gray-500 h-12 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Method</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : transactions.length > 0 ? transactions.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">{t.id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{new Date(t.createdAt).toLocaleString()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-700">{t.businessName || 'System'}</td>
                  <td className={`px-8 py-5 text-right font-black text-sm hl-mono ${t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.amount > 0 ? '+' : ''}KES {Math.abs(t.amount).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-500">
                      <Landmark size={12} />
                      {t.method || 'M-PESA'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      t.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function StatCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
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
