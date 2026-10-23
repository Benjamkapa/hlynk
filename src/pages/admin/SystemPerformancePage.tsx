import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  Download,
  Globe,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { getErrorMessage } from '../../lib/utils/error'
import { useEffect, useMemo, useState } from 'react'
import InlineLoader from '../../components/shared/InlineLoader'

type Point = {
  ts: number
  time: string
  api: number
  db: number
  cpu: number
  mpesa: number
}
type MetricKey = 'api' | 'db' | 'cpu' | 'mpesa'
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'
type ClusterNode = {
  name?: string
  region?: string
  status?: string
  load?: string | number
}

const MAX_POINTS = 120
const POLL_MS = 60_000
const THEME = '#10B981'

const numberValue = (value: unknown): number => {
  const parsed = Number.parseFloat(String(value ?? '').replace('%', '').replace('ms', '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

const formatMetric = (value: unknown, unit = '') => {
  if (value === null || value === undefined || value === '') return `—${unit}`
  return `${value}${unit}`
}

function getStatus(value: number, warningAt: number, criticalAt: number): HealthStatus {
  if (!Number.isFinite(value)) return 'unknown'
  if (value >= criticalAt) return 'critical'
  if (value >= warningAt) return 'warning'
  return 'healthy'
}

function overallStatus(values: HealthStatus[]): HealthStatus {
  if (values.includes('critical')) return 'critical'
  if (values.includes('warning')) return 'warning'
  if (values.every((value) => value === 'healthy')) return 'healthy'
  return 'unknown'
}

function changePercent(points: Point[], key: MetricKey): number | null {
  if (points.length < 2) return null
  const first = points[0][key]
  const last = points[points.length - 1][key]
  if (first === 0) return last === 0 ? 0 : null
  return ((last - first) / Math.abs(first)) * 100
}

function statusLabel(status: HealthStatus) {
  return ({
    healthy: 'Operational',
    warning: 'Degraded',
    critical: 'Critical',
    unknown: 'Unknown',
  })[status]
}

function StatusPill({ status }: { status: HealthStatus }) {
  const styles: Record<HealthStatus, string> = {
    healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    critical: 'bg-rose-50 text-rose-700 ring-rose-200',
    unknown: 'bg-slate-100 text-slate-600 ring-slate-200',
  }
  const dot: Record<HealthStatus, string> = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-rose-500',
    unknown: 'bg-slate-400',
  }
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[status]} ${status === 'healthy' ? 'animate-pulse' : ''}`} />
      {statusLabel(status)}
    </span>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  status,
  color,
  points,
  metricKey,
}: {
  title: string
  value: string
  description: string
  icon: typeof Activity
  status: HealthStatus
  color: string
  points: Point[]
  metricKey?: MetricKey
}) {
  const delta = metricKey ? changePercent(points, metricKey) : null
  const latest = metricKey && points.length ? points[points.length - 1][metricKey] : null
  const chartPoints = metricKey ? points.slice(-24) : []

  return (
    <section className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={19} />
        </div>
        <StatusPill status={status} />
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        {delta !== null && (
          <span className={`mb-1 inline-flex items-center gap-0.5 text-xs font-semibold ${delta > 0 ? 'text-amber-600' : delta < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {delta > 0 ? <ArrowUpRight size={14} /> : delta < 0 ? <ArrowDownRight size={14} /> : null}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
      {metricKey && chartPoints.length > 1 && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartPoints} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`metric-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <YAxis hide domain={['auto', 'auto']} />
              <Area dataKey={metricKey} type="monotone" stroke={color} strokeWidth={2} fill={`url(#metric-${metricKey})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      {metricKey && latest !== null && (
        <p className="mt-2 text-[11px] text-slate-400">Latest sampled reading</p>
      )}
    </section>
  )
}

