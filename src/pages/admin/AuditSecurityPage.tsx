import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { 
  ShieldCheck, UserX, Key, Search, ShieldAlert, 
  RefreshCcw, FileText, Loader2, Download, Radio, 
  Terminal, Activity, Eye, X, Server, Zap 
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'
import { exportToCSV } from '../../lib/utils/export'
import CountUp from '../../components/shared/CountUp'
import { formatDate } from '../../lib/utils/date'
import Pagination from '../../components/shared/Pagination'

export default function AuditSecurityPage() {
  const [logPage, setLogPage] = useState(1)
  const [logLimit, setLogLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [isLiveFeed, setIsLiveFeed] = useState(true)
  const [showConsole, setShowConsole] = useState(true)
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)

  const handleBackupDownload = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    try {
      const blob = await adminApi.downloadDatabaseBackup((progressEvent) => {
        if (progressEvent.total) {
          setBackupProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        } else {
          setBackupProgress(prev => (prev < 90 ? prev + 10 : prev))
        }
      })
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      const d = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      let hours = d.getHours()
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12 || 12
      const timestamp = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(hours)}-${pad(d.getMinutes())}-${pad(d.getSeconds())}-${ampm}`
      link.setAttribute('download', `hlynk_live_backup_${timestamp}.sql`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Database backup downloaded successfully!')
    } catch (e: any) {
      toast.error('Failed to download database backup: ' + (e.message || 'Unknown error'))
    } finally {
      setIsBackingUp(false)
      setTimeout(() => setBackupProgress(0), 1000)
    }
  }

  const handleRestoreStage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setRestoreFile(file)
    e.target.value = ''
  }

  const handleRestoreConfirm = async () => {
    if (!restoreFile) return
    setIsRestoring(true)
    const toastId = toast.loading('Restoring database globally...')
    try {
      await adminApi.restoreDatabaseBackup(restoreFile)
      toast.success('System database restored successfully! Please refresh.', { id: toastId })
    } catch (err: any) {
      toast.error('Failed to restore database: ' + (err.message || 'Unknown error'), { id: toastId })
    } finally {
      setIsRestoring(false)
      setRestoreFile(null)
    }
  }

  const { data: rawStats, error: statsError } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  const { data: healthRes } = useQuery<any>({
    queryKey: ['admin-health'],
    queryFn: () => adminApi.getSystemHealth(),
    refetchInterval: isLiveFeed ? 5000 : false
  })

  const stats: AdminStats = rawStats?.data || rawStats
  const healthData = healthRes?.data

  const { data: logsRes, isLoading: logsLoading, refetch: refetchLogs } = useQuery<any>({
    queryKey: ['admin-activity-logs', logPage, logLimit, search, category],
    queryFn: () => adminApi.getActivityLogs({ page: logPage, limit: logLimit, search, category }),
    refetchInterval: isLiveFeed ? 3000 : false
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

  const handleFilterChange = (setter: any, val: any) => {
    setter(val)
    setLogPage(1)
  }

  const getLogBadgeColor = (logName: string, action: string) => {
    const combined = `${logName} ${action}`.toUpperCase()
    if (combined.includes('SECURITY') || combined.includes('DANGER') || combined.includes('DELETED') || combined.includes('SUSPENDED')) {
      return 'bg-red-50 text-red-700 border-red-200'
    }
    if (combined.includes('SALE') || combined.includes('PAYMENT') || combined.includes('MPESA') || combined.includes('BILLING')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
    if (combined.includes('BOOKING') || combined.includes('RESERVATION') || combined.includes('UNIT')) {
      return 'bg-blue-50 text-blue-700 border-blue-200'
    }
    if (combined.includes('LOGIN') || combined.includes('IMPERSONATION') || combined.includes('AUTH')) {
      return 'bg-amber-50 text-amber-700 border-amber-200'
    }
    return 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-4">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-gray-900">Audit & Operations Monitor</h1>
            {isLiveFeed && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Feed Active
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-0.5">Real-time system operations audit, live server telemetry and activity monitoring</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Live Feed Toggle Button */}
          <button
            onClick={() => {
              setIsLiveFeed(!isLiveFeed)
              toast.info(isLiveFeed ? 'Live feed paused' : 'Live feed activated (3s auto-polling)')
            }}
            className={`h-10 px-4 rounded-md font-bold text-xs transition-all flex items-center gap-2 border shadow-sm ${
              isLiveFeed 
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Radio size={14} className={isLiveFeed ? 'animate-spin' : ''} />
            {isLiveFeed ? 'Real-Time Streaming' : 'Paused'}
          </button>

          <button 
            onClick={handleBackupDownload}
            disabled={isBackingUp}
            className="relative overflow-hidden bg-slate-800 text-white h-10 px-4 rounded-md font-bold text-xs hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-90 shadow-sm"
          >
            {isBackingUp && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-slate-700 transition-all duration-300 ease-out z-0"
                style={{ width: `${backupProgress}%` }}
              />
            )}
            <div className="relative z-10 flex items-center gap-2">
              {isBackingUp ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{backupProgress > 0 ? `Downloading ${backupProgress}%` : 'Preparing...'}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>DB Backup</span>
                </>
              )}
            </div>
          </button>

          <div className="relative">
            <input 
              type="file" 
              accept=".sql" 
              onChange={handleRestoreStage} 
              disabled={isRestoring}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
            <button 
              disabled={isRestoring}
              className="bg-white text-gray-700 border border-gray-200 h-10 px-4 rounded-md font-bold text-xs hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isRestoring ? <Loader2 size={14} className="animate-spin text-slate-700" /> : <RefreshCcw size={14} />}
              Restore SQL
            </button>
          </div>

          <button 
            onClick={handleIncidentReport}
            className="bg-red-50 text-red-600 border border-red-200 h-10 px-4 rounded-md font-bold text-xs hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm"
          >
            <ShieldAlert size={14} /> Incident Report
          </button>
        </div>
      </div>

      {/* Live System Telemetry Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TelemetryMetricCard
          label="Server Telemetry"
          value={healthData?.status || 'Healthy'}
          sub={`Uptime: ${Math.floor((healthData?.uptime || 0) / 3600)}h ${Math.floor(((healthData?.uptime || 0) % 3600) / 60)}m`}
          icon={Server}
          color={healthData?.status === 'Degraded' ? 'amber' : 'emerald'}
        />
        <TelemetryMetricCard
          label="DB Latency"
          value={healthData?.dbLatency || '<10ms'}
          sub={`API: ${healthData?.apiLatency || '<12ms'}`}
          icon={Zap}
          color="blue"
        />
        <TelemetryMetricCard
          label="Security Alerts"
          value={<CountUp end={Number(stats?.securityAlertsCount || 0)} />}
          sub={(stats?.securityAlertsCount || 0) > 0 ? 'Attention Required' : 'Zero Threat Signals'}
          icon={ShieldCheck}
          color={(stats?.securityAlertsCount || 0) > 0 ? 'red' : 'emerald'}
        />
        <TelemetryMetricCard
          label="Failed Logins (24h)"
          value={<CountUp end={Number(stats?.failedLoginsCount || 0)} />}
          sub="Rate Limiting Active"
          icon={UserX}
          color={(stats?.failedLoginsCount || 0) > 5 ? 'amber' : 'gray'}
        />
      </div>

      {/* Live Monospace Terminal Feed (Collapsible) */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl text-slate-200">
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              SYSTEM_LIVE_STREAM.LOG — telemetry feed
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400/80 flex items-center gap-1.5">
              <Activity size={12} className="animate-pulse" />
              {logsData?.items?.length || 0} Events Filtered
            </span>
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="text-xs text-slate-400 hover:text-white font-mono uppercase tracking-wider"
            >
              [{showConsole ? 'HIDE TERMINAL' : 'EXPAND TERMINAL'}]
            </button>
          </div>
        </div>

        {showConsole && (
          <div className="p-4 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5 bg-slate-950/90 leading-relaxed">
            {logsLoading ? (
              <div className="flex items-center gap-2 text-slate-500 py-2">
                <Loader2 size={14} className="animate-spin text-emerald-400" />
                <span>Connecting to live server activity stream...</span>
              </div>
            ) : !logsData?.items || logsData.items.length === 0 ? (
              <p className="text-slate-600 py-2">[SYS_INFO] No server events recorded matching filter parameters.</p>
            ) : (
              logsData.items.slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-0.5 hover:bg-slate-900/60 px-2 rounded transition-colors group">
                  <span className="text-slate-500 shrink-0">
                    [{new Date(log.createdAt).toLocaleTimeString('en-GB')}]
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
                    {log.logName || log.action || 'EVENT'}
                  </span>
                  <span className="text-slate-300 font-medium">
                    {log.user?.name || log.user?.email || 'SYSTEM'}:
                  </span>
                  <span className="text-slate-400 truncate max-w-md">
                    {log.details}
                  </span>
                  <span className="text-slate-600 text-[10px] ml-auto shrink-0 group-hover:text-slate-400">
                    IP: {log.ipAddress || '127.0.0.1'} | ID: {log.id?.slice(-8).toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Operations Log Table */}
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <span>Operations Audit Ledger</span>
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs font-semibold">
                {logsData?.pagination?.total || 0} Records
              </span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Comprehensive audit trail of all transactions, user logins, data changes and server operations</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => refetchLogs()} 
              className="h-9 px-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-200"
            >
              <RefreshCcw size={13} className={logsLoading ? 'animate-spin text-emerald-600' : ''} /> 
              <span>Refresh</span>
            </button>

            <button 
              onClick={handleLogExport} 
              className="h-9 px-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-200"
            >
              <FileText size={13} /> 
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex-1 relative min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              placeholder="Search user, business, action or keyword..." 
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium transition-all" 
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <select 
              value={category} 
              onChange={(e) => handleFilterChange(setCategory, e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 min-w-[170px]"
            >
              <option value="">All Operational Categories</option>
              <option value="LOGIN">Auth & Sessions</option>
              <option value="Sale">Sales & POS</option>
              <option value="Booking">Bookings & Hospitality</option>
              <option value="Payment">M-Pesa & Payments</option>
              <option value="Inventory">Inventory & Products</option>
              <option value="Security">Security & Access</option>
              <option value="Billing">Billing & Subscription</option>
              <option value="Danger">Administrative / Danger</option>
            </select>

            {/* Per Page Limit Selector */}
            <select
              value={logLimit}
              onChange={(e) => handleFilterChange(setLogLimit, Number(e.target.value))}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">User / Identity</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tenant / Store</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Operation Details</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center">IP Address</th>
                <th className="px-6 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {logsLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Loader2 size={26} className="animate-spin text-emerald-600 mx-auto mb-2" />
                    <span className="text-gray-400 font-medium">Fetching real-time activity logs...</span>
                  </td>
                </tr>
              ) : !logsData?.items || logsData.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400 italic font-medium">
                    No activity logs recorded matching current query parameters.
                  </td>
                </tr>
              ) : (
                logsData.items.map((log: any) => {
                  const badgeStyle = getLogBadgeColor(log.logName || '', log.action || '')
                  return (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-900 mb-0.5">{formatDate(log.createdAt)}</p>
                        <p className="text-[10px] font-mono text-gray-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                            {log.user?.photoUrl ? (
                              <img src={log.user.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-[10px] font-black text-slate-500">
                                {(log.user?.name || log.logName || 'SYS').substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 leading-none mb-1">{log.user?.name || 'System Auto'}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{log.user?.email || 'automated@system'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider border border-slate-200">
                          {log.tenant?.businessName || 'GLOBAL PLATFORM'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${badgeStyle}`}>
                            {log.logName || log.action}
                          </span>
                        </div>
                        <p className="text-gray-600 font-medium max-w-sm truncate text-xs">{log.details}</p>
                      </td>

                      <td className="px-6 py-4 text-center font-mono text-[11px] text-gray-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="View Full Log Details"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/30">
          <Pagination
            page={logPage}
            pages={logsData?.pagination?.pages || 1}
            total={logsData?.pagination?.total || 0}
            onPageChange={setLogPage}
            label="Log Entry"
          />
        </div>
      </div>

      {/* Log Details Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">
                  {selectedLog.logName || selectedLog.action}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">Log Inspector</h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Log ID:</span>
                  <span className="font-mono text-gray-700 font-bold">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Timestamp:</span>
                  <span className="font-mono text-gray-700">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">IP Address:</span>
                  <span className="font-mono text-gray-700">{selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-semibold">Tenant / Business:</span>
                  <span className="font-bold text-emerald-700">{selectedLog.tenant?.businessName || 'GLOBAL'}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">User Identity</label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600">
                    {(selectedLog.user?.name || 'S').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{selectedLog.user?.name || 'System Automated Process'}</p>
                    <p className="text-[10px] text-gray-400">{selectedLog.user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase text-[10px] tracking-wider mb-1">Event Description</label>
                <div className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="h-10 px-5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Database Modal */}
      {restoreFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Overwrite Global Database?</h3>
            <p className="text-xs text-gray-500 text-center font-medium mb-6">
              Restoring from <strong className="text-gray-900">{restoreFile.name}</strong> will completely overwrite the <strong>entire database</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setRestoreFile(null)}
                disabled={isRestoring}
                className="flex-1 h-10 bg-gray-100 text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleRestoreConfirm}
                disabled={isRestoring}
                className="flex-1 h-10 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
              >
                {isRestoring ? <Loader2 size={15} className="animate-spin" /> : 'Yes, Overwrite Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TelemetryMetricCard({ label, value, sub, icon: Icon, color }: any) {
  const colorMap: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    gray: 'bg-gray-50 text-gray-600 border-gray-100'
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400">{label}</span>
        <div className={`p-1.5 rounded-lg border ${colorMap[color] || colorMap.gray}`}>
          <Icon size={14} />
        </div>
      </div>
      <div>
        <p className="text-lg sm:text-xl font-mono font-bold text-gray-900 tracking-tight">{value}</p>
        <p className="text-[10px] font-medium text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  )
}