import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Clock, XCircle, Save, CreditCard, ArrowUpRight, Search, Filter, Landmark, CheckCircle2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'
import { AdminStats } from '../../lib/types/api'
import Pagination from '../../components/shared/Pagination'
import InlineLoader, { ButtonLoader } from '../../components/shared/InlineLoader'
import PayoutsManager from '../../components/admin/PayoutsManager'

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

  const payouts = useMemo(() => payoutsRes?.data?.accrued || [], [payoutsRes])

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
    if (status === 0 || status === 'Completed' || status === 'Success') return { label: 'Completed', class: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    if (status === 1 || status === 'Processing' || status === 'Pending') return { label: 'Processing', class: 'bg-blue-50 text-blue-600 border-blue-100' }
    return { label: 'Failed', class: 'bg-red-50 text-red-600 border-red-100' }
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
    <div className="space-y-8 animate-in fade-in duration-500 pt-4">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Financial Treasury</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage platform revenue and vendor settlements</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-100">
            <button 
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ledger' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Master Ledger
            </button>
            <button 
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'payouts' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Payouts Manager
            </button>
          </div>
          <button className="bg-white border border-gray-100 text-gray-600 h-10 px-4 rounded-md font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2">
            <Save size={14} /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <StatCard title="Total Volume" value={`KES ${(stats?.totalVolume24h || 0).toLocaleString()}`} sub="Last 24h Global" icon={CreditCard} color="emerald" />
        <StatCard title="Success Rate" value={`${stats?.successRate || 0}%`} sub="Payment Reliability" icon={ArrowUpRight} color="blue" />
        <StatCard title="Pending Settlements" value={`KES ${(stats?.pendingPayoutsAmount || 0).toLocaleString()}`} sub={`${stats?.pendingPayoutsCount || '0'} Transfers Required`} icon={Clock} color="amber" />
        <StatCard title="Platform Intake" value={`KES ${(stats?.overview?.revenueThisMonth || 0).toLocaleString()}`} sub="Revenue After Payouts" icon={Landmark} color="purple" />
      </div>

      {activeTab === 'ledger' ? (
        <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden text-slate-900">
          <div className="p-6 border-b border-gray-50 flex gap-4 bg-gray-50/30">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search master ledger..." 
                className="w-full bg-white border border-gray-100 rounded-md py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-xs font-bold" 
              />
            </div>
            <button className="bg-white text-gray-500 h-10 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
              <Filter size={14} /> Filters
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
                      <InlineLoader message="Loading transactions..." />
                    </td>
                  </tr>
                ) : paginatedTransactions.length > 0 ? paginatedTransactions.map((t: any, i: number) => {
                  const statusInfo = formatStatus(t.status)
                  return (
                    <tr key={i} className="hover:bg-gray-50/30 transition-all group">
                      <td className="px-8 py-6 text-xs font-black text-gray-900 hl-mono">{t.id?.toString().slice(-8).toUpperCase() || 'N/A'}</td>
                      <td className="px-8 py-6 text-[10px] font-black text-gray-400 hl-mono uppercase">{formatDate(t.createdAt)}</td>
                      <td className="px-8 py-6 text-sm font-black text-gray-900">{t.businessName || 'System'}</td>
                      <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                             t.type === 'SALE' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'
                          }`}>
                            {t.type || 'PAYMENT'}
                          </span>
                      </td>
                      <td className={`px-8 py-6 text-right font-black text-sm hl-mono ${t.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.amount > 0 ? '+' : ''}KES {(t.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-md border text-[9px] font-black uppercase tracking-widest ${statusInfo.class}`}>
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
            <div className="p-6 border-t border-gray-50">
              <Pagination
                page={ledgerPage}
                pages={totalLedgerPages}
                total={sortedTransactions.length}
                onPageChange={setLedgerPage}
                label="Transaction"
              />
            </div>
          )}
        </div>
      ) : (
        <PayoutsManager />
      )}
    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, color }: any) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
  }

  return (
    <div className="bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{title}</p>
      </div>
      <p className="text-xl sm:text-2xl font-semibold hl-mono tracking-tight text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}