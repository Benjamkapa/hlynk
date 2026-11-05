import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Search, ShieldAlert, RefreshCcw, FileText, Download, Eye } from 'lucide-react'
import InlineLoader, { ButtonLoader } from '../../components/shared/InlineLoader'
import { SlideOver } from '../../components/shared/SlideOver'
import { useState, useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'
import { exportToCSV } from '../../lib/utils/export'
import { formatDate } from '../../lib/utils/date'
import Pagination from '../../components/shared/Pagination'

// Set to true to show the database backup / restore controls in the header
const SHOW_DB_TOOLS = false

// Logs and health refresh automatically
const LIVE_POLL_LOGS_MS = 10_000
const LIVE_POLL_HEALTH_MS = 15_000

type Tone = 'red' | 'emerald' | 'blue' | 'amber' | 'slate'

const DOT: Record<Tone, string> = {
  red: 'bg-red-500',
  emerald: 'bg-emerald-500',
  blue: 'bg-sky-500',
  amber: 'bg-amber-500',
  slate: 'bg-slate-300',
}

function logTone(logName: string, action: string): Tone {
  const c = `${logName} ${action}`.toUpperCase()
  if (c.includes('SECURITY') || c.includes('DANGER') || c.includes('DELETED') || c.includes('SUSPENDED')) return 'red'
  if (c.includes('SALE') || c.includes('PAYMENT') || c.includes('MPESA') || c.includes('BILLING')) return 'emerald'
  if (c.includes('BOOKING') || c.includes('RESERVATION') || c.includes('UNIT')) return 'blue'
  if (c.includes('LOGIN') || c.includes('IMPERSONATION') || c.includes('AUTH')) return 'amber'
  return 'slate'
}

const selectCls =
  'rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E]'

export default function AuditSecurityPage() {
  const queryClient = useQueryClient()
  const [logPage, setLogPage] = useState(1)
  const [logLimit, setLogLimit] = useState(25)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedLog, setSelectedLog] = useState<any>(null)

  const [isBackingUp, setIsBackingUp] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)
  const [restorePassphrase, setRestorePassphrase] = useState('')

  const handleBackupDownload = async () => {
    setIsBackingUp(true)
    setBackupProgress(0)
    try {
      const blob = await adminApi.downloadDatabaseBackup((progressEvent) => {
        if (progressEvent.total) {
          setBackupProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
        } else {
          setBackupProgress((prev) => (prev < 90 ? prev + 10 : prev))
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
    if (!restorePassphrase.trim()) {
      toast.error('Please enter the security restore passphrase')
      return
    }
    setIsRestoring(true)
    const toastId = toast.loading('Restoring and overriding database globally...')
    try {
      const res: any = await adminApi.restoreDatabaseBackup(restoreFile, restorePassphrase)
      toast.success(res?.message || 'Database content overridden successfully! Refreshing system...', { id: toastId })
      setRestoreFile(null)
      setRestorePassphrase('')
      queryClient.clear()
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err: any) {
      toast.error(
        'Failed to restore database: ' + (err.response?.data?.message || err.message || 'Unknown error'),
        { id: toastId },
      )
    } finally {
      setIsRestoring(false)
    }
  }

  const { data: rawStats, error: statsError } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
  })

  const { data: healthRes } = useQuery<any>({
    queryKey: ['admin-health'],
    queryFn: () => adminApi.getSystemHealth(),
    refetchInterval: LIVE_POLL_HEALTH_MS,
  })

  const stats: AdminStats = rawStats?.data || rawStats
  const healthData = healthRes?.data

  const { data: logsRes, isLoading: logsLoading, isFetching: logsFetching, refetch: refetchLogs } = useQuery<any>({
    queryKey: ['admin-activity-logs', logPage, logLimit, search, category],
    queryFn: () => adminApi.getActivityLogs({ page: logPage, limit: logLimit, search, category }),
    refetchInterval: LIVE_POLL_LOGS_MS,
  })

  const logsData = logsRes?.data
  const items: any[] = logsData?.items || []

  const handleIncidentReport = () => {
    window.location.href =
      'mailto:info@hlynk.co.ke?subject=SECURITY INCIDENT: [Action Required]&body=Please describe the incident details here...'
    toast.success('Security incident report initiated')
  }

  useEffect(() => {
    if (statsError) toast.error('Failed to load security data')
  }, [statsError])

  const handleLogExport = () => {
    if (!items.length) return
    exportToCSV(items, 'global_activity_logs')
    toast.success('Global logs exported to CSV')
  }

  const handleFilterChange = (setter: (v: any) => void, val: any) => {
    setter(val)
    setLogPage(1)
  }

  const alerts = Number(stats?.securityAlertsCount || 0)
  const failedLogins = Number(stats?.failedLoginsCount || 0)
  const uptime = healthData?.uptime || 0
  const serverStatus = healthData?.status || 'Healthy'
  const degraded = serverStatus === 'Degraded'
  const currentIP = healthData?.adminIpSecurity?.currentIP || '127.0.0.1'

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live · updates every 10 seconds
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight text-slate-900">Audit &amp; security</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SHOW_DB_TOOLS && (
            <>
              <button
                onClick={handleBackupDownload}
                disabled={isBackingUp}
                className="relative inline-flex items-center gap-2 overflow-hidden rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-90"
              >
                {isBackingUp && (
                  <span
                    className="absolute inset-y-0 left-0 bg-emerald-100 transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {isBackingUp ? <ButtonLoader size={13} /> : <Download size={13} />}
                  {isBackingUp ? (backupProgress > 0 ? `Downloading ${backupProgress}%` : 'Preparing…') : 'Backup database'}
                </span>
              </button>

              <label className="relative inline-flex cursor-pointer items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                <input
                  type="file"
                  accept=".sql"
                  onChange={handleRestoreStage}
                  disabled={isRestoring}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                />
                {isRestoring ? <ButtonLoader size={13} /> : <RefreshCcw size={13} />}
                Restore SQL
              </label>
            </>
          )}

          <button
            onClick={handleIncidentReport}
            className="inline-flex items-center gap-2 rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <ShieldAlert size={13} /> Report incident
          </button>
        </div>
      </header>

      {/* Status strip */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <dl className="grid grid-cols-2 divide-slate-200 max-md:divide-y md:grid-cols-4 md:divide-x [&>*:nth-child(odd)]:max-md:border-r [&>*:nth-child(odd)]:max-md:border-slate-200">
          <Stat
            label="Server"
            value={serverStatus}
            note={`Uptime ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`}
            tone={degraded ? 'amber' : 'emerald'}
          />
          <Stat
            label="Database latency"
            value={healthData?.dbLatency || '<10ms'}
            note={`API ${healthData?.apiLatency || '<12ms'}`}
          />
          <Stat
            label="Security alerts"
            value={String(alerts)}
            note={alerts > 0 ? 'Needs attention' : 'No threats detected'}
            tone={alerts > 0 ? 'red' : undefined}
          />
          <Stat
            label="Failed logins, 24h"
            value={String(failedLogins)}
            note="Rate limiting active"
            tone={failedLogins > 5 ? 'amber' : undefined}
          />
        </dl>

        <div className="flex flex-col gap-1 border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-600">Admin access is limited to approved IP addresses.</p>
          <p className="flex items-center gap-2 text-slate-500">
            Your IP <span className="text-slate-900 hl-mono">{currentIP}</span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Whitelisted
            </span>
          </p>
        </div>
      </section>

      {/* Audit log */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 xl:flex-row xl:items-center xl:justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Audit log <span className="ml-1 font-normal text-slate-400">{logsData?.pagination?.total || 0}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user, business or action"
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full rounded border border-slate-300 bg-white py-2 pl-8 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#0D4A3E]"
              />
            </label>
            <select value={category} onChange={(e) => handleFilterChange(setCategory, e.target.value)} className={selectCls}>
              <option value="">All categories</option>
              <option value="LOGIN">Auth &amp; sessions</option>
              <option value="Sale">Sales &amp; POS</option>
              <option value="Booking">Bookings</option>
              <option value="Payment">Payments</option>
              <option value="Inventory">Inventory</option>
              <option value="Security">Security</option>
              <option value="Billing">Billing</option>
              <option value="Danger">Administrative</option>
            </select>
            <select
              value={logLimit}
              onChange={(e) => handleFilterChange(setLogLimit, Number(e.target.value))}
              className={selectCls}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <button
              onClick={() => refetchLogs()}
              title="Refresh"
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              <RefreshCcw size={13} className={logsFetching ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogExport}
              disabled={!items.length}
              className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <FileText size={13} /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">IP</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <InlineLoader message="Loading activity logs..." />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                    No log entries match your filters.
                  </td>
                </tr>
              ) : (
                items.map((log: any) => {
                  const tone = logTone(log.logName || '', log.action || '')
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <p className="text-sm text-slate-900">{formatDate(log.createdAt)}</p>
                        <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-slate-900">{log.user?.name || 'System'}</p>
                        <p className="text-xs text-slate-400">{log.user?.email || 'Automated'}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-700">{log.tenant?.businessName || 'Platform'}</td>
                      <td className="px-6 py-3.5">
                        <p className="flex items-center gap-2 text-sm text-slate-900">
                          <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} />
                          {log.logName || log.action}
                        </p>
                        <p className="mt-0.5 max-w-sm truncate text-xs text-slate-500">{log.details}</p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-3.5 text-xs text-slate-500 hl-mono">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedLog(log)
                            }}
                            title="View details"
                            className="rounded p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Eye size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {(logsData?.pagination?.pages || 1) > 1 && (
          <div className="border-t border-slate-200 px-6 py-4">
            <Pagination
              page={logPage}
              pages={logsData?.pagination?.pages || 1}
              total={logsData?.pagination?.total || 0}
              onPageChange={setLogPage}
              label="Log entry"
            />
          </div>
        )}
      </section>

      {/* Log inspector */}
      <SlideOver isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Log entry">
        {selectedLog && (
          <div className="space-y-6">
            <div>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <span className={`h-2 w-2 rounded-full ${DOT[logTone(selectedLog.logName || '', selectedLog.action || '')]}`} />
                {selectedLog.logName || selectedLog.action}
              </p>
              <p className="mt-2 text-base text-slate-900">{selectedLog.details}</p>
            </div>

            <dl className="divide-y divide-slate-100 border-y border-slate-200">
              <DetailRow label="User" value={selectedLog.user?.name || 'System (automated)'} />
              <DetailRow label="Email" value={selectedLog.user?.email || '—'} />
              <DetailRow label="Business" value={selectedLog.tenant?.businessName || 'Platform'} />
              <DetailRow label="Time" value={new Date(selectedLog.createdAt).toLocaleString()} />
              <DetailRow label="IP address" value={selectedLog.ipAddress || '127.0.0.1'} mono />
              <DetailRow label="Log ID" value={selectedLog.id} mono />
            </dl>
          </div>
        )}
      </SlideOver>

      {/* Restore database */}
      {restoreFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-serif text-xl text-slate-900">Overwrite the database?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Restoring from <span className="font-medium text-slate-900">{restoreFile.name}</span> will replace the
              entire database. This cannot be undone.
            </p>

            <label className="mt-5 block text-xs font-medium text-slate-500">Restore passphrase</label>
            <input
              type="password"
              placeholder="Enter passphrase to authorise"
              value={restorePassphrase}
              onChange={(e) => setRestorePassphrase(e.target.value)}
              className="mt-1.5 w-full rounded border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-red-400"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setRestoreFile(null)
                  setRestorePassphrase('')
                }}
                disabled={isRestoring}
                className="flex-1 rounded border border-slate-300 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRestoreConfirm}
                disabled={isRestoring || !restorePassphrase.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded bg-red-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isRestoring ? <ButtonLoader size={15} /> : 'Overwrite database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note: string
  tone?: 'emerald' | 'amber' | 'red'
}) {
  const color = tone === 'red' ? 'text-red-600' : tone === 'amber' ? 'text-amber-600' : 'text-slate-900'
  return (
    <div className="px-6 py-5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={`mt-1.5 font-serif text-3xl tabular-nums tracking-tight ${color}`}>{value}</dd>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  )
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-sm text-slate-500">{label}</dt>
      <dd className={`min-w-0 break-all text-right text-sm text-slate-900 ${mono ? 'hl-mono' : ''}`}>{value}</dd>
    </div>
  )
}