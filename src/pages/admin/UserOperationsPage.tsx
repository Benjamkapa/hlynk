import { useState, useRef } from 'react'
import { 
  Users, Desktop, SignOut, MagnifyingGlass, Trash, Pulse, DeviceMobile, Globe, Clock, ShieldCheck,
  Package, TrendUp, TrendDown, CurrencyDollar, CircleNotch, Storefront, Receipt 
} from '@phosphor-icons/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../components/shared/Pagination'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import BroadcastTool from '../../components/admin/BroadcastTool'

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

export default function UserOperationsPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [detailTab, setDetailTab] = useState<'value' | 'audit'>('value')
  const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(null)
  const [confirmImpersonateUser, setConfirmImpersonateUser] = useState<any>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { login } = useAuth()
  const navigate = useNavigate()
  const usersTableRef = useRef<HTMLDivElement>(null)
  const activeUserRef = useRef<HTMLDivElement>(null)

  const { data: usersRes, isLoading } = useQuery<any>({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.getUsers({ search, role, page, limit: 5 })
  })

  // Live real-time active sessions (synced every 5 seconds)
  const { data: sessionsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['admin-sessions'],
    queryFn: adminApi.getSessions,
    refetchInterval: 5000
  })

  // Real-time activity stream of user operations (synced every 5 seconds)
  const { data: liveActivityRes } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['admin-live-activity-stream'],
    queryFn: () => adminApi.getActivityLogs({ page: 1, limit: 8 }),
    refetchInterval: 5000
  })

  const { data: userActivityResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['user-activity', selectedUser?.id],
    queryFn: () => adminApi.getUserActivity(selectedUser.id),
    enabled: !!selectedUser
  })

  const { data: userValueResponse, isLoading: isLoadingValue } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['user-financial-value', selectedUser?.id],
    queryFn: () => adminApi.getUserValue(selectedUser.id),
    enabled: !!selectedUser
  })

  const users = usersRes?.data?.items || []
  const pagination = usersRes?.data?.pagination || { total: 0, pages: 1 }
  const sessions = sessionsResponse?.data || []
  const liveLogs = liveActivityRes?.data?.items || []
  const activityLogs = userActivityResponse?.data || []
  const userFinancials = userValueResponse?.data

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully')
      setConfirmDeleteId(null)
    }
  })

  const terminateMutation = useMutation({
    mutationFn: adminApi.terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
      setConfirmTerminateId(null)
    }
  })

  const impersonateMutation = useMutation({
    mutationFn: adminApi.impersonateUser,
    onSuccess: (res: any) => {
      login(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.user
      )
      toast.success(`Impersonation active: now acting as ${res.data.user.name}`)
      setConfirmImpersonateUser(null)
      navigate('/dashboard')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to impersonate')
      setConfirmImpersonateUser(null)
    }
  })

  const handleFilterChange = (setter: any, val: string) => {
    setter(val)
    setPage(1)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-4">

      <div>
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <p className="text-gray-400 text-sm mt-0.5">Manage platform users, security sessions, and activity audits</p>
      </div>

      <BroadcastTool />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">

          {/* Live sessions */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Live sessions</h3>
                <p className="text-xs text-gray-400 mt-0.5">Real-time connected sessions across web & mobile devices</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold hl-mono">{sessions.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">online</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Device & IP</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-medium text-sm">Syncing with cloud infrastructure...</td></tr>
                  ) : sessions.length > 0 ? sessions.map((s: any) => (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedUser(s.user)}
                      className={`hover:bg-slate-50/30 transition-all cursor-pointer ${selectedUser?.id === s.user?.id ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.user?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${s.user?.name}`}
                            className="h-9 w-9 rounded-md object-cover border border-slate-100"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 text-sm">{s.user?.name}</p>
                              {s.user?.businessName && (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                  {s.user.businessName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{s.user?.role || 'User'}</span>
                              <span className="text-gray-300">•</span>
                              <span className="text-[10px] text-gray-400 font-mono">{s.user?.email || 'No email'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {s.device?.deviceType === 'Mobile' ? (
                            <DeviceMobile size={15} className="text-slate-400 shrink-0" />
                          ) : (
                            <Desktop size={15} className="text-slate-400 shrink-0" />
                          )}
                          <p className="text-xs font-medium text-slate-800 truncate max-w-[200px]" title={s.device?.summary || s.userAgent}>
                            {s.device?.summary || 'Web Browser'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{s.ipAddress || 'Cloud internal'}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{s.device?.deviceType || 'Desktop'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest border border-emerald-100">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </div>
                          <span className="text-[10px] font-medium text-slate-400">{timeAgo(s.lastActive)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmTerminateId(s.id); }}
                          title="Terminate this session"
                          className="text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-md"
                        >
                          <SignOut size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400 font-medium text-sm">
                        No active sessions detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Activity Stream */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Pulse size={18} className="text-emerald-600 animate-pulse" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Real-time Activity Stream</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Live user logins, transactions, inventory updates, and session actions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md border border-slate-200">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Sync 5s</span>
              </div>
            </div>

            <div className="divide-y divide-slate-50 max-h-[360px] overflow-y-auto">
              {liveLogs.length > 0 ? liveLogs.map((log: any) => {
                const isLogin = log.action?.includes('Login') || log.logName === 'Auth'
                const isSale = log.action?.includes('Sale') || log.logName === 'Sales'
                const isSecurity = log.logName === 'Security' || log.action?.includes('Terminated')
                return (
                  <div key={log.id} className="px-6 py-3.5 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center shrink-0 ${
                        isLogin ? 'bg-emerald-50 text-emerald-600' :
                        isSale ? 'bg-blue-50 text-blue-600' :
                        isSecurity ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {isLogin ? <Users size={16} /> : isSale ? <Pulse size={16} /> : <Desktop size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {log.user?.name || log.userName || 'System User'}
                          </p>
                          {log.tenant?.businessName && (
                            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {log.tenant.businessName}
                            </span>
                          )}
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isLogin ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            isSale ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            isSecurity ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-medium text-slate-600 hl-mono">{timeAgo(log.createdAt)}</p>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">{log.ipAddress || '127.0.0.1'}</p>
                    </div>
                  </div>
                )
              }) : (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Waiting for user activity...
                </div>
              )}
            </div>
          </div>

          {/* Identity registry */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden" ref={usersTableRef}>
            <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Identity registry</h3>
                <p className="text-xs text-gray-400 mt-0.5">All platform users and customers</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative w-64">
                  <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
                  <input
                    type="text"
                    placeholder="Search identities..."
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-md text-sm focus:ring-2 focus:ring-emerald-500/10 outline-none"
                  />
                </div>
                <select
                  value={role}
                  onChange={(e) => handleFilterChange(setRole, e.target.value)}
                  className="bg-slate-50 border-none rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                >
                  <option value="">All roles</option>
                  <option value="SUPER_ADMIN">Admin</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="STAFF">Staff</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-16 text-center text-slate-400 font-medium text-sm">Indexing registry...</td></tr>
                  ) : users.length > 0 ? users.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u)
                        setDetailTab('value')
                        setTimeout(() => activeUserRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
                      }}
                      className={`hover:bg-slate-50/30 transition-all cursor-pointer ${selectedUser?.id === u.id ? 'bg-emerald-50/40' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                            className="h-9 w-9 rounded-md object-cover border border-slate-100"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                              {u.businessName && (
                                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                                  {u.businessName}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] text-slate-400 font-bold hl-mono mt-0.5">ID: {u.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-medium text-slate-700 hl-mono">{u.phone}</p>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">{u.email || 'No email'}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                          u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600' :
                          u.role === 'PROVIDER' ? 'bg-blue-50 text-blue-600' :
                          u.role === 'STAFF' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1 text-gray-400">
                          {u.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmImpersonateUser(u); }}
                              disabled={impersonateMutation.isPending}
                              title="Impersonate User"
                              className="hover:text-[#0D4A3E] transition-all p-2 hover:bg-emerald-50 rounded-md disabled:opacity-50"
                            >
                              <Desktop size={15} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(u.id); }}
                            className="hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-md"
                            title="Delete User"
                          >
                            <Trash size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400 font-medium text-sm">
                        No users found in registry
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-50 p-6">
              <Pagination
                page={page}
                pages={pagination.pages}
                total={pagination.total}
                onPageChange={(p) => {
                  setPage(p)
                  usersTableRef.current?.scrollIntoView({ behavior: 'smooth' })
                }}
                label="Identity"
              />
            </div>
          </div>

          {/* Identity & Provider Details + Valuation [Stock Value, Profit, Loss] */}
          {selectedUser && (
            <div ref={activeUserRef} className="bg-white rounded-[.5rem] border border-gray-100 p-6 animate-in fade-in duration-500 space-y-6">
              {/* Profile Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedUser.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`}
                    className="h-12 w-12 rounded-lg object-cover border border-slate-100 shadow-sm"
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900">{selectedUser.name}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        selectedUser.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-600' :
                        selectedUser.role === 'PROVIDER' ? 'bg-blue-50 text-blue-600' :
                        selectedUser.role === 'STAFF' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {selectedUser.role}
                      </span>
                      {selectedUser.businessName && (
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          🏪 {selectedUser.businessName}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="font-mono text-slate-600">{selectedUser.phone}</span>
                      <span>•</span>
                      <span>{selectedUser.email || 'No email registered'}</span>
                      {selectedUser.createdAt && (
                        <>
                          <span>•</span>
                          <span>Member since {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedUser.role !== 'SUPER_ADMIN' && (
                    <button
                      onClick={() => setConfirmImpersonateUser(selectedUser)}
                      disabled={impersonateMutation.isPending}
                      className="h-8 px-3 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Desktop size={14} /> Impersonate
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDeleteId(selectedUser.id)}
                    className="h-8 px-3 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash size={14} /> Delete
                  </button>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="h-8 px-3 rounded-md bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-medium ml-1"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailTab('value')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      detailTab === 'value'
                        ? 'bg-[#0D4A3E] text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <CurrencyDollar size={15} /> Provider Financial Valuation
                  </button>
                  <button
                    onClick={() => setDetailTab('audit')}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      detailTab === 'audit'
                        ? 'bg-[#0D4A3E] text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Clock size={15} /> Audit Trail ({activityLogs.length})
                  </button>
                </div>
              </div>

              {/* Content Panel */}
              {detailTab === 'value' ? (
                isLoadingValue ? (
                  <div className="py-16 text-center text-slate-400 font-medium text-xs flex items-center justify-center gap-2">
                    <CircleNotch size={18} className="animate-spin text-[#0D4A3E]" />
                    Evaluating merchant financial metrics [stock value, profit, loss]...
                  </div>
                ) : userFinancials ? (
                  <div className="space-y-6">
                    {/* Primary Metrics Grid: Stock Value, Profit, Loss, Net Outcome */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* 1. STOCK VALUE */}
                      <div className="bg-slate-50/70 p-5 rounded-lg border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stock Value</span>
                          <div className="h-7 w-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Package size={16} />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 hl-mono">
                          KES {Number(userFinancials.stockValue?.costValue || 0).toLocaleString()}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Inventory cost valuation</p>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>Retail Worth:</span>
                            <span className="font-semibold text-slate-800 hl-mono">KES {Number(userFinancials.stockValue?.retailValue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Total Inventory:</span>
                            <span className="font-semibold text-slate-800 hl-mono">{userFinancials.stockValue?.totalItems || 0} items ({userFinancials.stockValue?.totalUnits || 0} units)</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Stock Margin:</span>
                            <span className="font-semibold text-emerald-600 hl-mono">+KES {Number(userFinancials.stockValue?.potentialProfit || 0).toLocaleString()}</span>
                          </div>
                          {userFinancials.stockValue?.lowStockCount > 0 && (
                            <div className="flex justify-between text-amber-600 font-medium pt-1">
                              <span>Low Stock:</span>
                              <span className="hl-mono font-bold">{userFinancials.stockValue.lowStockCount} items</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 2. PROFIT */}
                      <div className="bg-slate-50/70 p-5 rounded-lg border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Profit</span>
                          <div className="h-7 w-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                            <TrendUp size={16} />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-blue-700 hl-mono">
                          KES {Number(userFinancials.profit?.allTimeGrossProfit || 0).toLocaleString()}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Cumulative sales gross margin</p>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>MTD Profit:</span>
                            <span className="font-semibold text-slate-800 hl-mono">KES {Number(userFinancials.profit?.mtdGrossProfit || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Today's Profit:</span>
                            <span className="font-semibold text-slate-800 hl-mono">KES {Number(userFinancials.profit?.todayGrossProfit || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Total Revenue:</span>
                            <span className="font-semibold text-slate-800 hl-mono">KES {Number(userFinancials.profit?.totalRevenue || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Margin Rate:</span>
                            <span className="font-semibold text-blue-600 hl-mono">{userFinancials.profit?.marginPercent || 0}%</span>
                          </div>
                        </div>
                      </div>

                      {/* 3. LOSS / EXPENSES */}
                      <div className="bg-slate-50/70 p-5 rounded-lg border border-slate-100 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Loss & Expenses</span>
                          <div className="h-7 w-7 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                            <TrendDown size={16} />
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-rose-600 hl-mono">
                          KES {Number(userFinancials.loss?.totalExpenses || 0).toLocaleString()}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Recorded cost outflows</p>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-500">
                            <span>MTD Expenses:</span>
                            <span className="font-semibold text-slate-800 hl-mono">KES {Number(userFinancials.loss?.mtdExpenses || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Expense Records:</span>
                            <span className="font-semibold text-slate-800 hl-mono">{userFinancials.loss?.expenseCount || 0} entries</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Net Deficit:</span>
                            <span className={`font-semibold hl-mono ${userFinancials.loss?.isLoss ? 'text-rose-600' : 'text-slate-400'}`}>
                              {userFinancials.loss?.isLoss ? `KES ${Number(userFinancials.loss?.netLoss || 0).toLocaleString()}` : 'KES 0'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. NET PERFORMANCE */}
                      <div className={`p-5 rounded-lg border relative overflow-hidden ${
                        (userFinancials.netProfit || 0) >= 0
                          ? 'bg-emerald-50/40 border-emerald-100'
                          : 'bg-rose-50/40 border-rose-100'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Net Bottom Line</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            (userFinancials.netProfit || 0) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {(userFinancials.netProfit || 0) >= 0 ? 'Profitable' : 'Deficit / Loss'}
                          </span>
                        </div>
                        <h4 className={`text-xl font-bold hl-mono ${
                          (userFinancials.netProfit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {(userFinancials.netProfit || 0) >= 0 ? '+' : '−'}KES {Math.abs(Number(userFinancials.netProfit || 0)).toLocaleString()}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Gross profit − expenses</p>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>MTD Net:</span>
                            <span className="font-semibold hl-mono">
                              {(userFinancials.mtdNetProfit || 0) >= 0 ? '+' : '−'}KES {Math.abs(Number(userFinancials.mtdNetProfit || 0)).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Completed Orders:</span>
                            <span className="font-semibold hl-mono">{userFinancials.profit?.totalSalesCount || 0} sales</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {!userFinancials.hasBusiness && (
                      <div className="p-4 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-500">
                        ℹ️ This identity is registered as a customer or platform administrator without linked vendor store products.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No financial data available for this identity.
                  </div>
                )
              ) : (
                /* Activity Audit Trail Tab */
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                  {activityLogs.length > 0 ? activityLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-50/60 rounded-md border border-slate-50">
                      <div className="h-8 w-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Users size={14} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium text-gray-900">{log.action}</p>
                          <span className="text-[10px] font-bold text-slate-400 hl-mono">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{log.details}</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest pt-1">Event ID: {log.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-14 text-center">
                      <p className="text-slate-400 font-medium text-sm">No activity logs for this identity</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#0D4A3E]/5 p-6 rounded-[.5rem] border border-[#0D4A3E]/10 sticky top-6">
            <h3 className="text-sm font-medium text-gray-900 mb-5">Traffic intelligence</h3>
            <div className="space-y-5">
              <div className="p-4 bg-white rounded-md border border-slate-100 shadow-sm">
                <p className="text-xs text-gray-400 mb-1">Platform load</p>
                <h4 className="text-xl font-semibold text-slate-900 hl-mono">{sessions.length} <span className="text-xs text-slate-400 font-normal">active</span></h4>
                <div className="h-1.5 w-full bg-slate-200 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (sessions.length / 100) * 100)}%` }} />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-400">Access distribution</p>
                <TrafficItem label="Staff Operations" count={sessions.filter((s: any) => s.user?.role === 'STAFF').length} color="blue" />
                <TrafficItem label="Vendor Portals" count={sessions.filter((s: any) => s.user?.role === 'PROVIDER').length} color="emerald" />
                <TrafficItem label="Customer Access" count={sessions.filter((s: any) => s.user?.role === 'CUSTOMER').length} color="purple" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmTerminateId}
        onClose={() => setConfirmTerminateId(null)}
        onConfirm={() => confirmTerminateId && terminateMutation.mutate(confirmTerminateId)}
        title="Log Out Session"
        message="Are you sure you want to log out this live session? The user will be immediately logged out."
        confirmText="Log Out"
        isDestructive={true}
        isLoading={terminateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmImpersonateUser}
        onClose={() => setConfirmImpersonateUser(null)}
        onConfirm={() => confirmImpersonateUser && impersonateMutation.mutate(confirmImpersonateUser.id)}
        title="Impersonate Identity"
        message={`You are about to log in as ${confirmImpersonateUser?.name}. All your actions will be tracked under their identity until you log out. Continue?`}
        confirmText="Impersonate"
        isDestructive={false}
        isLoading={impersonateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && deleteMutation.mutate(confirmDeleteId)}
        title="Delete Identity"
        message="Are you sure you want to permanently delete this user? This action cannot be undone and will destroy their access."
        confirmText="Delete User"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

function TrafficItem({ label, count, color }: { label: string; count: number; color: 'blue' | 'emerald' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-md hover:bg-slate-50 transition-all">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${colors[color]}`} />
        <span className="text-xs text-slate-600">{label}</span>
      </div>
      <span className="text-xs font-semibold text-slate-900 hl-mono">{count}</span>
    </div>
  );
}