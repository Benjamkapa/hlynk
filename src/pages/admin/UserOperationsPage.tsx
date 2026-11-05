import { useState } from 'react'
import {
  MagnifyingGlass,
  Trash,
  SignOut,
  UserSwitch,
  CircleNotch,
  DeviceMobile,
  Desktop,
} from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../components/shared/Pagination'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { SlideOver } from '../../components/shared/SlideOver'
import BroadcastTool from '../../components/admin/BroadcastTool'

type Tab = 'DIRECTORY' | 'SESSIONS' | 'ACTIVITY' | 'BROADCAST'

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Admin',
  PROVIDER: 'Provider',
  STAFF: 'Staff',
  CUSTOMER: 'Customer',
}

const kes = (n: any) => Number(n || 0).toLocaleString()
const signed = (n: any) => `${Number(n || 0) >= 0 ? '+' : '−'}KES ${Math.abs(Number(n || 0)).toLocaleString()}`
const avatarOf = (u: any) =>
  u?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u?.name || '')}`

function timeAgo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'Active now'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'Active now'
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 15) return 'Just now'
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const selectCls =
  'rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]'

export default function UserOperationsPage() {
  const [tab, setTab] = useState<Tab>('DIRECTORY')
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(null)
  const [confirmImpersonateUser, setConfirmImpersonateUser] = useState<any>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { login } = useAuth()
  const navigate = useNavigate()

  const { data: usersRes, isLoading } = useQuery<any>({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.getUsers({ search, role, page, limit: 10 }),
  })

  // Live sessions, synced every 20 seconds
  const { data: sessionsResponse, isLoading: sessionsLoading } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['admin-sessions'],
    queryFn: adminApi.getSessions,
    refetchInterval: 20000,
  })

  // Activity stream, synced every 20 seconds
  const { data: liveActivityRes } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['admin-live-activity-stream'],
    queryFn: () => adminApi.getActivityLogs({ page: 1, limit: 12 }),
    refetchInterval: 20000,
  })

  const users = usersRes?.data?.items || []
  const pagination = usersRes?.data?.pagination || { total: 0, pages: 1 }
  const sessions: any[] = sessionsResponse?.data || []
  const liveLogs: any[] = liveActivityRes?.data?.items || []

  const countRole = (r: string) => sessions.filter((s) => s.user?.role === r).length

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully')
      if (selectedUser?.id === confirmDeleteId) setSelectedUser(null)
      setConfirmDeleteId(null)
    },
  })

  const terminateMutation = useMutation({
    mutationFn: adminApi.terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
      setConfirmTerminateId(null)
    },
  })

  const impersonateMutation = useMutation({
    mutationFn: adminApi.impersonateUser,
    onSuccess: (res: any) => {
      login({ accessToken: res.data.accessToken, refreshToken: res.data.refreshToken }, res.data.user)
      toast.success(`Impersonation active: now acting as ${res.data.user.name}`)
      setConfirmImpersonateUser(null)
      navigate('/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to impersonate')
      setConfirmImpersonateUser(null)
    },
  })

  const handleFilterChange = (setter: (v: string) => void, val: string) => {
    setter(val)
    setPage(1)
  }

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'DIRECTORY', label: 'Directory' },
    { key: 'SESSIONS', label: 'Live sessions', badge: sessions.length },
    { key: 'ACTIVITY', label: 'Activity' },
    { key: 'BROADCAST', label: 'Broadcast' },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 sm:flex-row sm:items-end sm:justify-between">
        <div className="pb-6">
          <p className="text-xs text-slate-500">Accounts, sessions and activity</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Users</h1>
        </div>
        <nav className="flex gap-6 overflow-x-auto text-sm">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 pb-4 transition-colors ${
                tab === t.key
                  ? 'border-[#0D4A3E] font-medium text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className="rounded-full bg-emerald-50 px-1.5 text-xs tabular-nums text-emerald-700">{t.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </header>

      {/* Online summary */}
      {tab !== 'BROADCAST' && (
        <dl className="grid grid-cols-2 divide-slate-200 overflow-hidden rounded-md border border-slate-200 bg-white max-md:divide-y md:grid-cols-4 md:divide-x [&>*:nth-child(odd)]:max-md:border-r [&>*:nth-child(odd)]:max-md:border-slate-200">
          <Stat label="Online now" value={sessions.length} live />
          <Stat label="Staff" value={countRole('STAFF')} />
          <Stat label="Providers" value={countRole('PROVIDER')} />
          <Stat label="Customers" value={countRole('CUSTOMER')} />
        </dl>
      )}

      {/* ── Directory ── */}
      {tab === 'DIRECTORY' && (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              All users <span className="ml-1 font-normal text-slate-400">{pagination.total}</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              <label className="relative block w-full sm:w-64">
                <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, phone or email"
                  value={search}
                  onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                  className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
                />
              </label>
              <select value={role} onChange={(e) => handleFilterChange(setRole, e.target.value)} className={selectCls}>
                <option value="">All roles</option>
                <option value="SUPER_ADMIN">Admin</option>
                <option value="PROVIDER">Provider</option>
                <option value="STAFF">Staff</option>
                <option value="CUSTOMER">Customer</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-slate-400">
                      Loading users…
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                        selectedUser?.id === u.id ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarOf(u)}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{u.name}</p>
                            {u.businessName && <p className="truncate text-xs text-slate-500">{u.businessName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm text-slate-700 hl-mono">{u.phone}</p>
                        <p className="text-xs text-slate-400">{u.email || 'No email'}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-700">{ROLE_LABEL[u.role] || u.role}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {u.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setConfirmImpersonateUser(u)
                              }}
                              disabled={impersonateMutation.isPending}
                              title="Log in as this user"
                              className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0D4A3E] disabled:opacity-50"
                            >
                              <UserSwitch size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmDeleteId(u.id)
                            }}
                            title="Delete user"
                            className="rounded p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-sm text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="border-t border-slate-200 px-6 py-4">
              <Pagination
                page={page}
                pages={pagination.pages}
                total={pagination.total}
                onPageChange={setPage}
                label="User"
              />
            </div>
          )}
        </section>
      )}

      {/* ── Live sessions ── */}
      {tab === 'SESSIONS' && (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Live sessions</h2>
            <p className="mt-0.5 text-xs text-slate-500">Updates every 20 seconds</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Device</th>
                  <th className="px-6 py-3 font-medium">IP address</th>
                  <th className="px-6 py-3 font-medium">Last active</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessionsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                      Loading sessions…
                    </td>
                  </tr>
                ) : sessions.length > 0 ? (
                  sessions.map((s: any) => (
                    <tr
                      key={s.id}
                      onClick={() => s.user && setSelectedUser(s.user)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarOf(s.user)}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{s.user?.name}</p>
                            <p className="truncate text-xs text-slate-500">
                              {ROLE_LABEL[s.user?.role] || 'User'}
                              {s.user?.businessName ? ` · ${s.user.businessName}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                          {s.device?.deviceType === 'Mobile' ? (
                            <DeviceMobile size={15} className="shrink-0 text-slate-400" />
                          ) : (
                            <Desktop size={15} className="shrink-0 text-slate-400" />
                          )}
                          <span className="max-w-[220px] truncate" title={s.device?.summary || s.userAgent}>
                            {s.device?.summary || 'Web browser'}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-600 hl-mono">{s.ipAddress || 'Internal'}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {timeAgo(s.lastActive)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmTerminateId(s.id)
                            }}
                            title="End this session"
                            className="rounded p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <SignOut size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-slate-400">
                      No active sessions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Activity ── */}
      {tab === 'ACTIVITY' && (
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent activity</h2>
            <p className="mt-0.5 text-xs text-slate-500">Logins, sales, inventory and security events · updates every 20 seconds</p>
          </div>

          {liveLogs.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {liveLogs.map((log: any) => {
                const isSecurity = log.logName === 'Security' || log.action?.includes('Terminated')
                return (
                  <li key={log.id} className="flex items-start justify-between gap-4 px-6 py-3.5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isSecurity ? 'bg-red-500' : 'bg-slate-300'}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-900">
                          <span className="font-medium">{log.user?.name || log.userName || 'System'}</span>
                          <span className="text-slate-500"> · {log.action}</span>
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {log.tenant?.businessName ? `${log.tenant.businessName} · ` : ''}
                          {log.details}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-600">{timeAgo(log.createdAt)}</p>
                      <p className="mt-0.5 text-xs text-slate-400 hl-mono">{log.ipAddress || ''}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="py-16 text-center text-sm text-slate-400">Waiting for activity…</p>
          )}
        </section>
      )}

      {/* ── Broadcast ── */}
      {tab === 'BROADCAST' && <BroadcastTool />}

      {/* ── User detail ── */}
      <SlideOver isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User details">
        {selectedUser && (
          <UserDetail
            user={selectedUser}
            impersonating={impersonateMutation.isPending}
            onImpersonate={() => setConfirmImpersonateUser(selectedUser)}
            onDelete={() => setConfirmDeleteId(selectedUser.id)}
          />
        )}
      </SlideOver>

      <ConfirmModal
        isOpen={!!confirmTerminateId}
        onClose={() => setConfirmTerminateId(null)}
        onConfirm={() => confirmTerminateId && terminateMutation.mutate(confirmTerminateId)}
        title="End session"
        message="Are you sure you want to end this live session? The user will be logged out immediately."
        confirmText="End session"
        isDestructive={true}
        isLoading={terminateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmImpersonateUser}
        onClose={() => setConfirmImpersonateUser(null)}
        onConfirm={() => confirmImpersonateUser && impersonateMutation.mutate(confirmImpersonateUser.id)}
        title="Log in as this user"
        message={`You are about to log in as ${confirmImpersonateUser?.name}. All your actions will be tracked under their identity until you log out. Continue?`}
        confirmText="Continue"
        isDestructive={false}
        isLoading={impersonateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        title="Delete user"
        message="Are you sure you want to permanently delete this user? This action cannot be undone and will destroy their access."
        confirmText="Delete user"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

function Stat({ label, value, live }: { label: string; value: number; live?: boolean }) {
  return (
    <div className="px-6 py-5">
      <dt className="flex items-center gap-2 text-sm text-slate-500">
        {live && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
        {label}
      </dt>
      <dd className="mt-1.5 font-serif text-3xl tabular-nums tracking-tight text-slate-900">{value}</dd>
    </div>
  )
}

function UserDetail({
  user,
  impersonating,
  onImpersonate,
  onDelete,
}: {
  user: any
  impersonating: boolean
  onImpersonate: () => void
  onDelete: () => void
}) {
  const [view, setView] = useState<'finance' | 'audit'>('finance')

  const { data: userActivityResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['user-activity', user?.id],
    queryFn: () => adminApi.getUserActivity(user.id),
    enabled: !!user,
  })

  const { data: userValueResponse, isLoading: isLoadingValue } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['user-financial-value', user?.id],
    queryFn: () => adminApi.getUserValue(user.id),
    enabled: !!user,
  })

  const activityLogs: any[] = userActivityResponse?.data || []
  const f = userValueResponse?.data
  const net = Number(f?.netProfit || 0)

  return (
    <div className="space-y-6">
      {/* Identity */}
      <div className="flex items-start gap-4 border-b border-slate-200 pb-6">
        <img
          src={avatarOf(user)}
          alt=""
          referrerPolicy="no-referrer"
          className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
        />
        <div className="min-w-0">
          <h3 className="truncate font-serif text-xl text-slate-900">{user.name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {ROLE_LABEL[user.role] || user.role}
            {user.businessName ? ` · ${user.businessName}` : ''}
          </p>
          <p className="mt-2 text-sm text-slate-700 hl-mono">{user.phone}</p>
          <p className="text-xs text-slate-400">{user.email || 'No email registered'}</p>
          {user.createdAt && (
            <p className="mt-1 text-xs text-slate-400">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 text-sm">
        {(
          [
            ['finance', 'Financials'],
            ['audit', `Activity (${activityLogs.length})`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`-mb-px border-b-2 pb-3 transition-colors ${
              view === key
                ? 'border-[#0D4A3E] font-medium text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {view === 'finance' ? (
        isLoadingValue ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
            <CircleNotch size={16} className="animate-spin" /> Calculating…
          </div>
        ) : !f ? (
          <p className="py-10 text-center text-sm text-slate-400">No financial data available.</p>
        ) : !f.hasBusiness ? (
          <p className="rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            This user has no linked store, so there are no financials to show.
          </p>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500">Net result</p>
              <p
                className={`mt-1 font-serif text-3xl tabular-nums tracking-tight ${
                  net >= 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {signed(net)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Gross profit minus expenses · this month {signed(f.mtdNetProfit)}
              </p>
            </div>

            <Group title="Profit">
              <Row label="All time" value={`KES ${kes(f.profit?.allTimeGrossProfit)}`} />
              <Row label="This month" value={`KES ${kes(f.profit?.mtdGrossProfit)}`} />
              <Row label="Today" value={`KES ${kes(f.profit?.todayGrossProfit)}`} />
              <Row label="Revenue" value={`KES ${kes(f.profit?.totalRevenue)}`} />
              <Row label="Margin" value={`${f.profit?.marginPercent || 0}%`} />
              <Row label="Completed sales" value={String(f.profit?.totalSalesCount || 0)} />
            </Group>

            <Group title="Expenses">
              <Row label="Total" value={`KES ${kes(f.loss?.totalExpenses)}`} />
              <Row label="This month" value={`KES ${kes(f.loss?.mtdExpenses)}`} />
              <Row label="Records" value={String(f.loss?.expenseCount || 0)} />
              {f.loss?.isLoss && <Row label="Net deficit" value={`KES ${kes(f.loss?.netLoss)}`} tone="bad" />}
            </Group>

            <Group title="Stock">
              <Row label="Cost value" value={`KES ${kes(f.stockValue?.costValue)}`} />
              <Row label="Retail value" value={`KES ${kes(f.stockValue?.retailValue)}`} />
              <Row label="Potential margin" value={`KES ${kes(f.stockValue?.potentialProfit)}`} />
              <Row
                label="Inventory"
                value={`${f.stockValue?.totalItems || 0} items · ${f.stockValue?.totalUnits || 0} units`}
              />
              {f.stockValue?.lowStockCount > 0 && (
                <Row label="Low stock" value={`${f.stockValue.lowStockCount} items`} tone="warn" />
              )}
            </Group>
          </div>
        )
      ) : activityLogs.length > 0 ? (
        <ul className="divide-y divide-slate-100 border-y border-slate-200">
          {activityLogs.map((log: any, i: number) => (
            <li key={i} className="py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-slate-900">{log.action}</p>
                <span className="shrink-0 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{log.details}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-sm text-slate-400">No activity for this user.</p>
      )}

      {/* Actions */}
      <div className="space-y-3 border-t border-slate-200 pt-6">
        {user.role !== 'SUPER_ADMIN' && (
          <button
            onClick={onImpersonate}
            disabled={impersonating}
            className="w-full rounded bg-[#0D4A3E] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0A3D33] disabled:opacity-60"
          >
            Log in as {user.name}
          </button>
        )}
        <button
          onClick={onDelete}
          className="w-full py-2 text-xs font-medium text-slate-400 transition-colors hover:text-red-600"
        >
          Delete user permanently
        </button>
      </div>
    </div>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      <dl className="mt-2 divide-y divide-slate-100 border-y border-slate-200">{children}</dl>
    </section>
  )
}

function Row({ label, value, tone }: { label: string; value: string; tone?: 'bad' | 'warn' }) {
  const color = tone === 'bad' ? 'text-red-600' : tone === 'warn' ? 'text-amber-600' : 'text-slate-900'
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`text-sm font-medium tabular-nums ${color}`}>{value}</dd>
    </div>
  )
}