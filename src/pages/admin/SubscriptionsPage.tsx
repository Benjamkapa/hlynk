import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Search, Filter, CreditCard, CheckCircle2, Clock, ArrowUpCircle, Wallet } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import { AdminStats } from '../../lib/types/api'

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [planName, setPlanName] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: rawStats, error: statsError } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  const { data: subsRes, isLoading, error: subsError } = useQuery<any>({
    queryKey: ['admin-subscriptions', search, status, planName, page],
    queryFn: () => adminApi.getSubscriptions({ search, status, planName, page, limit: 10 })
  })

  useEffect(() => {
    if (statsError || subsError) toast.error('Failed to load subscription data')
  }, [statsError, subsError])

  const stats: AdminStats = rawStats?.data || rawStats
  const subscriptions = subsRes?.data?.items || []
  const pagination = subsRes?.data?.pagination || { total: 0, pages: 1 }

  const upgradeMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string, plan: string }) => adminApi.upgradePlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Subscription plan updated')
    },
    onError: () => toast.error('Failed to update subscription')
  })

  // Reset page when filters change
  const handleFilterChange = (setter: any, val: string) => {
    setter(val)
    setPage(1)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subscriptions</h1>
          <p className="text-gray-500 font-medium">Manage platform revenue plans and business tiers</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Subs" value={stats?.activeSubscriptions || '0'} sub="Businesses" icon={CheckCircle2} variant="emerald" />
        <StatCard title="MRR" value={`KES ${(stats?.mrr || 0).toLocaleString()}`} sub="Monthly Revenue" icon={CreditCard} variant="blue" />
        <StatCard title="Expiring Soon" value={stats?.expiringSoon || '0'} sub="Next 7 days" icon={Clock} variant="amber" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6 bg-white">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg">
                <Wallet size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900">Revenue Ledger</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Billing Cycles</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-4 flex-1 justify-end">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by business name..." 
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold" 
              />
            </div>
            <select 
              value={status} 
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px] transition-all"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select 
              value={planName} 
              onChange={(e) => handleFilterChange(setPlanName, e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px] transition-all"
            >
              <option value="">All Plans</option>
              <option value="LITE">Lite</option>
              <option value="PLUS">Plus</option>
              <option value="MAX">Max</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscription ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Expiration</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : subscriptions.length > 0 ? subscriptions.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">{s.id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-600">
                    {s.tenant?.businessName}
                    <div className="text-[10px] text-gray-400 font-normal hl-mono">/{s.tenant?.slug}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${s.planName === 'MAX' ? 'bg-purple-50 text-purple-600' : s.planName === 'PLUS' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                      {s.planName}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : s.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-sm font-bold text-gray-400 hl-mono">
                    {s.status === 'TRIAL' ? new Date(s.trialEndDate).toLocaleDateString() : (s.endDate ? new Date(s.endDate).toLocaleDateString() : 'Lifetime')}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       {['LITE', 'PLUS', 'MAX'].filter(p => p !== s.planName).map(p => (
                         <button 
                           key={p}
                           disabled={upgradeMutation.isPending}
                           onClick={() => { if(window.confirm(`Switch to ${p}?`)) upgradeMutation.mutate({ id: s.tenantId, plan: p }) }} 
                           className="text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 px-2 py-1.5 rounded border border-slate-100 transition-all"
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No subscriptions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          page={page} 
          pages={pagination.pages} 
          total={pagination.total} 
          onPageChange={setPage}
          label="Subscription"
        />
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
