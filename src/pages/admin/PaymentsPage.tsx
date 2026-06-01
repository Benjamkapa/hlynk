import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Clock, XCircle, Download, CreditCard, ArrowUpRight, Search, Filter, Landmark, CheckCircle2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { AdminStats } from '../../lib/types/api'

type SortField = 'id' | 'createdAt' | 'businessName' | 'amount' | 'type' | 'status'
type SortDirection = 'asc' | 'desc'

export default function PaymentsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'ledger' | 'payouts'>('ledger')
  const [ledgerPage, setLedgerPage] = useState(1)
  const [payoutsPage, setPayoutsPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const PAGE_SIZE = 10
  
  const { data: rawStats, isLoading: statsLoading, error } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  const { data: payoutsRes, isLoading: payoutsLoading } = useQuery<any>({
    queryKey: ['admin-payouts'],
    queryFn: () => adminApi.getPayouts(),
    enabled: activeTab === 'payouts'
  })

  const markPaidMutation = useMutation({
    mutationFn: (tenantId: string) => adminApi.markPayoutPaid(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Payout marked as processed and settled.')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to mark payout as paid')
    }
  })

  useEffect(() => {
    if (error) toast.error('Failed to load transaction data')
  }, [error])

  const stats: AdminStats = rawStats?.data || rawStats
  
  // Master Ledger Data with Sorting
  const sortedTransactions = useMemo(() => {
    const raw = stats?.recentTransactions || []
    return [...raw].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle nulls
      if (aValue === null) return 1
      if (bValue === null) return -1

      if (sortField === 'amount') {
        return sortDirection === 'asc' ? (aValue - bValue) : (bValue - aValue)
      }

      if (sortField === 'createdAt') {
        return sortDirection === 'asc' 
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime()
      }

      aValue = aValue.toString().toLowerCase()
      bValue = bValue.toString().toLowerCase()

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [stats, sortField, sortDirection])

  const payouts = useMemo(() => payoutsRes?.data?.items || [], [payoutsRes])

  // Pagination Logic
  const paginatedTransactions = useMemo(() => {
    const start = (ledgerPage - 1) * PAGE_SIZE
    return sortedTransactions.slice(start, start + PAGE_SIZE)
  }, [sortedTransactions, ledgerPage])

  const paginatedPayouts = useMemo(() => {
    const start = (payoutsPage - 1) * PAGE_SIZE
    return payouts.slice(start, start + PAGE_SIZE)
  }, [payouts, payoutsPage])

  const totalLedgerPages = Math.ceil(sortedTransactions.length / PAGE_SIZE)
  const totalPayoutPages = Math.ceil(payouts.length / PAGE_SIZE)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatStatus = (status: any) => {
    if (status === 0 || status === 'Completed' || status === 'Success') return { label: 'Completed', class: 'bg-emerald-100 text-emerald-700' }
    if (status === 1 || status === 'Processing' || status === 'Pending') return { label: 'Processing', class: 'bg-blue-100 text-blue-700' }
    return { label: 'Failed', class: 'bg-red-100 text-red-700' }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Treasury</h1>
          <p className="text-gray-500 font-medium">Manage platform revenue and vendor settlements</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex">
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-emerald-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Master Ledger
            </button>
            <button 
              onClick={() => setActiveTab('payouts')}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'payouts' ? 'bg-emerald-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Payouts Manager
            </button>
          </div>
          <button className="bg-white border border-gray-100 text-gray-600 h-12 px-6 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Volume" value={`KES ${(stats?.totalVolume24h || 0).toLocaleString()}`} sub="Last 24h Global" icon={CreditCard} variant="emerald" />
        <StatCard title="Success Rate" value={`${stats?.successRate || 0}%`} sub="Payment Reliability" icon={ArrowUpRight} variant="blue" />
        <StatCard title="Pending Settlements" value={`KES ${(stats?.pendingPayoutsAmount || 0).toLocaleString()}`} sub={`${stats?.pendingPayoutsCount || '0'} Transfers Required`} icon={Clock} variant="amber" />
        <StatCard title="Platform Intake" value={`KES ${(stats?.overview?.revenueThisMonth || 0).toLocaleString()}`} sub="Revenue After Payouts" icon={Landmark} variant="purple" />
      </div>

      {activeTab === 'ledger' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-slate-900">
          <div className="p-8 border-b border-gray-50 flex gap-4 bg-gray-50/30">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search master ledger..." 
                className="w-full bg-white border border-gray-100 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold shadow-sm" 
              />
            </div>
            <button className="bg-white text-gray-500 h-12 px-4 rounded-xl flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100 shadow-sm">
              <Filter size={16} /> Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-all group" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-2">
                       TXN ID <ArrowUpDown size={10} className={sortField === 'id' ? 'text-emerald-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'} />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-all group" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-2">
                       Date & Time <ArrowUpDown size={10} className={sortField === 'createdAt' ? 'text-emerald-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'} />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-all group" onClick={() => handleSort('businessName')}>
                    <div className="flex items-center gap-2">
                       Business <ArrowUpDown size={10} className={sortField === 'businessName' ? 'text-emerald-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'} />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer hover:bg-gray-100/50 transition-all group" onClick={() => handleSort('type')}>
                    <div className="flex items-center gap-2">
                       Type <ArrowUpDown size={10} className={sortField === 'type' ? 'text-emerald-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'} />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right cursor-pointer hover:bg-gray-100/50 transition-all group" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end gap-2">
                       Amount <ArrowUpDown size={10} className={sortField === 'amount' ? 'text-emerald-600' : 'text-gray-300 opacity-0 group-hover:opacity-100'} />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {statsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                    </td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? paginatedTransactions.map((t: any, i: number) => {
                  const statusInfo = formatStatus(t.status)
                  return (
                    <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">{t.id?.toString().slice(-8).toUpperCase() || 'N/A'}</td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-400 hl-mono">{formatDate(t.createdAt)}</td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-700">{t.businessName || 'System'}</td>
                      <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                             t.type === 'SALE' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {t.type || 'PAYMENT'}
                          </span>
                      </td>
                      <td className={`px-8 py-5 text-right font-black text-sm hl-mono ${t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.amount > 0 ? '+' : ''}KES {(t.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusInfo.class}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest italic">No master ledger records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalLedgerPages > 1 && (
            <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {Math.min(sortedTransactions.length, (ledgerPage - 1) * PAGE_SIZE + 1)} - {Math.min(sortedTransactions.length, ledgerPage * PAGE_SIZE)} of {sortedTransactions.length}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setLedgerPage(p => Math.max(1, p - 1))}
                  disabled={ledgerPage === 1}
                  className="h-10 w-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white shadow-sm"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-black bg-emerald-900 text-white">
                  {ledgerPage}
                </div>
                <button 
                  onClick={() => setLedgerPage(p => Math.min(totalLedgerPages, p + 1))}
                  disabled={ledgerPage === totalLedgerPages}
                  className="h-10 w-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white shadow-sm"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                 <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                       <thead className="bg-gray-50/50 border-b border-gray-50 text-slate-900">
                          <tr>
                             <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor & Transfer Details</th>
                             <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Settlement Amount</th>
                             <th className="px-8 py-6 text-right"></th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {payoutsLoading ? (
                             <tr><td colSpan={3} className="py-20 text-center animate-pulse text-gray-400 font-black text-xs uppercase tracking-widest">Scanning Treasury...</td></tr>
                          ) : paginatedPayouts.length === 0 ? (
                             <tr><td colSpan={3} className="py-20 text-center text-gray-300 font-black text-xs uppercase tracking-widest italic">No pending settlements found. All vendors are cleared.</td></tr>
                          ) : paginatedPayouts.map((p: any) => (
                             <tr key={p.tenantId} className="hover:bg-amber-50/30 transition-all group">
                                <td className="px-8 py-8">
                                   <div className="flex items-center gap-4">
                                      <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                                         <Clock size={24} />
                                      </div>
                                      <div>
                                         <p className="font-black text-slate-900 text-lg tracking-tight mb-1">{p.businessName}</p>
                                         <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Landmark size={12} /> {p.transactionCount} TXNs Bundled</span>
                                            <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                                            <span className="flex items-center gap-1 italic">Updated {formatDate(p.latestTransaction)}</span>
                                         </div>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-8 text-right">
                                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 line-through">Gross KES {(p.totalGross || 0).toLocaleString()}</p>
                                   <p className="text-2xl font-black text-emerald-900 hl-mono tracking-tighter">KES {(p.netSettlement || 0).toLocaleString()}</p>
                                </td>
                                <td className="px-8 py-8 text-right">
                                   <button 
                                     onClick={() => markPaidMutation.mutate(p.tenantId)}
                                     disabled={markPaidMutation.isPending}
                                     className="bg-emerald-600 text-white h-12 px-6 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 ml-auto shadow-lg shadow-emerald-600/10 active:scale-95"
                                   >
                                      {markPaidMutation.isPending ? <Landmark className="animate-spin" /> : <CheckCircle2 size={18} />}
                                      Mark as Settled
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>

                    {totalPayoutPages > 1 && (
                      <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Showing {Math.min(payouts.length, (payoutsPage - 1) * PAGE_SIZE + 1)} - {Math.min(payouts.length, payoutsPage * PAGE_SIZE)} of {payouts.length}
                        </p>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setPayoutsPage(p => Math.max(1, p - 1))}
                            disabled={payoutsPage === 1}
                            className="h-10 w-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white shadow-sm"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <div className="h-10 px-4 rounded-lg flex items-center justify-center text-xs font-black bg-emerald-900 text-white">
                            {payoutsPage}
                          </div>
                          <button 
                            onClick={() => setPayoutsPage(p => Math.min(totalPayoutPages, p + 1))}
                            disabled={payoutsPage === totalPayoutPages}
                            className="h-10 w-10 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500 disabled:opacity-30 bg-white shadow-sm"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-emerald-900 p-8 rounded-xl text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10">
                       <h3 className="text-lg font-black mb-2 uppercase tracking-widest opacity-60">Revenue Retention</h3>
                       <p className="text-4xl font-black hl-mono mb-8">KES {Number(stats?.totalPlatformShare || 0).toLocaleString()}</p>
                       <div className="space-y-4 pt-6 border-t border-white/10">
                          <div className="flex justify-between items-center text-sm">
                             <span className="opacity-60 font-bold">Total Gross Collections</span>
                             <span className="font-black hl-mono">KES {Number(stats?.totalGross || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                             <span className="opacity-60 font-bold">Vendor Reimbursements</span>
                             <span className="font-black hl-mono text-red-300">- KES {Number(stats?.totalNetSettlement || 0).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                    <Landmark size={180} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                 </div>

                 <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Settlement Checklist</h3>
                    <ul className="space-y-4">
                       <li className="flex gap-4 items-start">
                          <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                             Verify valid M-Pesa receipt numbers matches vendor records before payout.
                          </p>
                       </li>
                       <li className="flex gap-4 items-start">
                          <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                             Transfer Net Settlement amount via B2C or manually to vendor's phone.
                          </p>
                       </li>
                       <li className="flex gap-4 items-start">
                          <div className="mt-1 h-5 w-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={12} strokeWidth={3} />
                          </div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">
                             Mark as "Settled" to clear transactions from pending treasury view.
                          </p>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
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
