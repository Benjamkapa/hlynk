import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/utils/error'
import { Search, Trash2, ExternalLink, X, Lock, Unlock, Check } from 'lucide-react'
import PayoutsManager from '../../components/admin/PayoutsManager'
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'
import Pagination from '../../components/shared/Pagination'
import InlineLoader, { ButtonLoader } from '../../components/shared/InlineLoader'

import { useEffect, useState, useRef } from 'react'
import { formatDate } from '../../lib/utils/date'

const kes = (n: any) => Number(n || 0).toLocaleString()

const selectCls =
  'rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]'

export default function FinancialsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'PAYOUTS'>('LEDGER')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [type] = useState('')
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null)

  // Danger zone state
  const [dangerUnlocked, setDangerUnlocked] = useState(false)
  const [purgeModalOpen, setPurgeModalOpen] = useState(false)
  const [purgeTargetTenantId, setPurgeTargetTenantId] = useState('')
  const [purgeConfirmText, setPurgeConfirmText] = useState('')
  const [tenantSearch, setTenantSearch] = useState('')
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Auto-relock danger zone after 30s
  const handleUnlockDanger = () => {
    setDangerUnlocked((v) => !v)
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    if (!dangerUnlocked) {
      lockTimerRef.current = setTimeout(() => {
        setDangerUnlocked(false)
        setPurgeModalOpen(false)
      }, 30_000)
    }
  }

  const closePurge = () => {
    setPurgeModalOpen(false)
    setPurgeTargetTenantId('')
    setPurgeConfirmText('')
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
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const clearLedgerMutation = useMutation({
    mutationFn: (tenantId?: string) => adminApi.clearTable('payment', tenantId || undefined),
    onSuccess: (res) => {
      toast.success(res.message || 'Payment ledger cleared')
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['financial-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-vault'] })
      closePurge()
      setDangerUnlocked(false)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const { data: rawStats, error } = useQuery<any>({
    queryKey: ['financial-stats'],
    queryFn: () => adminApi.getStats('DAILY'),
  })

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['admin-transactions', page, search, status, method, type],
    queryFn: () => adminApi.getTransactions({ page, limit: 10, search, status, method, type }),
  })

  const { data: selectedTxData } = useQuery({
    queryKey: ['admin-tx-detail', selectedTxId],
    queryFn: () => adminApi.getTransactionDetail(selectedTxId!),
    enabled: !!selectedTxId,
  })

  const { data: vaultData } = useQuery({
    queryKey: ['admin-vault'],
    queryFn: () => adminApi.getVaultStats(),
  })

  const { data: payoutData } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: () => adminApi.getPayouts(),
  })

  const vault = vaultData?.data || {}
  const stats = rawStats?.data || rawStats

  const hasPendingPayoutDues =
    (payoutData?.data?.payouts?.length || 0) > 0 || Number(stats?.overview?.totalPendingPayouts || 0) > 0

  useEffect(() => {
    if (error) toast.error(getErrorMessage(error))
  }, [error])

  // Note: "net" is an estimate (80% of revenue), as in the original page
  const revenueData =
    stats?.trends?.revenueTrend?.map((r: any) => ({
      name: r.name,
      revenue: r.value,
      net: r.value * 0.8,
    })) || []

  const selectedTenant = tenantList.find((t) => t.id === purgeTargetTenantId)
  const canPurge = purgeTargetTenantId && purgeConfirmText === 'PURGE'
  const tx = selectedTxData?.data
  const items: any[] = txData?.data?.items || []

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-0 sm:flex-row sm:items-end sm:justify-between">
        <div className="pb-6">
          <p className="text-xs text-slate-500">Revenue, vault and payouts</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Finance</h1>
        </div>
        <nav className="flex gap-6 text-sm">
          {(
            [
              ['LEDGER', 'Ledger'],
              ['PAYOUTS', 'Payouts'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-4 transition-colors ${
                activeTab === key
                  ? 'border-[#0D4A3E] font-medium text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {label}
              {key === 'PAYOUTS' && hasPendingPayoutDues && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
            </button>
          ))}
        </nav>
      </header>

      {activeTab === 'PAYOUTS' ? (
        <PayoutsManager />
      ) : (
        <>
          {/* Vault + liabilities */}
          <section className="grid grid-cols-1 overflow-hidden rounded-md border border-slate-200 bg-white xl:grid-cols-12">
            <div className="bg-[#0D4A3E] p-6 text-white sm:p-8 xl:col-span-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-emerald-100/70">Vault balance</p>
                  <p className="mt-2 font-serif text-4xl tabular-nums tracking-tight sm:text-5xl">
                    <span className="mr-2 text-xl text-emerald-100/60">KES</span>
                    {kes(vault?.vaultBalance)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-100/60">Available in the Paybill</p>
                </div>
                <div className="flex gap-5 text-xs text-emerald-100/70">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm bg-[#6EE7B7]" /> Revenue
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm bg-white/35" /> Net (est.)
                  </span>
                </div>
              </div>

              <div className="mt-8 h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                  <BarChart data={revenueData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barGap={3}>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'rgba(209,250,229,0.55)' }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tick={{ fontSize: 11, fill: 'rgba(209,250,229,0.55)' }}
                      tickFormatter={(v) => new Intl.NumberFormat('en', { notation: 'compact' }).format(v)}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      content={({ active, payload, label }: any) =>
                        active && payload?.length ? (
                          <div className="rounded bg-white px-3 py-2 text-xs shadow-lg">
                            <p className="text-slate-500">{label}</p>
                            {payload.map((p: any) => (
                              <p key={p.dataKey} className="mt-0.5 tabular-nums text-slate-900">
                                <span className="text-slate-500">{p.dataKey === 'revenue' ? 'Revenue' : 'Net'} </span>
                                <span className="font-semibold">KES {kes(p.value)}</span>
                              </p>
                            ))}
                          </div>
                        ) : null
                      }
                    />
                    <Bar dataKey="revenue" fill="#6EE7B7" radius={[2, 2, 0, 0]} maxBarSize={24} />
                    <Bar dataKey="net" fill="rgba(255,255,255,0.35)" radius={[2, 2, 0, 0]} maxBarSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <dl className="divide-y divide-slate-200 xl:col-span-4">
              <Figure label="Platform fees" value={`KES ${kes(vault?.platformNetPotential)}`} note="Net potential, 15% share" />
              <Figure label="Vendor dues" value={`KES ${kes(vault?.pendingVendor)}`} note="Unsettled vendor volume" />
              <Figure label="Referral dues" value={`KES ${kes(vault?.pendingReferral)}`} note="Claimable commission" />
            </dl>
          </section>

          {/* Payments log */}
          <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-slate-900">Payments</h2>

                {/* Danger zone, behind an unlock toggle */}
                <button
                  title={dangerUnlocked ? 'Lock danger zone' : 'Unlock danger zone'}
                  onClick={handleUnlockDanger}
                  className={`flex h-7 items-center gap-1.5 rounded px-2 text-xs transition-colors ${
                    dangerUnlocked
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'text-slate-300 hover:bg-slate-100 hover:text-slate-500'
                  }`}
                >
                  {dangerUnlocked ? <Unlock size={13} /> : <Lock size={13} />}
                  {dangerUnlocked && <span>Locks in 30s</span>}
                </button>
                {dangerUnlocked && (
                  <button
                    disabled={clearLedgerMutation.isPending}
                    onClick={() => setPurgeModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={12} /> Purge ledger
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <label className="relative block w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search reference, ID or business"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
                  />
                </label>
                <select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value)
                    setPage(1)
                  }}
                  className={selectCls}
                >
                  <option value="">All methods</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="CASH">Cash</option>
                </select>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    setPage(1)
                  }}
                  className={selectCls}
                >
                  <option value="">All statuses</option>
                  <option value="0">Successful</option>
                  <option value="2">Pending</option>
                  <option value="1">Failed</option>
                  <option value="3">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="px-6 py-3 font-medium">Reference</th>
                    <th className="px-6 py-3 font-medium">Business</th>
                    <th className="px-6 py-3 font-medium">Method</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 text-right font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {txLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="h-4 w-full rounded bg-slate-100" />
                        </td>
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-sm text-slate-400">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    items.map((row: any) => (
                      <tr key={row.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-6 py-3.5 text-xs text-slate-600 hl-mono">#{row.id.slice(0, 12)}</td>
                        <td className="px-6 py-3.5">
                          <p className="text-sm font-medium capitalize text-slate-900">{row.businessName}</p>
                          <p className="text-xs text-slate-400">{row.tenantSlug}</p>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-slate-700">{row.mpesaRequestId ? 'M-Pesa' : 'Cash'}</td>
                        <td className="px-6 py-3.5 text-sm capitalize text-slate-700">
                          {String(row.transactionType || '').toLowerCase()}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-medium tabular-nums text-slate-900">
                          KES {kes(row.amount)}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={row.status} resultCode={row.mpesaResultCode} />
                        </td>
                        <td className="px-6 py-3.5 text-right text-xs text-slate-500">{formatDate(row.createdAt)}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              title="View details"
                              onClick={() => setSelectedTxId(row.id)}
                              className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            >
                              <ExternalLink size={15} />
                            </button>
                            <button
                              title="Delete record"
                              disabled={deleteTxMutation.isPending}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete transaction #${row.id}?`)) {
                                  deleteTxMutation.mutate(row.id)
                                }
                              }}
                              className="rounded p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {(txData?.data?.pagination?.pages || 1) > 1 && (
              <div className="border-t border-slate-200 px-6 py-4">
                <Pagination
                  page={page}
                  pages={txData?.data?.pagination?.pages || 1}
                  total={txData?.data?.pagination?.total || 0}
                  onPageChange={setPage}
                  label="Transaction"
                />
              </div>
            )}
          </section>
        </>
      )}

      {/* Transaction detail */}
      {selectedTxId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSelectedTxId(null)} />
          <div className="relative w-full max-w-xl overflow-hidden rounded-md bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {!tx ? (
              <div className="flex items-center justify-center p-20">
                <InlineLoader message="Fetching details..." />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <p className="text-xs text-slate-500">Transaction</p>
                    <h3 className="mt-0.5 text-lg text-slate-900 hl-mono">#{tx.id.slice(0, 16)}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedTxId(null)}
                    className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="max-h-[65vh] space-y-7 overflow-y-auto px-6 py-6">
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Business</p>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{tx.tenantName}</p>
                      <p className="truncate text-xs text-slate-400">{tx.tenantId}</p>
                    </div>
                    <p className="font-serif text-3xl tabular-nums tracking-tight text-slate-900">
                      <span className="mr-1.5 text-sm text-slate-400">KES</span>
                      {kes(tx.amount)}
                    </p>
                  </div>

                  <dl className="divide-y divide-slate-100 border-y border-slate-200">
                    <DetailRow label="Type" value={String(tx.transactionType || '').toLowerCase()} capitalize />
                    <DetailRow label="Internal reference" value={tx.reference} mono />
                    {tx.mpesaRequestId && <DetailRow label="M-Pesa checkout ID" value={tx.mpesaRequestId} mono />}
                  </dl>

                  {tx.mpesaLogs && tx.mpesaLogs.length > 0 && (
                    <section>
                      <h4 className="text-sm font-semibold text-slate-900">M-Pesa log</h4>
                      <ul className="mt-2 divide-y divide-slate-100 border-y border-slate-200">
                        {tx.mpesaLogs.map((log: any, i: number) => (
                          <li key={i} className="flex items-start justify-between gap-4 py-3">
                            <div className="min-w-0">
                              <p className="text-sm text-slate-900">
                                {log.type === 0 ? 'Push initiated' : 'Callback received'}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">{log.resultDesc || 'Initiated successfully'}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <span
                                className={`text-xs font-medium ${log.resultCode === 0 ? 'text-emerald-700' : 'text-red-600'}`}
                              >
                                Code {log.resultCode ?? '…'}
                              </span>
                              <p className="mt-0.5 text-xs text-slate-400">
                                {new Date(log.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {tx.context && (
                    <section>
                      <h4 className="text-sm font-semibold text-slate-900">Linked context</h4>
                      <pre className="mt-2 overflow-x-auto rounded border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 hl-mono">
                        {JSON.stringify(tx.context.data, null, 2)}
                      </pre>
                    </section>
                  )}
                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                  <button
                    onClick={() => setSelectedTxId(null)}
                    className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Purge ledger */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={closePurge} />
          <div className="relative w-full max-w-md overflow-hidden rounded-md bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="font-serif text-xl text-slate-900">Purge payment ledger</h2>
                <p className="mt-1 text-sm text-red-600">
                  This permanently deletes every payment record for the account you choose.
                </p>
              </div>
              <button
                onClick={closePurge}
                className="rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div>
                <label className="text-xs font-medium text-slate-500">1. Choose an account</label>
                <div className="relative mt-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by business name"
                    value={tenantSearch}
                    onChange={(e) => setTenantSearch(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-red-400"
                  />
                </div>
                <div className="mt-2 max-h-44 divide-y divide-slate-100 overflow-y-auto rounded border border-slate-200">
                  {tenantList.length === 0 && (
                    <p className="py-6 text-center text-sm text-slate-400">No accounts found.</p>
                  )}
                  {tenantList.map((t) => {
                    const chosen = purgeTargetTenantId === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setPurgeTargetTenantId(t.id)}
                        className={`flex w-full items-center justify-between border-l-2 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                          chosen ? 'border-red-500 bg-red-50/60' : 'border-transparent'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{t.businessName}</p>
                          <p className="text-xs text-slate-400 hl-mono">{t.slug}</p>
                        </div>
                        {chosen && <Check size={16} className="shrink-0 text-red-600" />}
                      </button>
                    )
                  })}
                </div>
                {selectedTenant && (
                  <p className="mt-2 text-xs text-red-600">
                    All payments for <span className="font-semibold">{selectedTenant.businessName}</span> will be deleted.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500">
                  2. Type <span className="font-semibold text-red-600">PURGE</span> to confirm
                </label>
                <input
                  type="text"
                  value={purgeConfirmText}
                  onChange={(e) => setPurgeConfirmText(e.target.value.toUpperCase())}
                  placeholder="PURGE"
                  className="mt-2 w-full rounded border border-slate-300 px-3 py-2 text-sm tracking-widest outline-none focus:border-red-400 hl-mono"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closePurge}
                  className="flex-1 rounded border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={!canPurge || clearLedgerMutation.isPending}
                  onClick={() => clearLedgerMutation.mutate(purgeTargetTenantId)}
                  className="flex flex-1 items-center justify-center gap-2 rounded bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {clearLedgerMutation.isPending ? <ButtonLoader size={12} /> : <Trash2 size={13} />}
                  {clearLedgerMutation.isPending ? 'Purging…' : 'Purge account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Figure({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="p-6 sm:p-8">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-2 font-serif text-2xl tabular-nums tracking-tight text-slate-900 sm:text-3xl">{value}</dd>
      <p className="mt-1.5 text-xs text-slate-500">{note}</p>
    </div>
  )
}

function DetailRow({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string
  value: string
  mono?: boolean
  capitalize?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd
        className={`min-w-0 truncate text-sm text-slate-900 ${mono ? 'hl-mono' : ''} ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </dd>
    </div>
  )
}

function StatusBadge({ status, resultCode }: { status: number; resultCode?: number }) {
  const cfg =
    status === 0
      ? { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Successful' }
      : status === 2
        ? { dot: 'bg-amber-500', text: 'text-amber-700', label: 'Pending' }
        : status === 3
          ? { dot: 'bg-slate-300', text: 'text-slate-500', label: 'Cancelled' }
          : { dot: 'bg-red-500', text: 'text-red-600', label: `Failed${resultCode ? ` (${resultCode})` : ''}` }

  return (
    <span className={`inline-flex items-center gap-2 text-sm ${cfg.text}`}>
      <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}