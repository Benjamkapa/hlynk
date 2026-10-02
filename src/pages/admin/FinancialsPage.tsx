import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { DollarSign, TrendingUp, PieChart, ArrowUpRight, Download, Search, Filter, CheckCircle2, Clock, CreditCard, Activity, Landmark, Wallet, AlertTriangle, ExternalLink, Smartphone, Banknote, ChevronLeft, ChevronRight, X, Trash2, ShieldAlert, Lock, Unlock, TriangleAlert, ChevronDown } from 'lucide-react'
import PayoutsManager from '../../components/admin/PayoutsManager'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import Pagination from '../../components/shared/Pagination'

import { useEffect, useState, useRef } from 'react'
import { AdminStats } from '../../lib/types/api'
import { formatDate, formatDateTime } from '../../lib/utils/date'

export default function FinancialsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'PAYOUTS'>('LEDGER')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [type, setType] = useState('')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)

  // Danger zone state
  const [dangerUnlocked, setDangerUnlocked] = useState(false)
  const [purgeModalOpen, setPurgeModalOpen] = useState(false)
  const [purgeTargetTenantId, setPurgeTargetTenantId] = useState('')
  const [purgeConfirmText, setPurgeConfirmText] = useState('')
  const [tenantSearch, setTenantSearch] = useState('')
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-relock danger zone after 30s of inactivity
  const handleUnlockDanger = () => {
    setDangerUnlocked(v => !v)
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    if (!dangerUnlocked) {
      lockTimerRef.current = setTimeout(() => {
        setDangerUnlocked(false)
        setPurgeModalOpen(false)
      }, 30_000)
    }
  }

  const { data: tenantsData } = useQuery({
    queryKey: ['admin-tenants-purge', tenantSearch],
    queryFn: () => adminApi.getTenants({ search: tenantSearch, limit: 100 }),
    enabled: purgeModalOpen,
  })
  const tenantList: any[] = tenantsData?.data?.tenants || []

  const deleteTxMutation = useMutation({
    mutationFn: (txId: string) => adminApi.deleteRecord('payment', txId),
    onSuccess: (res) => {
      toast.success(res.message || 'Transaction record deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vault'] })
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const clearLedgerMutation = useMutation({
    mutationFn: (tenantId?: string) => adminApi.clearTable('payment', tenantId || undefined),
    onSuccess: (res) => {
      toast.success(res.message || 'Payment ledger cleared')
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vault'] })
      setPurgeModalOpen(false)
      setPurgeTargetTenantId('')
      setPurgeConfirmText('')
      setDangerUnlocked(false)
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const { data: rawStats, error } = useQuery<any>({
    queryKey: ['financial-stats'],
    queryFn: () => adminApi.getStats('DAILY')
  })
  
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['admin-transactions', page, search, status, method, type],
    queryFn: () => adminApi.getTransactions({ page, limit: 10, search, status, method, type })
  })

  const { data: selectedTxData } = useQuery({
    queryKey: ['admin-tx-detail', selectedTxId],
    queryFn: () => adminApi.getTransactionDetail(selectedTxId!),
    enabled: !!selectedTxId
  })

  const { data: vaultData } = useQuery({
    queryKey: ['admin-vault'],
    queryFn: () => adminApi.getVaultStats()
  })

  const { data: payoutData } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => adminApi.getPayouts()
  })

  const vault = vaultData?.data || {}
  const stats = rawStats?.data || rawStats;

  const hasPendingPayoutDues = (payoutData?.data?.payouts?.length || 0) > 0 || Number(stats?.overview?.totalPendingPayouts || 0) > 0

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  const revenueData = stats?.trends?.revenueTrend?.map((r: any) => ({
    name: r.name,
    revenue: r.value,
    profit: r.value * 0.8 
  })) || []

  const selectedTenant = tenantList.find(t => t.id === purgeTargetTenantId)
  const canPurge = purgeTargetTenantId && purgeConfirmText === 'PURGE'

  return (
    <div className="space-y-8 pt-4 animate-in fade-in duration-700">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Finance Hub</h1>
          <p className="text-gray-400 text-sm mt-0.5">Global revenue orchestration and payout monitoring</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-100">
           <button 
             onClick={() => setActiveTab('LEDGER')}
             className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'LEDGER' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
           >
             Master Ledger
           </button>
           <button 
             onClick={() => setActiveTab('PAYOUTS')}
             className={`px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center gap-2 ${activeTab === 'PAYOUTS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-900'}`}
           >
             Pending Payouts
             {hasPendingPayoutDues && (
               <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
             )}
           </button>
        </div>
      </div>

      {activeTab === 'PAYOUTS' ? (
        <PayoutsManager />
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
            <FinancialStatCard title="Vault Balance" value={`KES ${(vault?.vaultBalance || 0).toLocaleString()}`} sub="Current available in Paybill" icon={Landmark} color="emerald" />
            <FinancialStatCard title="Platform Fees" value={`KES ${(vault?.platformNetPotential || 0).toLocaleString()}`} sub="Net potential (15% share)" icon={DollarSign} color="blue" />
            <FinancialStatCard title="Vendor Dues" value={`KES ${(vault?.pendingVendor || 0).toLocaleString()}`} sub="Unsettled rented volume" icon={CreditCard} color="purple" />
            <FinancialStatCard title="Referral Dues" value={`KES ${(vault?.pendingReferral || 0).toLocaleString()}`} sub="Claimable commission" icon={PieChart} color="amber" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white p-6 rounded-[.5rem] border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Revenue performance</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Platform gross vs net income</p>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Profit</span>
                  </div>
                </div>
              </div>
              <div className="h-[300px] relative z-10">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dx={-10} />
                    <Tooltip 
                      cursor={{ fill: '#F8FAFC', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', padding: '12px 16px' }}
                      itemStyle={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 11 }}
                    />
                    <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} barSize={32} />
                    <Bar dataKey="profit" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="absolute bottom-0 right-0 h-64 w-64 bg-slate-50 rounded-full blur-[100px] -mr-32 -mb-32 opacity-50" />
            </div>

            <div className="bg-emerald-900 rounded-[.5rem] p-6 text-white relative overflow-hidden h-full">
              <div className="relative z-10">
                <PieChart size={32} className="text-emerald-400 mb-6" />
                <h4 className="text-lg font-semibold mb-2">Payout Health</h4>
                <p className="text-emerald-200/80 text-xs font-medium leading-relaxed mb-8">
                  Platform fee collection is active. Settlements are calculated based on the last 48 hours of transaction volume.
                </p>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-4">
                      <span className="text-emerald-400">Vendor Liability</span>
                      <span className="hl-mono">KES {(vault?.pendingVendor || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold border-b border-white/10 pb-4 pt-4">
                      <span className="text-emerald-400">Referral Liability</span>
                      <span className="hl-mono">KES {(vault?.pendingReferral || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold pt-4">
                      <span className="text-emerald-400">Net Retained Fees</span>
                      <span className="hl-mono font-semibold text-xl">KES {(vault?.platformNetPotential || 0).toLocaleString()}</span>
                    </div>
                </div>
              </div>
              <Landmark size={180} className="absolute -right-10 -bottom-10 text-white opacity-5 rotate-12" />
            </div>
          </div>

          <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
              <div className="flex justify-between items-center w-full xl:w-auto gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Active payments log</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Unified view of all platform transactions</p>
                </div>
                {/* Danger zone — hidden behind an unlock toggle */}
                <div className="flex items-center gap-2">
                  <button
                    title={dangerUnlocked ? 'Lock danger zone' : 'Unlock danger zone actions'}
                    onClick={handleUnlockDanger}
                    className={`p-2 rounded-md transition-all border text-[10px] flex items-center gap-1.5 font-black uppercase tracking-widest ${
                      dangerUnlocked
                        ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                        : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {dangerUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                    {dangerUnlocked && <span>Locked in 30s</span>}
                  </button>
                  {dangerUnlocked && (
                    <button
                      disabled={clearLedgerMutation.isPending}
                      onClick={() => setPurgeModalOpen(true)}
                      className="px-3 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200"
                    >
                      <Trash2 size={12} /> Purge Ledger
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-64 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search Reference, ID, Business..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-md text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                  />
                </div>
                
                <select 
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-md px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
                >
                  <option value="">All Methods</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                </select>

                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-md px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="0">Paid/Success</option>
                  <option value="2">Pending</option>
                  <option value="1">Failed</option>
                  <option value="3">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tenant / Business</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Created</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {txLoading ? (
                    Array.from({length: 5}).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                      </tr>
                    ))
                  ) : txData?.data?.items?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-8 py-20 text-center text-sm font-bold text-slate-400 italic">No transactions found</td>
                    </tr>
                  ) : txData?.data?.items?.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-50/30 transition-all group">
                      <td className="px-8 py-6">
                        <span className="text-xs font-black hl-mono text-slate-900">#{tx.id.slice(0, 12)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-black text-slate-900 capitalize">{tx.businessName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{tx.tenantSlug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          {tx.mpesaRequestId ? (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">
                              <Smartphone size={10} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">M-Pesa</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                              <Banknote size={10} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">Cash</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-sm font-black text-slate-900 hl-mono">KES {Number(tx.amount).toLocaleString()}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <StatusBadge status={tx.status} resultCode={tx.mpesaResultCode} />
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[10px] font-black text-slate-400 hl-mono uppercase">
                          {formatDate(tx.createdAt)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            title="View Audit Detail"
                            onClick={() => setSelectedTxId(tx.id)}
                            className="p-2 h-8 w-8 rounded-full hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 transition-all flex items-center justify-center"
                          >
                            <ExternalLink size={14} />
                          </button>
                          <button 
                            title="Super Admin Delete Record"
                            disabled={deleteTxMutation.isPending}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete transaction #${tx.id}?`)) {
                                deleteTxMutation.mutate(tx.id)
                              }
                            }}
                            className="p-2 h-8 w-8 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-600 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(txData?.data?.pagination?.pages || 1) > 1 && (
              <div className="border-t border-slate-50 p-6">
                <Pagination 
                  page={page}
                  pages={txData?.data?.pagination?.pages || 1}
                  total={txData?.data?.pagination?.total || 0}
                  onPageChange={setPage}
                  label="Transaction"
                />
              </div>
            )}
          </div>
        </>
      )}

      {selectedTxId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTxId(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[.5rem] shadow-sm overflow-hidden animate-in zoom-in-95 duration-200">
            {!selectedTxData ? (
              <div className="p-20 flex flex-col items-center justify-center gap-4">
                <Activity className="animate-spin text-emerald-500" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Audit Log...</p>
              </div>
            ) : (
              <div className="p-0">
                <div className="p-6 bg-emerald-900 text-white flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Transaction Detail</p>
                    <h3 className="text-2xl font-semibold hl-mono">#{selectedTxData.data.id.slice(0, 16)}</h3>
                  </div>
                  <button onClick={() => setSelectedTxId(null)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Entity / Business</label>
                        <p className="text-sm font-black text-slate-900">{selectedTxData.data.tenantName}</p>
                        <p className="text-[10px] text-slate-500 font-medium tracking-tight">ID: {selectedTxData.data.tenantId}</p>
                    </div>
                    <div className="text-right">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Amount</label>
                        <p className="text-2xl font-semibold text-slate-900 hl-mono">KES {Number(selectedTxData.data.amount).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[.5rem] space-y-4">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-white pb-2 flex items-center gap-2">
                       <CreditCard size={12} /> Execution Details
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                          <p className="text-[11px] font-bold text-slate-900 uppercase">{selectedTxData.data.transactionType}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Ref</p>
                          <p className="text-[11px] font-bold text-slate-900 hl-mono">{selectedTxData.data.reference}</p>
                       </div>
                       {selectedTxData.data.mpesaRequestId && (
                         <div className="col-span-2">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">M-Pesa Checkout ID</p>
                            <p className="text-[11px] font-bold text-emerald-600 hl-mono">{selectedTxData.data.mpesaRequestId}</p>
                         </div>
                       )}
                    </div>
                  </div>

                  {selectedTxData.data.mpesaLogs && selectedTxData.data.mpesaLogs.length > 0 && (
                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Activity size={12} /> M-Pesa Interaction Logs
                       </h4>
                       <div className="divide-y divide-slate-50 border border-slate-100 rounded-[.5rem]">
                          {selectedTxData.data.mpesaLogs.map((log: any, i: number) => (
                            <div key={i} className="p-4 flex justify-between items-start gap-4">
                               <div>
                                  <p className="text-[10px] font-black text-slate-900">{log.type === 0 ? 'PUSH INITIATION' : 'CALLBACK RESPONSE'}</p>
                                  <p className="text-[9px] text-slate-500 font-medium">{log.resultDesc || 'Initiated successfully'}</p>
                               </div>
                               <div className="text-right">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${log.resultCode === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                     CODE {log.resultCode ?? '...'}
                                  </span>
                                  <p className="text-[8px] text-slate-400 mt-1 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}

                  {selectedTxData.data.context && (
                    <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-[.5rem]">
                       <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">Linked Context Information</p>
                       <pre className="text-[9px] hl-mono text-slate-600 overflow-x-auto">
                          {JSON.stringify(selectedTxData.data.context.data, null, 2)}
                       </pre>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                   <button 
                     onClick={() => setSelectedTxId(null)}
                     className="px-6 py-2.5 bg-white border border-slate-200 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                   >
                     Close Ledger
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Purge Ledger Modal ─────────────────────────────────────── */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => { setPurgeModalOpen(false); setPurgeTargetTenantId(''); setPurgeConfirmText(''); }}
          />
          <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-red-600 px-6 py-5 flex items-start gap-4">
              <div className="p-2 bg-white/20 rounded-lg mt-0.5">
                <TriangleAlert size={20} className="text-white" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-200 mb-1">Destructive Action</p>
                <h2 className="text-lg font-semibold text-white">Purge Payment Ledger</h2>
                <p className="text-xs text-red-200/80 mt-1">Select an account and confirm. This permanently deletes all payment records for that vendor.</p>
              </div>
              <button
                onClick={() => { setPurgeModalOpen(false); setPurgeTargetTenantId(''); setPurgeConfirmText(''); }}
                className="ml-auto p-1.5 hover:bg-white/20 rounded-lg transition-all text-white flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Step 1: Tenant selector */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Step 1 — Select Account to Purge
                </label>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by business name…"
                    value={tenantSearch}
                    onChange={e => setTenantSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {tenantList.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">No accounts found.</p>
                  )}
                  {tenantList.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setPurgeTargetTenantId(t.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all hover:bg-red-50 ${
                        purgeTargetTenantId === t.id ? 'bg-red-50 border-l-2 border-red-500' : ''
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900">{t.businessName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{t.slug}</p>
                      </div>
                      {purgeTargetTenantId === t.id && (
                        <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {selectedTenant && (
                  <p className="text-[10px] text-red-600 font-bold mt-2 flex items-center gap-1">
                    <TriangleAlert size={10} /> Will purge all payments for <span className="font-black">{selectedTenant.businessName}</span>
                  </p>
                )}
              </div>

              {/* Step 2: Typed confirmation */}
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Step 2 — Type <span className="font-black text-red-600 tracking-widest">PURGE</span> to confirm
                </label>
                <input
                  type="text"
                  value={purgeConfirmText}
                  onChange={e => setPurgeConfirmText(e.target.value.toUpperCase())}
                  placeholder="PURGE"
                  className="w-full px-4 py-2.5 text-xs font-black border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all tracking-widest"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setPurgeModalOpen(false); setPurgeTargetTenantId(''); setPurgeConfirmText(''); }}
                  className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={!canPurge || clearLedgerMutation.isPending}
                  onClick={() => clearLedgerMutation.mutate(purgeTargetTenantId)}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 enabled:shadow-sm enabled:shadow-red-200"
                >
                  {clearLedgerMutation.isPending ? (
                    <Activity size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  {clearLedgerMutation.isPending ? 'Purging…' : 'Purge This Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FinancialStatCard({ title, value, sub, icon: Icon, color }: any) {
  const colorMap = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    amber: 'text-amber-600 bg-amber-50',
  }

  return (
    <div className="bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{title}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-xl sm:text-2xl font-semibold hl-mono tracking-tight text-gray-900">{value}</p>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hl-mono">
          <TrendingUp size={11} /> 8.4%
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}

function StatusBadge({ status, resultCode }: { status: number, resultCode?: number }) {
  if (status === 0) return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
      <CheckCircle2 size={10} />
      <span className="text-[10px] font-black uppercase tracking-widest">Successful</span>
    </div>
  )
  if (status === 2) return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-md border border-amber-100">
      <Clock size={10} />
      <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
    </div>
  )
  if (status === 3) return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-400 rounded-md border border-slate-200">
      <X size={10} />
      <span className="text-[10px] font-black uppercase tracking-widest">Cancelled</span>
    </div>
  )
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 rounded-md border border-red-100">
      <AlertTriangle size={10} />
      <span className="text-[10px] font-black uppercase tracking-widest">Failed {resultCode ? `(${resultCode})` : ''}</span>
    </div>
  )
}