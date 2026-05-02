import { useState } from 'react'
import { Users, Monitor, LogOut, Search, Filter, Trash2 } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'

export default function UserOperationsPage() {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getUsers({ search })
  })

  const { data: sessionsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['admin-sessions'],
    queryFn: adminApi.getSessions,
    refetchInterval: 10000
  })

  const { data: userActivityResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['user-activity', selectedUser?.id],
    queryFn: () => adminApi.getUserActivity(selectedUser.id),
    enabled: !!selectedUser
  })

  const users = usersData?.data || []
  const sessions = sessionsResponse?.data || []
  const activityLogs = userActivityResponse?.data || []

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully')
    }
  })

  const terminateMutation = useMutation({
    mutationFn: adminApi.terminateSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sessions'] })
      toast.success('Session terminated')
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Operations</h1>
          <p className="text-gray-500 font-medium">Manage platform users, security sessions, and deep activity audits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="text-2xl font-black">On-Cloud Identites</h3>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Real-time platform-wide active sessions</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">{sessions.length} Live</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Active User</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Network Access (IP)</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr><td colSpan={4} className="py-20 text-center animate-pulse">Scanning Cloud...</td></tr>
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
                            className="h-12 w-12 rounded-xl object-cover border border-slate-100 shadow-sm" 
                            alt="" 
                          />
                          <div>
                            <p className="font-black text-gray-900 text-sm">{s.user?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{s.user?.email || s.user?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-slate-700 hl-mono">{s.ipAddress || '192.168.1.1'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Entry Point</p>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 animate-pulse">
                          LIVE NOW
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); terminateMutation.mutate(s.id); }}
                          className="text-gray-400 hover:text-red-600 transition-all p-2"
                        >
                          <LogOut size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                        No active platform sessions detected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedUser && (
            <div className="bg-slate-900 rounded-2xl p-8 text-white animate-in slide-in-from-bottom duration-500">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-black">Audit Trail: {selectedUser.name}</h3>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Deep Activity Analysis</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white transition-all text-xs font-black uppercase">Close Audit</button>
               </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                  {activityLogs.length > 0 ? activityLogs.map((log: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                       <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <Users size={14} />
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                             <p className="text-xs font-black text-white">{log.action}</p>
                             <span className="text-[10px] font-bold text-slate-500 hl-mono">{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{log.details}</p>
                       </div>
                    </div>
                  )) : (
                    <p className="text-center text-slate-500 py-10 italic text-sm">No activity logs found for this user.</p>
                  )}
                </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm sticky top-6">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
              <Monitor size={20} className="text-emerald-600" />
              Live Sessions
            </h3>
            <div className="space-y-4">
              {sessions.length > 0 ? sessions.map((s: any) => (
                <div key={s.id} className="p-5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 mb-4">
                    <img 
                      src={s.user?.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${s.user?.name}`} 
                      className="h-10 w-10 rounded-lg object-cover" 
                      alt="" 
                    />
                    <div>
                      <p className="text-xs font-black text-gray-900 truncate max-w-[120px]">{s.user?.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold hl-mono uppercase">{s.ipAddress || 'Unknown IP'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-widest">Active Now</span>
                    <button 
                      onClick={() => terminateMutation.mutate(s.id)}
                      disabled={terminateMutation.isPending}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No active sessions</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
