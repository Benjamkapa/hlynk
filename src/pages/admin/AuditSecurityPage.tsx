import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { ShieldCheck, UserX, Key, Search, Filter, AlertTriangle, ShieldAlert } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'

import { useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function AuditSecurityPage() {
  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats
  })

  useEffect(() => {
    if (error) toast.error('Failed to load security data')
  }, [error])

  const securityEvents = (stats as any)?.securityLogs || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Audit & Security</h1>
          <p className="text-gray-500 font-medium">Security monitoring, compliance tracking and threat mitigation</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-red-600 text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-red-700 transition-all flex items-center gap-2">
            <ShieldAlert size={18} /> Incident Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityCard title="Security Alerts" value={stats?.securityAlertsCount || '0'} sub={(stats?.securityAlertsCount || 0) > 0 ? 'Urgent attention' : 'All clear today'} icon={ShieldCheck} status={(stats?.securityAlertsCount || 0) > 0 ? 'danger' : 'safe'} />
        <SecurityCard title="Failed Logins" value={stats?.failedLoginsCount || '0'} sub="Last 24 hours" icon={UserX} status={(stats?.failedLoginsCount || 0) > 5 ? 'warning' : 'safe'} />
        <SecurityCard title="Active Protocols" value={stats?.activeProtocolsCount || '0'} sub="Encryption Active" icon={Key} status="safe" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-gray-900">Security Audit Logs</h3>
          <div className="flex gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" placeholder="Search events..." className="bg-gray-50 border-none rounded-lg py-2 pl-10 pr-4 outline-none text-xs font-bold" />
             </div>
             <button className="bg-gray-50 text-gray-500 px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-[10px] hover:bg-gray-100 transition-all uppercase tracking-widest border border-gray-100">
               <Filter size={14} /> Filter
             </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Severity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : securityEvents.length > 0 ? securityEvents.map((ev: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                  <td className="px-8 py-5 text-xs font-black text-gray-900 hl-mono">{ev.id?.slice(-8).toUpperCase() || `SEC-${100+i}`}</td>
                  <td className="px-8 py-5 text-xs font-bold text-gray-400 hl-mono">{new Date(ev.time || ev.createdAt).toLocaleTimeString()}</td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-700">{ev.event || ev.description}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">User: {ev.userName || ev.user || 'System'}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                      ev.severity === 'High' ? 'bg-red-100 text-red-600' :
                      ev.severity === 'Medium' ? 'bg-amber-100 text-amber-600' :
                      ev.severity === 'Info' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {ev.severity || 'Info'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-gray-400 hl-mono">{ev.ip || '127.0.0.1'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No security events found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SecurityCard({ title, value, sub, icon: Icon, status }: any) {
  const statusColors = {
    safe: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    danger: 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div className={`h-12 w-12 rounded-md flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${statusColors[status as keyof typeof statusColors]}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h2 className="text-2xl font-black text-gray-900 mb-1 hl-mono">{value}</h2>
      <p className="text-[10px] text-gray-500 font-bold hl-mono">{sub}</p>
    </div>
  )
}
