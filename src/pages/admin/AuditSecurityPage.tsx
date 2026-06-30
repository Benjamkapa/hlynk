import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { ShieldCheck, UserX, Key, Search, ShieldAlert, ChevronLeft, ChevronRight, RefreshCcw, FileText, Loader2, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'
import { exportToCSV } from '../../lib/utils/export'
import CountUp from '../../components/shared/CountUp'

export default function AuditSecurityPage() {
  const [logPage, setLogPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [isBackingUp, setIsBackingUp] = useState(false)

  const handleBackupDownload = async () => {
    setIsBackingUp(true)
    const toastId = toast.loading('Generating live database backup (non-blocking)...')
    try {
      const blob = await adminApi.downloadDatabaseBackup()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      let hours = d.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(hours)}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-${ampm}`;
      link.setAttribute('download', `hlynk_live_backup_${timestamp}.sql`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Database backup downloaded successfully!', { id: toastId })
    } catch (e: any) {
      toast.error('Failed to download database backup: ' + (e.message || 'Unknown error'), { id: toastId })
    } finally {
      setIsBackingUp(false)
    }
  }

  const { data: rawStats, isLoading: statsLoading, error: statsError } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  const stats: AdminStats = rawStats?.data || rawStats

  const { data: logsRes, isLoading: logsLoading, refetch: refetchLogs } = useQuery<any>({
    queryKey: ['admin-activity-logs', logPage, search, category],
    queryFn: () => adminApi.getActivityLogs({ page: logPage, limit: 5, search, category })
  })

  const logsData = logsRes?.data

  const handleIncidentReport = () => {
    window.location.href = 'mailto:security@hlynk.co.ke?subject=SECURITY INCIDENT: [Action Required]&body=Please describe the incident details here...'
    toast.success('Security incident report initiated')
  }

  useEffect(() => {
    if (statsError) toast.error('Failed to load security data')
  }, [statsError])

  const handleLogExport = () => {
    if (!logsData?.items) return
    exportToCSV(logsData.items, 'global_activity_logs')
    toast.success('Global logs exported to CSV')
  }

  const handleFilterChange = (setter: any, val: string) => {
    setter(val)
    setLogPage(1)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Audit & Security</h1>
          <p className="text-gray-500 font-medium">Global security monitoring, compliance tracking and threat mitigation</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleBackupDownload}
            disabled={isBackingUp}
            className="bg-emerald-600 text-white h-12 px-6 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/15 disabled:opacity-50"
          >
            {isBackingUp ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {isBackingUp ? 'Preparing...' : 'DB Backup'}
          </button>
          <button 
            onClick={handleIncidentReport}
            className="bg-red-600 text-white h-12 px-6 rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/20"
          >
            <ShieldAlert size={18} /> Incident Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SecurityCard title="Security Alerts" value={<CountUp end={Number(stats?.securityAlertsCount || 0)} />} sub={(stats?.securityAlertsCount || 0) > 0 ? 'Urgent attention' : 'All clear today'} icon={ShieldCheck} status={(stats?.securityAlertsCount || 0) > 0 ? 'danger' : 'safe'} />
        <SecurityCard title="Failed Logins" value={<CountUp end={Number(stats?.failedLoginsCount || 0)} />} sub="Last 24 hours" icon={UserX} status={(stats?.failedLoginsCount || 0) > 5 ? 'warning' : 'safe'} />
        <SecurityCard title="Active Protocols" value={<CountUp end={Number(stats?.activeProtocolsCount || 0)} />} sub="Encryption Active" icon={Key} status="safe" />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
             <h3 className="text-xl font-black text-gray-900 mb-1">Global System Logs</h3>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{logsData?.pagination?.total || 0} total actions tracked</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => refetchLogs()} className="h-10 px-4 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all border border-gray-100">
                <RefreshCcw size={14} /> Refresh
             </button>
             <button onClick={handleLogExport} className="h-10 px-4 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-100 transition-all border border-gray-100">
                <FileText size={14} /> CSV
             </button>
          </div>
        </div>
        
        <div className="px-8 py-4 bg-slate-50/30 border-b border-gray-50 flex flex-wrap gap-4">
           <div className="flex-1 relative min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by user, business or action..." 
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-xl py-2.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 text-sm font-medium" 
              />
           </div>
           <select 
             value={category} 
             onChange={(e) => handleFilterChange(setCategory, e.target.value)}
             className="bg-white border border-gray-100 rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[180px]"
           >
             <option value="">All Categories</option>
             <option value="LOGIN">Auth Events</option>
             <option value="PAYMENT">Financials</option>
             <option value="INVENTORY">Inventory</option>
             <option value="STAFF">Management</option>
             <option value="SYSTEM">Infrastructure</option>
           </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time & Date</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User / Identity</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business / Tenant</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Description</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">IP Origin</th>
                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logsLoading ? (
                <tr><td colSpan={6} className="py-24 text-center"><Loader2 size={32} className="animate-spin text-emerald-600 mx-auto" /></td></tr>
              ) : logsData?.items?.length === 0 ? (
                <tr><td colSpan={6} className="py-24 text-center text-gray-400 italic font-black text-xs uppercase tracking-widest">No activity logs found</td></tr>
              ) : logsData?.items.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                  <td className="p-6">
                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold text-gray-400 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                         {log.user?.photoUrl ? (
                           <img src={log.user.photoUrl} alt="" className="h-full w-full object-cover" />
                         ) : (
                           <span className="text-[10px] font-black text-slate-400">{log.user?.name?.substring(0,2).toUpperCase() || 'SYS'}</span>
                         )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 leading-none mb-1">{log.user?.name || 'System'}</p>
                        <p className="text-[10px] font-medium text-gray-400">{log.user?.email || 'automated@system'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">{log.tenant?.businessName || 'GLOBAL'}</p>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray-200 mb-2 inline-block">
                      {log.logName || log.action}
                    </span>
                    <p className="text-[10px] font-bold text-gray-500 max-w-[200px] truncate">{log.details}</p>
                  </td>
                  <td className="p-6 text-center text-[10px] font-black text-gray-400 hl-mono">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-6 text-right">
                    <p className="text-[10px] font-black text-emerald-600/30 hl-mono group-hover:text-emerald-600 transition-colors uppercase">{log.actionId || log.id.slice(-8).toUpperCase()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-8 border-t border-gray-50 flex items-center justify-between bg-slate-50/20">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing {logsData?.items?.length || 0} of {logsData?.pagination?.total || 0} global records
           </p>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setLogPage(p => Math.max(1, p - 1))}
                disabled={logPage === 1}
                className="h-12 w-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="px-6 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-xs font-black hl-mono">
                 {logPage} / {logsData?.pagination?.pages || 1}
              </div>
              <button 
                onClick={() => setLogPage(p => Math.min(logsData?.pagination?.pages || 1, p + 1))}
                disabled={logPage === (logsData?.pagination?.pages || 1)}
                className="h-12 w-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
           </div>
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
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-sm ${statusColors[status as keyof typeof statusColors]}`}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
      <h2 className="text-3xl font-black text-gray-900 mb-1 hl-mono">{value}</h2>
      <p className="text-[10px] text-gray-500 font-bold hl-mono uppercase tracking-widest">{sub}</p>
    </div>
  )
}