function ResourceCard({
  title,
  value,
  detail,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  detail: string
  icon: typeof Cpu
  color: string
}) {
  const safeValue = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0))
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/70">
            <Icon size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
          </div>
        </div>
        <p className="text-lg font-semibold tabular-nums text-slate-900">{safeValue.toFixed(0)}%</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${safeValue}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function TrendPanel({
  title,
  description,
  dataKey,
  unit,
  color,
  history,
}: {
  title: string
  description: string
  dataKey: MetricKey
  unit: string
  color: string
  history: Point[]
}) {
  const [range, setRange] = useState<'15' | '60' | 'all'>('15')
  const visiblePoints = range === 'all' ? history : history.slice(-Number(range))
  const values = visiblePoints.map((point) => point[dataKey])
  const latest = values.length ? values[values.length - 1] : null
  const low = values.length ? Math.min(...values) : null
  const high = values.length ? Math.max(...values) : null

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-1">
          {([{ value: '15', label: '15 pts' }, { value: '60', label: '60 pts' }, { value: 'all', label: 'All' }] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setRange(item.value)}
              aria-pressed={range === item.value}
              className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition ${range === item.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-2">
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {latest === null ? '—' : latest}
            <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Latest sample</p>
        </div>
        <div className="flex gap-4 pb-1 text-xs text-slate-500">
          <span>Low <b className="text-slate-700">{low === null ? '—' : `${low}${unit}`}</b></span>
          <span>High <b className="text-slate-700">{high === null ? '—' : `${high}${unit}`}</b></span>
        </div>
      </div>
      <div className="mt-4 h-52">
        {visiblePoints.length < 2 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center">
            <Activity className="mb-2 text-slate-300" size={24} />
            <p className="text-sm font-medium text-slate-600">Collecting trend data</p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-slate-400">Leave this page open while the health check refreshes to build a live history.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visiblePoints} margin={{ top: 8, right: 5, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id={`trend-fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E9EEF4" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} tickLine={false} axisLine={false} width={38} />
              <Tooltip
                labelFormatter={(label) => `Time: ${label}`}
                formatter={(value) => [`${value}${unit}`, title]}
                contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 12px 30px rgba(15,23,42,.08)', fontSize: 12 }}
              />
              <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.2} fill={`url(#trend-fill-${dataKey})`} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 2 }} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default function SystemPerformancePage() {
  const queryClient = useQueryClient()
  const [history, setHistory] = useState<Point[]>([])
  const [nodeSearch, setNodeSearch] = useState('')
  const [nodeFilter, setNodeFilter] = useState<'all' | 'healthy' | 'attention'>('all')
  const [confirmRestart, setConfirmRestart] = useState(false)

  const {
    data: rawHealth,
    isLoading,
    isFetching,
    error,
    dataUpdatedAt,
    refetch,
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: POLL_MS,
    retry: 1,
  })

  useEffect(() => {
    if (error) toast.error('Unable to load system health. Check the connection and try again.')
  }, [error])

  const health = (rawHealth as any)?.data || rawHealth || {}
  const nodes: ClusterNode[] = Array.isArray(health.nodes) ? health.nodes : []
  const apiLatency = numberValue(health.apiLatency)
  const dbLatency = numberValue(health.dbLatency)
  const cpuLoad = numberValue(health.cpuLoad)
  const mpesaLatency = numberValue(health.safaricomLatency)
  const incidentRate = numberValue(health.incidentRate)
  const apiStatus = getStatus(apiLatency, 200, 500)
  const dbStatus = getStatus(dbLatency, 50, 200)
  const cpuStatus = getStatus(cpuLoad, 70, 90)
  const paymentStatus: HealthStatus = health.safaricomStatus === 'Healthy'
    ? 'healthy'
    : health.safaricomStatus
      ? 'warning'
      : 'unknown'
  const serviceStatus = overallStatus([apiStatus, dbStatus, cpuStatus, paymentStatus])
  const healthyNodes = nodes.filter((node) => node.status === 'Healthy').length
  const attentionNodes = nodes.length - healthyNodes

  useEffect(() => {
    if (!health || !dataUpdatedAt) return
    setHistory((previous) => {
      if (previous.length && previous[previous.length - 1].ts === dataUpdatedAt) return previous
      const point: Point = {
        ts: dataUpdatedAt,
        time: new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        api: apiLatency,
        db: dbLatency,
        cpu: cpuLoad,
        mpesa: mpesaLatency,
      }
      return [...previous, point].slice(-MAX_POINTS)
    })
  }, [dataUpdatedAt, apiLatency, dbLatency, cpuLoad, mpesaLatency])

  const restartMutation = useMutation({
    mutationFn: adminApi.restartCluster,
    onSuccess: () => {
      toast.success('Cluster restart sequence initiated')
      setConfirmRestart(false)
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    },
    onError: (err: unknown) => {
      toast.error(`Restart failed: ${getErrorMessage(err)}`)
      setConfirmRestart(false)
    },
  })

  const filteredNodes = useMemo(() => {
    const search = nodeSearch.trim().toLowerCase()
    return nodes.filter((node) => {
      const matchesSearch = !search || `${node.name ?? ''} ${node.region ?? ''}`.toLowerCase().includes(search)
      const matchesFilter = nodeFilter === 'all'
        || (nodeFilter === 'healthy' && node.status === 'Healthy')
        || (nodeFilter === 'attention' && node.status !== 'Healthy')
      return matchesSearch && matchesFilter
    })
  }, [nodes, nodeSearch, nodeFilter])

  const exportSnapshot = () => {
    const snapshot = {
      generatedAt: new Date().toISOString(),
      version: health.version ?? 'unknown',
      overallStatus: statusLabel(serviceStatus),
      apiLatency: health.apiLatency ?? null,
      dbLatency: health.dbLatency ?? null,
      cpuLoad: health.cpuLoad ?? null,
      incidentRate: health.incidentRate ?? null,
      safaricomStatus: health.safaricomStatus ?? 'Unknown',
      nodes,
    }
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `system-health-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Health snapshot exported')
  }

  return (
    <main className="min-h-full space-y-6 bg-slate-50/60 pb-8 pt-4 text-slate-900">
      {/* Hero / command header */}
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-28 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              SYSTEM TELEMETRY · LIVE
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Performance command center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Monitor application responsiveness, infrastructure capacity, payment connectivity and cluster availability from one operational view.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportSnapshot}
              disabled={!rawHealth}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              <Download size={15} />
              Export snapshot
            </button>
            <button
              type="button"
              onClick={() => setConfirmRestart(true)}
              disabled={restartMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Restart cluster
            </button>
          </div>
        </div>
        <div className="relative mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 md:grid-cols-4">
          <HeroFact label="Overall status" value={statusLabel(serviceStatus)} icon={ShieldCheck} />
          <HeroFact label="Cluster nodes" value={`${nodes.length}`} icon={Server} />
          <HeroFact label="Healthy nodes" value={`${healthyNodes}`} icon={CheckCircle2} />
          <HeroFact label="Auto-refresh" value="60 seconds" icon={Clock3} />
        </div>
      </header>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 shrink-0 text-rose-600" size={20} />
            <div>
              <p className="font-semibold text-rose-900">Health data could not be refreshed</p>
              <p className="mt-1 text-sm text-rose-700">The figures may be stale. Retry the health check before taking operational action.</p>
            </div>
          </div>
          <button type="button" onClick={() => refetch()} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100">Try again</button>
        </div>
      )}

      {/* Primary service metrics */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Service performance</h2>
            <p className="mt-1 text-xs text-slate-500">Current readings with locally collected trend samples.</p>
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <Clock3 size={13} />
            {dataUpdatedAt ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Waiting for first reading'}
          </p>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12"><InlineLoader message="Loading performance telemetry..." /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <MetricCard title="API response time" value={formatMetric(health.apiLatency, typeof health.apiLatency === 'number' ? ' ms' : '')} description="Application endpoint latency" icon={Globe} status={apiStatus} color="#10B981" points={history} metricKey="api" />
            <MetricCard title="Database query time" value={formatMetric(health.dbLatency, typeof health.dbLatency === 'number' ? ' ms' : '')} description="Database response latency" icon={Database} status={dbStatus} color="#0EA5E9" points={history} metricKey="db" />
            <MetricCard title="CPU load" value={formatMetric(health.cpuLoad, typeof health.cpuLoad === 'number' ? '%' : '')} description="Reported processor utilisation" icon={Cpu} status={cpuStatus} color="#8B5CF6" points={history} metricKey="cpu" />
            <MetricCard title="Incident rate" value={formatMetric(health.incidentRate, typeof health.incidentRate === 'number' ? '%' : '')} description={incidentRate === 0 ? 'No incidents reported by the health endpoint' : 'Review current incidents'} icon={ShieldCheck} status={incidentRate === 0 ? 'healthy' : incidentRate < 2 ? 'warning' : 'critical'} color="#F59E0B" points={history} />
          </div>
        )}
      </section>

      {/* Capacity and payment service */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">Infrastructure capacity</h2>
              <p className="mt-1 text-xs text-slate-500">Resource utilisation reported by the health endpoint.</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Zap size={19} /></span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <ResourceCard title="Processor" value={cpuLoad} detail="CPU utilisation" icon={Cpu} color="#10B981" />
            <ResourceCard title="Memory" value={numberValue(health.memoryCapacity?.percent)} detail={`${health.memoryCapacity?.used ?? '—'} / ${health.memoryCapacity?.total ?? '—'}`} icon={Database} color="#0EA5E9" />
            <ResourceCard title="Storage" value={numberValue(health.diskCapacity?.percent)} detail={`${health.diskCapacity?.used ?? '—'} / ${health.diskCapacity?.total ?? '—'}`} icon={Server} color="#8B5CF6" />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">Capacity values depend on what the backend health endpoint reports. Missing values are shown as zero utilisation in the visual bar and should be verified against the source.</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">M-Pesa connectivity</h2>
              <p className="mt-1 text-xs text-slate-500">Safaricom payment service health</p>
            </div>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${paymentStatus === 'healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              <Activity size={19} />
            </span>
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950">{formatMetric(health.safaricomLatency, typeof health.safaricomLatency === 'number' ? ' ms' : '')}</p>
              <p className="mt-1 text-xs text-slate-500">Reported response time</p>
            </div>
            <StatusPill status={paymentStatus} />
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Service status</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{health.safaricomStatus || 'Unknown'}</p>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-400">This reflects the backend's reported status, not a direct independent test of Safaricom services.</p>
        </div>
      </section>

      {/* Trends */}
      <section>
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-900">Performance trends</h2>
          <p className="mt-1 text-xs text-slate-500">Historical points are collected while this page is open and reset on reload.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <TrendPanel title="API latency" description="Application response time over polling intervals" dataKey="api" unit=" ms" color="#10B981" history={history} />
          <TrendPanel title="Database latency" description="Database query response time over polling intervals" dataKey="db" unit=" ms" color="#0EA5E9" history={history} />
          <TrendPanel title="CPU utilisation" description="Processor load reported by the server" dataKey="cpu" unit="%" color="#8B5CF6" history={history} />
          <TrendPanel title="M-Pesa response time" description="Payment service latency over polling intervals" dataKey="mpesa" unit=" ms" color="#F59E0B" history={history} />
        </div>
      </section>

      {/* Nodes */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white"><Server size={17} /></span>
              <div>
                <h2 className="font-semibold text-slate-900">Cluster inventory</h2>
                <p className="mt-0.5 text-xs text-slate-500">{healthyNodes} healthy · {attentionNodes} requiring attention · {nodes.length} total</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={nodeSearch} onChange={(event) => setNodeSearch(event.target.value)} placeholder="Search node or region" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 sm:w-56" />
            </label>
            <select value={nodeFilter} onChange={(event) => setNodeFilter(event.target.value as typeof nodeFilter)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <option value="all">All nodes</option>
              <option value="healthy">Healthy only</option>
              <option value="attention">Needs attention</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12"><InlineLoader message="Checking cluster nodes..." /></div>
        ) : filteredNodes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3.5 font-semibold">Node</th>
                  <th className="px-5 py-3.5 font-semibold">Region</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Reported load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((node, index) => {
                  const nodeStatus: HealthStatus = node.status === 'Healthy' ? 'healthy' : node.status ? 'warning' : 'unknown'
                  return (
                    <tr key={`${node.name ?? 'node'}-${node.region ?? index}`} className="transition hover:bg-emerald-50/30">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Server size={16} /></span>
                          <span className="text-sm font-semibold text-slate-800">{node.name || `Node ${index + 1}`}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">{node.region || '—'}</td>
                      <td className="px-5 py-4"><StatusPill status={nodeStatus} /></td>
                      <td className="px-5 py-4 text-right text-sm font-semibold tabular-nums text-slate-800">{node.load ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Server size={22} /></div>
            <p className="mt-3 font-semibold text-slate-800">{nodes.length ? 'No matching nodes' : 'No cluster nodes reported'}</p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{nodes.length ? 'Try changing the search term or filter.' : 'Nodes will appear here when the health endpoint reports them.'}</p>
          </div>
        )}
      </section>

      {/* Restart confirmation */}
      {confirmRestart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="restart-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><ShieldAlert size={22} /></div>
            <h2 id="restart-title" className="mt-4 text-lg font-semibold text-slate-950">Restart the cluster?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">This sends a restart request to the cluster and may interrupt active users or services. Proceed only if you are authorised and have confirmed an appropriate maintenance window.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmRestart(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => restartMutation.mutate()} disabled={restartMutation.isPending} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">{restartMutation.isPending ? 'Sending request…' : 'Confirm restart'}</button>
            </div>
          </div>
        </div>
      )}

      <footer className="flex flex-col gap-2 px-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5"><Clock3 size={13} /> Health endpoint polls every 60 seconds.</p>
        <p>Version {health.version || 'unknown'} · Trend history is held in this browser session.</p>
      </footer>
    </main>
  )
}

function HeroFact({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-emerald-300"><Icon size={17} /></span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}
