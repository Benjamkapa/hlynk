import { useState, useRef } from 'react'
import { Users, Monitor, LogOut, Search, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../components/shared/Pagination'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import BroadcastTool from '../../components/admin/BroadcastTool'

export default function UserOperationsPage() {
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
  const usersTableRef = useRef<HTMLDivElement>(null)

  const { data: usersRes, isLoading } = useQuery<any>({
    queryKey: ['admin-users', search, role, page],
    queryFn: () => adminApi.getUsers({ search, role, page, limit: 5 })
  })

  const { data: sessionsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['admin-sessions'],
    queryFn: adminApi.getSessions,
    refetchInterval: 60000
  })

  const { data: userActivityResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['user-activity', selectedUser?.id],
    queryFn: () => adminApi.getUserActivity(selectedUser.id),
    enabled: !!selectedUser
  })

  const users = usersRes?.data?.items || []
  const pagination = usersRes?.data?.pagination || { total: 0, pages: 1 }
  const sessions = sessionsResponse?.data || []
  const activityLogs = userActivityResponse?.data || []

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
        <h1 className="text-xl font-semibold text-gray-900">User Operations</h1>
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
                <p className="text-xs text-gray-400 mt-0.5">Active connections across the platform</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold hl-mono">{sessions.length}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">active</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entry Point (IP)</th>
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
                            <p className="font-medium text-gray-900 text-sm">{s.user?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{s.user?.role || 'User'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-medium text-slate-700 hl-mono">{s.ipAddress || 'Cloud internal'}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">HTTPS/WSS</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmTerminateId(s.id); }}
                          className="text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-md"
                        >
                          <LogOut size={16} />
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

          {/* Identity registry */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden" ref={usersTableRef}>
            <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Identity registry</h3>
                <p className="text-xs text-gray-400 mt-0.5">All platform users and customers</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
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
                      onClick={() => setSelectedUser(u)}
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
                            <p className="font-medium text-gray-900 text-sm">{u.name}</p>
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
                              <Monitor size={15} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(u.id); }}
                            className="hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-md"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
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

          {/* Audit trail */}
          {selectedUser && (
            <div className="bg-white rounded-[.5rem] border border-gray-100 p-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Audit trail — {selectedUser.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Recent activity for this identity</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="h-8 px-3 rounded-md bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all text-xs font-medium">Close</button>
              </div>
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
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 sticky top-6">
            <h3 className="text-sm font-medium text-gray-900 mb-5">Traffic intelligence</h3>
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-md border border-slate-100">
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
        title="Terminate Session"
        message="Are you sure you want to terminate this live session? The user will be immediately logged out."
        confirmText="Terminate"
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