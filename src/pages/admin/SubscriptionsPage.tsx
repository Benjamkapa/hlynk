import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Plus, Search, Filter, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

import { useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function SubscriptionsPage() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats
  })

  useEffect(() => {
    if (error) toast.error('Failed to load subscription data')
  }, [error])

  const subscriptions = stats?.recentSubscriptions || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 font-medium">Manage platform revenue plans and business tiers</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-gray-600 h-12 px-6 rounded-md border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            Plan Settings
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Subs" value={stats?.activeSubscriptions || '0'} sub="Businesses" icon={CheckCircle2} variant="emerald" />
        <StatCard title="MRR" value={`KES ${(stats?.mrr || 0).toLocaleString()}`} sub="Monthly Revenue" icon={CreditCard} variant="blue" />
        <StatCard title="Expiring Soon" value={stats?.expiringSoon || '0'} sub="Next 7 days" icon={Clock} variant="amber" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by business or subscription ID..." 
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
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Next Billing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : subscriptions.length > 0 ? subscriptions.map((s: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">{s.id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">{s.businessName}</td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{s.planName}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-gray-900 text-sm hl-mono">KES {s.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      s.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-gray-400 hl-mono">{new Date(s.nextBillingAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No subscriptions found</td>
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
