import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import InlineLoader from '../../components/shared/InlineLoader'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { AdminStats } from '../../lib/types/api'

const planLabel = (plan?: string) =>
  plan === 'MAX' ? 'Business Pro' : plan === 'PLUS' ? 'Growth' : 'Starter'

const STATUS_STYLE: Record<string, { label: string; text: string; dot: string }> = {
  ACTIVE: { label: 'Active', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  TRIAL: { label: 'Trial', text: 'text-blue-700', dot: 'bg-blue-500' },
  EXPIRED: { label: 'Expired', text: 'text-red-600', dot: 'bg-red-500' },
  SUSPENDED: { label: 'Suspended', text: 'text-amber-700', dot: 'bg-amber-500' },
}

const statusStyle = (status: string) =>
  STATUS_STYLE[status] || { label: status || 'Unknown', text: 'text-slate-600', dot: 'bg-slate-400' }

const expiry = (s: any) =>
  s.status === 'TRIAL'
    ? new Date(s.trialEndDate).toLocaleDateString()
    : s.endDate
      ? new Date(s.endDate).toLocaleDateString()
      : 'Lifetime'

const selectCls =
  'rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]'

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [planName, setPlanName] = useState('')
  const [page, setPage] = useState(1)
  const [confirmUpgradePayload, setConfirmUpgradePayload] = useState<{ id: string; plan: string } | null>(null)
  const queryClient = useQueryClient()

  const { data: rawStats, error: statsError } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  })

  const { data: subsRes, isLoading, error: subsError } = useQuery<any>({
    queryKey: ['admin-subscriptions', search, status, planName, page],
    queryFn: () => adminApi.getSubscriptions({ search, status, planName, page, limit: 5 }),
  })

  useEffect(() => {
    if (statsError || subsError) toast.error('Failed to load subscription data')
  }, [statsError, subsError])

  const stats: AdminStats = rawStats?.data || rawStats
  const subscriptions = subsRes?.data?.items || []
  const pagination = subsRes?.data?.pagination || { total: 0, pages: 1 }

  const upgradeMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) => adminApi.upgradePlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success('Subscription plan updated')
      setConfirmUpgradePayload(null)
    },
    onError: () => {
      toast.error('Failed to update subscription')
      setConfirmUpgradePayload(null)
    },
  })

  const handleFilterChange = (setter: any, val: string) => {
    setter(val)
    setPage(1)
  }

  const isFiltered = !!(search || status || planName)
  const o: any = stats?.overview

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <p className="text-xs text-slate-500">{o?.payingProviders || 0} paying businesses</p>
        <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Subscriptions</h1>
      </header>

      {/* Figures */}
      <dl className="grid grid-cols-3 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white md:divide-x md:divide-y-0">
        <div className="p-6 sm:p-8">
          <dt className="text-sm text-slate-500">Active subscriptions</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-slate-900">
            {o?.payingProviders || 0}
          </dd>
        </div>
        <div className="p-6 sm:p-8">
          <dt className="text-sm text-slate-500">Monthly revenue</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-slate-900">
            KES {Number(o?.revenueThisMonth || 0).toLocaleString()}
          </dd>
        </div>
        <div className="p-6 sm:p-8">
          <dt className="text-sm text-slate-500">Expiring in the next 14 days</dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-slate-900">
            {o?.expiringSoon || 0}
          </dd>
        </div>
      </dl>

      {/* Registry */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">All subscriptions</h2>
          <div className="flex flex-wrap gap-2">
            <label className="relative block w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by business name"
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
              />
            </label>
            <select value={status} onChange={(e) => handleFilterChange(setStatus, e.target.value)} className={selectCls}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="TRIAL">Trial</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select value={planName} onChange={(e) => handleFilterChange(setPlanName, e.target.value)} className={selectCls}>
              <option value="">All plans</option>
              <option value="PLUS">Growth</option>
              <option value="MAX">Business Pro</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Plan</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Expires</th>
                <th className="px-6 py-3 text-right font-medium">Change plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <InlineLoader message="Loading subscriptions..." />
                  </td>
                </tr>
              ) : subscriptions.length > 0 ? (
                subscriptions.map((s: any) => {
                  const st = statusStyle(s.status)
                  const name = s.tenant?.businessName || 'Unknown business'
                  return (
                    <tr key={s.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 text-sm font-semibold text-slate-600">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{name}</p>
                            {s.tenant?.slug && <p className="text-xs text-slate-400 hl-mono">/{s.tenant.slug}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-400 hl-mono">{s.id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-3.5 text-sm text-slate-700">{planLabel(s.planName)}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-2 text-sm ${st.text}`}>
                          <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm tabular-nums text-slate-700">{expiry(s)}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-4">
                          {['PLUS', 'MAX']
                            .filter((p) => p !== s.planName)
                            .map((p) => (
                              <button
                                key={p}
                                disabled={upgradeMutation.isPending}
                                onClick={() => setConfirmUpgradePayload({ id: s.tenantId, plan: p })}
                                className="text-sm font-medium text-[#0D4A3E] hover:underline disabled:opacity-50"
                              >
                                Switch to {planLabel(p)}
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                    {isFiltered ? 'No subscriptions match these filters.' : 'No subscriptions yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 text-xs text-slate-500">
          <span>
            {pagination.total} {pagination.total === 1 ? 'subscription' : 'subscriptions'}
          </span>
          {isFiltered && (
            <button
              onClick={() => {
                setSearch('')
                setStatus('')
                setPlanName('')
                setPage(1)
              }}
              className="font-medium text-[#0D4A3E] hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <Pagination
              page={page}
              pages={pagination.pages}
              total={pagination.total}
              onPageChange={setPage}
              label="Subscription"
            />
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={!!confirmUpgradePayload}
        onClose={() => setConfirmUpgradePayload(null)}
        onConfirm={() => confirmUpgradePayload && upgradeMutation.mutate(confirmUpgradePayload)}
        title="Change business plan"
        message={`Switch this business to the ${planLabel(confirmUpgradePayload?.plan)} plan? This overrides their current billing immediately.`}
        confirmText={`Switch to ${planLabel(confirmUpgradePayload?.plan)}`}
        isDestructive={false}
        isLoading={upgradeMutation.isPending}
      />
    </div>
  )
}