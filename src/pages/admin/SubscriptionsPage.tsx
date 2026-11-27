import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { notify } from '../../lib/notify'
import { Search, ArrowUpRight } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import InlineLoader from '../../components/shared/InlineLoader'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { AdminStats } from '../../lib/types/api'

const planLabel = (plan?: string) =>
  plan === 'MAX' ? 'Business Pro' : plan === 'PLUS' ? 'Growth' : 'Starter'

const STATUS_STYLE: Record<string, { label: string; text: string; dot: string }> = {
  ACTIVE: { label: 'Active (Paid)', text: 'text-emerald-700', dot: 'bg-emerald-500' },
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(() => searchParams.get('status') || '')
  const [planName, setPlanName] = useState('')
  const [page, setPage] = useState(1)
  const [confirmUpgradePayload, setConfirmUpgradePayload] = useState<{ id: string; plan: string } | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const urlStatus = searchParams.get('status') || ''
    if (urlStatus !== status) {
      setStatus(urlStatus)
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const { data: rawStats, error: statsError } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  })

  const { data: subsRes, isLoading, error: subsError } = useQuery<any>({
    queryKey: ['admin-subscriptions', search, status, planName, page],
    queryFn: () => adminApi.getSubscriptions({ search, status, planName, page, limit: 10 }),
  })

  useEffect(() => {
    if (statsError || subsError) notify('Error', 'Failed to load subscription data')
  }, [statsError, subsError])

  const stats: AdminStats = rawStats?.data || rawStats
  const subscriptions = subsRes?.data?.items || []
  const pagination = subsRes?.data?.pagination || { total: 0, pages: 1 }

  const upgradeMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) => adminApi.upgradePlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      notify('Success', 'Subscription plan updated')
      setConfirmUpgradePayload(null)
    },
    onError: () => {
      notify('Error', 'Failed to update subscription')
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
    <div className="w-full space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="inline-block rounded-full bg-[#C8F3DC] px-3 py-0.5 text-xs font-semibold text-emerald-900">
            {o?.payingProviders || 0} paying businesses
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-slate-900">Subscriptions</h1>
        </div>
        <Link
          to="/admin/businesses"
          className="inline-flex items-center gap-1 self-start rounded-full bg-[#CBE6FF] px-3.5 py-1.5 text-xs font-semibold text-sky-950 transition-colors hover:brightness-95 sm:self-auto"
        >
          View all {o?.totalProviders || 0} businesses <ArrowUpRight size={13} />
        </Link>
      </header>

      {/* Figures */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 overflow-hidden rounded-xl bg-[#FFFDF8] shadow-sm">
        <button
          type="button"
          onClick={() => {
            setStatus('ACTIVE')
            setSearchParams({ status: 'ACTIVE' })
            setPage(1)
          }}
          className="group bg-[#C8F3DC] p-6 text-left transition-all hover:brightness-95 sm:p-8"
        >
          <dt className="flex items-center justify-between text-sm text-emerald-950/75">
            <span>Active (paid) subscriptions</span>
            <ArrowUpRight size={15} className="text-emerald-900/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-emerald-950">
            {o?.payingProviders || 0}
          </dd>
          <p className="mt-1 text-xs text-emerald-950/70">Click to list businesses past trial</p>
        </button>

        <Link
          to="/admin/financials"
          className="group block bg-[#FCE8B2] p-6 transition-all hover:brightness-95 sm:p-8"
        >
          <dt className="flex items-center justify-between text-sm text-amber-950/75">
            <span>Monthly revenue</span>
            <ArrowUpRight size={15} className="text-amber-900/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-amber-950">
            KES {Number(o?.revenueThisMonth || 0).toLocaleString()}
          </dd>
          <p className="mt-1 text-xs text-amber-950/70">View financial breakdown</p>
        </Link>

        <button
          type="button"
          onClick={() => {
            setStatus('ACTIVE')
            setSearchParams({ status: 'ACTIVE' })
            setPage(1)
          }}
          className="group bg-[#FFDCCB] p-6 text-left transition-all hover:brightness-95 sm:p-8"
        >
          <dt className="flex items-center justify-between text-sm text-rose-950/75">
            <span>Expiring in the next 14 days</span>
            <ArrowUpRight size={15} className="text-rose-900/60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </dt>
          <dd className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-rose-950">
            {o?.expiringSoon || 0}
          </dd>
          <p className="mt-1 text-xs text-rose-950/70">View active plans</p>
        </button>
      </dl>

      {/* Registry */}
      <section className="overflow-hidden rounded-xl bg-[#FFFDF8] shadow-sm">
        <div className="flex flex-col gap-3 bg-[#FCEFD9] px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            {status === 'ACTIVE' ? 'Paid businesses (past trial)' : 'All subscriptions'}
          </h2>
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
            <select
              value={status}
              onChange={(e) => {
                const val = e.target.value
                handleFilterChange(setStatus, val)
                setSearchParams(val ? { status: val } : {})
              }}
              className={selectCls}
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active (Paid)</option>
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
                            <p className="truncate text-xs text-slate-400">
                              {s.tenant?.email || s.tenant?.phone || (s.tenant?.slug ? `/${s.tenant.slug}` : '')}
                              {s.tenant?.email && s.tenant?.phone ? ` · ${s.tenant.phone}` : ''}
                            </p>
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
                setSearchParams({})
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