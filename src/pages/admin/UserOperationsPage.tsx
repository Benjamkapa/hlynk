import { useState } from 'react'
import { Users, Monitor, LogOut, Search, Filter, Trash2 } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'

export default function UserOperationsPage() {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: usersData, isLoading } = useQuery<{ success: boolean; data: { users: any[] } }>({
    queryKey: ['admin-users', search],
    queryFn: () => adminApi.getUsers({ search })
  })

  const users = usersData?.data?.users || []

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User deleted successfully')
    },
    onError: () => toast.error('Failed to delete user')
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Operations</h1>
          <p className="text-gray-500 font-medium">Manage all platform users, roles, and access controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search users by name, phone, or email..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm" 
                />
              </div>
              <button className="bg-gray-50 text-gray-500 h-12 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
                <Filter size={16} />
                Filters
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                      </td>
                    </tr>
                  ) : users.length > 0 ? users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold hl-mono">{u.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-600">{u.tenant?.businessName || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{u.role}</span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          u.phoneVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {u.phoneVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => { if(window.confirm('Delete this user permanently?')) deleteMutation.mutate(u.id) }} 
                          className="p-2 hover:bg-red-50 rounded-md transition-all group-hover:scale-110"
                        >
                          <Trash2 size={18} className="text-gray-400 group-hover:text-red-600" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
              <Monitor size={20} className="text-emerald-600" />
              Live Sessions
            </h3>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-md bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-md bg-white text-gray-400 flex items-center justify-center border border-gray-100 group-hover:border-emerald-100 transition-all">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">User <span className="hl-mono">#{i}042</span></p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hl-mono">10.0.0.{i} • Nairobi, KE</p>
                    </div>
                  </div>
                  <button className="h-9 w-9 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all flex items-center justify-center">
                    <LogOut size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
