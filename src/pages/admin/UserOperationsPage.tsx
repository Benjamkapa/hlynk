import { useState } from 'react'
import { Users, Monitor, LogOut, Search, Filter } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'

import { useEffect } from 'react'

export default function UserOperationsPage() {
  const [search, setSearch] = useState('')
  const { data: logsData, isLoading, error } = useQuery<any[]>({
    queryKey: ['admin-logs', search],
    queryFn: () => adminApi.getStats().then(s => s.recentEvents || []) // Reusing stats events for logs
  })

  useEffect(() => {
    if (error) toast.error('Failed to load operation logs')
  }, [error])

  const logs = logsData || []
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Operations</h1>
          <p className="text-gray-500 font-medium">Track user behavior and detect platform misuse across all businesses</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white text-gray-600 h-12 px-6 rounded-md border border-gray-100 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            Audit Logs
          </button>
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
                  placeholder="Search logs by user, business, or IP..." 
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
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User / Origin</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                      </td>
                    </tr>
                  ) : logs.length > 0 ? logs.map((op: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900 text-sm">{op.user || 'System'}</div>
                        <div className="text-[10px] text-gray-400 font-bold hl-mono">{op.ip || '127.0.0.1'}</div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-600">{op.action || op.type}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{op.module || 'System'}</p>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-500">{op.business || 'lynk'}</td>
                      <td className="px-8 py-5 text-xs font-bold text-gray-400 hl-mono">{new Date(op.time || op.createdAt).toLocaleTimeString()}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          (op.status || 'Success') === 'Success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {op.status || 'Success'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No operations recorded</td>
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
