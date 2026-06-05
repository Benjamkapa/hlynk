import { useState, useRef } from 'react'
import { Users, Monitor, LogOut, Search, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import Pagination from '../../components/shared/Pagination'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

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
      toast.success('Session terminated')
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
      toast.success(`impersonation active: now acting as ${res.data.user.name}`)
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
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Operations</h1>
          <p className="text-gray-500 font-medium">Manage platform users, security sessions, and deep activity audits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-slate-900 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black">On-Cloud Operations</h3>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Global platform telemetry & session management</p>
              </div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Database Linked</span>
                   </div>
                   <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Live Connection: Active</p>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white rounded-xl border border-white/10">
                  <span className="text-xl font-black hl-mono">{sessions.length}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live<br/>Sessions</span>
                </div>
              </div>
              <Monitor size={150} className="absolute -right-10 -bottom-10 opacity-5 -rotate-12" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Entry Point (IP)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Syncing with Cloud Infrastructure...</td></tr>
                  ) : sessions.length > 0 ? sessions.map((s: any) => (
                    <tr 
                      key={s.id} 
                      onClick={() => setSelectedUser(s.user)}
                      className={`hover:bg-gray-50/50 transition-all group cursor-pointer ${selectedUser?.id === s.user?.id ? 'bg-emerald-50/50' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={s.user?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${s.user?.name}`} 
                            className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm group-hover:scale-110 transition-transform" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-black text-gray-900 text-sm tracking-tight">{s.user?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{s.user?.role || 'User'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700 hl-mono">{s.ipAddress || 'Cloud Internal'}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Access Protocol: HTTPS/WSS</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase tracking-widest">
                           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           Session Active
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmTerminateId(s.id); }}
                          className="text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-lg"
                        >
                          <LogOut size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                        No platform-wide active sessions detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden mt-8" ref={usersTableRef}>
            <div className="p-10 border-b border-gray-50 flex flex-wrap justify-between items-center bg-white relative overflow-hidden gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-900">Global Identity Registry</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">All Platform Users & Customers</p>
              </div>
              <div className="flex flex-wrap gap-4 flex-1 justify-end">
                <div className="relative w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search identities..."
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-black focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <select 
                  value={role} 
                  onChange={(e) => handleFilterChange(setRole, e.target.value)}
                  className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                >
                  <option value="">All Roles</option>
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
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">Indexing Registry...</td></tr>
                  ) : users.length > 0 ? users.map((u: any) => (
                    <tr 
                      key={u.id} 
                      onClick={() => setSelectedUser(u)}
                      className={`hover:bg-gray-50/50 transition-all group cursor-pointer ${selectedUser?.id === u.id ? 'bg-emerald-50/50' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img 
                            src={u.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} 
                            className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-black text-gray-900 text-sm tracking-tight">{u.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold hl-mono mt-1">ID: {u.id.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700 hl-mono">{u.phone}</p>
                          <p className="text-[9px] text-slate-400 font-black tracking-widest">{u.email || 'No Email'}</p>
                        </div>
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
                        <div className="flex justify-end gap-2 text-gray-400">
                          {u.role !== 'SUPER_ADMIN' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setConfirmImpersonateUser(u); }}
                              disabled={impersonateMutation.isPending}
                              title="Impersonate User"
                              className="hover:text-[#0D4A3E] transition-all p-2 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                            >
                              <Monitor size={16} />
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(u.id); }}
                            className="hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-lg"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-300 font-bold text-[10px] uppercase tracking-[0.2em] italic">
                        No users found in registry
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination UI */}
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


          {selectedUser && (
            <div className="bg-slate-900 rounded-2xl p-10 text-white animate-in slide-in-from-bottom duration-700 border border-white/5 relative overflow-hidden mt-8">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Users size={120} className="text-white" />
               </div>
               <div className="relative z-10">
                  <div className="flex justify-between items-center mb-10">
                     <div>
                       <h3 className="text-2xl font-black tracking-tight">Audit Trail: {selectedUser.name}</h3>
                       <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-2">Deep Infrastructure Activity Analysis</p>
                     </div>
                     <button onClick={() => setSelectedUser(null)} className="h-10 px-4 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest border border-white/10">Close Analysis</button>
                  </div>
                   <div className="space-y-4 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar">
                     {activityLogs.length > 0 ? activityLogs.map((log: any, i: number) => (
                       <div key={i} className="flex items-start gap-5 p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                             <Users size={16} />
                          </div>
                          <div className="flex-1 space-y-2">
                             <div className="flex justify-between items-center">
                                <p className="text-sm font-black text-white tracking-tight">{log.action}</p>
                                <span className="text-[10px] font-black text-slate-500 hl-mono bg-white/5 px-2 py-1 rounded-md">{new Date(log.createdAt).toLocaleString()}</span>
                             </div>
                             <p className="text-xs text-slate-400 font-medium leading-relaxed">{log.details}</p>
                             <div className="flex items-center gap-2 pt-2">
                                <div className="h-1 w-1 rounded-full bg-slate-700" />
                                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Event ID: {log.id.slice(-8).toUpperCase()}</p>
                             </div>
                          </div>
                       </div>
                     )) : (
                       <div className="py-20 text-center space-y-4">
                          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-700">
                             <Search size={32} />
                          </div>
                          <p className="text-slate-500 font-black text-xs uppercase tracking-widest italic">No activity logs indexed for this identity</p>
                       </div>
                     )}
                   </div>
               </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                 <Monitor size={18} />
              </div>
              Traffic Intelligence
            </h3>
            <div className="space-y-6">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Platform Load</p>
                  <h4 className="text-2xl font-black text-slate-900 hl-mono">{sessions.length} <span className="text-xs text-slate-400 font-bold uppercase">Active</span></h4>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full mt-4 overflow-hidden">
                     <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (sessions.length / 100) * 100)}%` }} />
                  </div>
               </div>
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Access Distribution</p>
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
    <div className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl hover:bg-slate-50 transition-all">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${colors[color]}`} />
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black text-slate-900 hl-mono">{count}</span>
    </div>
  );
}
