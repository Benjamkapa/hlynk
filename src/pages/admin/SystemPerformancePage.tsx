import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Cpu,
  Database,
  Download,
  HardDrive,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Wifi,
  X,
} from 'lucide-react'
import { getErrorMessage } from '../../lib/utils/error'
import ClickableCard from '../../components/shared/ClickableCard'
import { useEffect, useMemo, useState } from 'react'
import type { ElementType } from 'react'

type Point = {
  ts: number
  time: string
  api: number | null
  db: number | null
  cpu: number | null
  mpesa: number | null
}

type MetricKey = 'api' | 'db' | 'cpu' | 'mpesa'
type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown'
type ClusterNode = {
  name?: string
  region?: string
  status?: string
  load?: string | number
}

type HealthPayload = {
  data?: Record<string, any>
  [key: string]: any
}

const MAX_POINTS = 120

const METRICS: Record<MetricKey, { label: string; unit: string }> = {
  api: { label: 'API latency', unit: 'ms' },
  db: { label: 'Database latency', unit: 'ms' },
  cpu: { label: 'CPU utilisation', unit: '%' },
  mpesa: { label: 'M-Pesa latency', unit: 'ms' },
}

const STATUS_TEXT: Record<HealthStatus, string> = {
  healthy: 'Operational',
  warning: 'Degraded',
  critical: 'Critical',
  unknown: 'Unknown',
}

const STATUS_STYLES: Record<HealthStatus, string> = {
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
  unknown: 'border-slate-200 bg-slate-100 text-slate-500',
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseFloat(String(value).replace('%', '').replace(/ms/i, '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

function display(value: unknown, suffix = ''): string {
  if (value === null || value === undefined || value === '') return '—'
  return `${value}${suffix}`
}

function getStatus(value: number | null, warningAt: number, criticalAt: number): HealthStatus {
  if (value === null || !Number.isFinite(value)) return 'unknown'
  if (value >= criticalAt) return 'critical'
  if (value >= warningAt) return 'warning'
  return 'healthy'
}

function overallStatus(values: HealthStatus[]): HealthStatus {
  if (values.includes('critical')) return 'critical'
  if (values.includes('warning')) return 'warning'
  if (values.length && values.every((value) => value === 'healthy')) return 'healthy'
  return 'unknown'
}

function StatusPill({ status, label }: { status: HealthStatus; label?: string }) {
  const Icon =
    status === 'healthy'
      ? CheckCircle2
      : status === 'warning' || status === 'critical'
        ? AlertTriangle
        : CircleHelp

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
      <Icon size={13} />
      {label ?? STATUS_TEXT[status]}
    </span>
  )
}
function MetricCard({
  label,
  value,
  unit,
  status,
  icon: Icon,
  caption,
  points,
  metricKey,
  cardBg = 'bg-[#FFFDF8] shadow-sm',
  className = '',
}: {
  label: string;
  value: string;
  unit?: string;
  status: HealthStatus;
  icon: ElementType;
  caption: string;
  points: Point[];
  metricKey: MetricKey;
  cardBg?: string;
  className?: string;
}) {
  const spark = points.slice(-24);

  return (
    <ClickableCard
      to="/admin/system-performance"
      className={`p-5 shadow-sm transition-shadow hover:shadow-md ${cardBg} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0D4A3E]/[0.08] text-[#0D4A3E]">
            <Icon size={19} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-500">{label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{caption}</p>
          </div>
        </div>
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
            status === 'healthy'
              ? 'bg-emerald-500'
              : status === 'warning'
              ? 'bg-amber-500'
              : status === 'critical'
              ? 'bg-red-500'
              : 'bg-slate-300'
          }`}
        />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <p className="font-mono text-3xl font-semibold tracking-tight text-slate-900">
          {value}
          {unit && value !== '—' && <span className="ml-1 text-sm font-medium text-slate-400">{unit}</span>}
        </p>
        <div className="h-10 w-24 shrink-0">
          {spark.length > 1 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark}>
                <Area
                  dataKey={metricKey}
                  type="monotone"
                  stroke="#0D4A3E"
                  strokeWidth={1.8}
                  fill="#0D4A3E"
                  fillOpacity={0.08}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </ClickableCard>
  );
}

function CapacityCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string
  value: number | null
  detail: string
  icon: ElementType
}) {
  const safe = value === null ? 0 : Math.min(100, Math.max(0, value))
  const tone =
    value === null ? 'bg-slate-200' :
    safe >= 90 ? 'bg-red-500' :
    safe >= 70 ? 'bg-amber-500' : 'bg-[#0D4A3E]'

  return (
    <div className="rounded-lg bg-[#FFFDF8] p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Icon size={16} className="text-slate-400" />
          {title}
        </div>
        <span className="font-mono text-sm font-semibold text-slate-900">
          {value === null ? '—' : `${safe.toFixed(0)}%`}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${safe}%` }} />
      </div>
      <p className="mt-2 truncate text-xs text-slate-400">{detail}</p>
    </div>
  )
}

export default function SystemPerformancePage() {
  const queryClient = useQueryClient()
  const [history, setHistory] = useState<Point[]>([])
  const [metric, setMetric] = useState<MetricKey>('api')
  const [range, setRange] = useState<'15' | '60' | 'all'>('15')
  const [nodeSearch, setNodeSearch] = useState('')
  const [nodeFilter, setNodeFilter] = useState<'all' | 'healthy' | 'attention'>('all')
  const [confirmRestart, setConfirmRestart] = useState(false)

  // Deliberately no polling: data refreshes on demand and once when returning
  // to this tab. React Query shares the cached result with other consumers.
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
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  })

  const health = (rawHealth as HealthPayload | undefined)?.data || rawHealth || {}
  const nodes: ClusterNode[] = Array.isArray(health.nodes) ? health.nodes : []

  const apiLatency = toNumber(health.apiLatency)
  const dbLatency = toNumber(health.dbLatency)
  const cpuLoad = toNumber(health.cpuLoad)
  const mpesaLatency = toNumber(health.safaricomLatency)
  const incidentRate = toNumber(health.incidentRate)

  const apiStatus = getStatus(apiLatency, 200, 500)
  const dbStatus = getStatus(dbLatency, 50, 200)
  const cpuStatus = getStatus(cpuLoad, 70, 90)
  const paymentStatus: HealthStatus =
    health.safaricomStatus === 'Healthy'
      ? 'healthy'
      : health.safaricomStatus
        ? 'warning'
        : 'unknown'
  const incidentStatus =
    incidentRate === null
      ? 'unknown'
      : incidentRate === 0
        ? 'healthy'
        : incidentRate < 2
          ? 'warning'
          : 'critical'

  const serviceStatus = overallStatus([apiStatus, dbStatus, cpuStatus, paymentStatus])
  const healthyNodes = nodes.filter((node) => node.status === 'Healthy').length
  const attentionNodes = nodes.length - healthyNodes

  useEffect(() => {
    if (error) toast.error('Unable to load system health. Check the connection and try again.')
  }, [error])

  // History is captured only when a successful query produces a new reading.
  useEffect(() => {
    if (!rawHealth || !dataUpdatedAt) return

    setHistory((previous) => {
      if (previous.some((point) => point.ts === dataUpdatedAt)) return previous

      const point: Point = {
        ts: dataUpdatedAt,
        time: new Date(dataUpdatedAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        api: apiLatency,
        db: dbLatency,
        cpu: cpuLoad,
        mpesa: mpesaLatency,
      }

      return [...previous, point].slice(-MAX_POINTS)
    })
  }, [rawHealth, dataUpdatedAt, apiLatency, dbLatency, cpuLoad, mpesaLatency])

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
      const matchesSearch =
        !search || `${node.name ?? ''} ${node.region ?? ''}`.toLowerCase().includes(search)
      const matchesFilter =
        nodeFilter === 'all' ||
        (nodeFilter === 'healthy' && node.status === 'Healthy') ||
        (nodeFilter === 'attention' && node.status !== 'Healthy')
      return matchesSearch && matchesFilter
    })
  }, [nodes, nodeSearch, nodeFilter])

  const exportSnapshot = () => {
    const snapshot = {
      generatedAt: new Date().toISOString(),
      version: health.version ?? 'unknown',
      overallStatus: STATUS_TEXT[serviceStatus],
      apiLatency: health.apiLatency ?? null,
      dbLatency: health.dbLatency ?? null,
      cpuLoad: health.cpuLoad ?? null,
      incidentRate: health.incidentRate ?? null,
      safaricomStatus: health.safaricomStatus ?? 'Unknown',
      nodes,
    }
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `system-health-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Health snapshot exported')
  }

  const visible = range === 'all' ? history : history.slice(-Number(range))
  const series = visible.map((point) => point[metric]).filter((value): value is number => value !== null)
  const latest = series.length ? series[series.length - 1] : null
  const low = series.length ? Math.min(...series) : null
  const high = series.length ? Math.max(...series) : null
  const updated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null

  return (
    <main className="w-full space-y-7 pb-10 text-slate-900">
      {/* Page heading and primary actions */}
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0D4A3E]">
            <Activity size={14} />
            Operations centre
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            System performance
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Live operational visibility across application services, infrastructure and cluster nodes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={serviceStatus} label={`System ${STATUS_TEXT[serviceStatus]}`} />
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            {isFetching ? 'Refreshing' : 'Refresh'}
          </button>
          <button
            type="button"
            onClick={exportSnapshot}
            disabled={!rawHealth}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            Export
          </button>
          <button
            type="button"
            onClick={() => setConfirmRestart(true)}
            disabled={restartMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
          >
            <RefreshCw size={15} />
            Restart cluster
          </button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock3 size={14} />
          {updated ? `Last successful reading: ${updated}` : 'Waiting for the first health reading'}
        </div>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
          On-demand monitoring · No background polling
        </span>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to refresh system telemetry</p>
              <p className="mt-0.5 text-red-700">The dashboard may be displaying the last successfully retrieved readings.</p>
            </div>
          </div>
          <button type="button" onClick={() => refetch()} className="font-semibold underline underline-offset-4">
            Try again
          </button>
        </div>
      )}

      {/* Primary telemetry */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Service telemetry</h2>
          {isFetching && <span className="text-xs text-slate-400">Updating readings…</span>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-4 gap-0">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-0">
            <MetricCard
              label="API response"
              value={display(health.apiLatency)}
              unit="ms"
              status={apiStatus}
              icon={Wifi}
              caption="Application response time"
              points={history}
              metricKey="api"
              cardBg="bg-[#C8F3DC]"
            />
            <MetricCard
              label="Database"
              value={display(health.dbLatency)}
              unit="ms"
              status={dbStatus}
              icon={Database}
              caption="Database response time"
              points={history}
              metricKey="db"
              cardBg="bg-[#CBE6FF]"
            />
            <MetricCard
              label="CPU utilisation"
              value={display(health.cpuLoad)}
              unit="%"
              status={cpuStatus}
              icon={Cpu}
              caption="Processor load"
              points={history}
              metricKey="cpu"
              cardBg="bg-[#FCE8B2]"
            />
            <MetricCard
              label="M-Pesa gateway"
              value={display(health.safaricomLatency)}
              unit="ms"
              status={paymentStatus}
              icon={ShieldCheck}
              caption={health.safaricomStatus || 'Payment gateway status unknown'}
              points={history}
              metricKey="mpesa"
              cardBg="bg-[#DFD7FF]"
            />
          </div>
        )}
      </section>

      {/* Performance trend and system summary */}
      <div className="grid gap-5 xl:grid-cols-3">
        <section className="overflow-hidden rounded-xl bg-[#0D4A3E] text-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-200">
                <Activity size={14} />
                Performance history
              </div>
              <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">
                {latest === null ? '—' : latest.toFixed(1)}
                <span className="ml-2 text-sm font-medium text-emerald-100/60">{METRICS[metric].unit}</span>
              </p>
              <p className="mt-1 text-xs text-emerald-100/60">
                {low === null ? 'Refresh to begin collecting readings' : `Minimum ${low.toFixed(1)} · Maximum ${high?.toFixed(1)}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 rounded-lg bg-black/15 p-1">
              {(Object.keys(METRICS) as MetricKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMetric(key)}
                  aria-pressed={metric === key}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                    metric === key ? 'bg-white text-[#0D4A3E] shadow-sm' : 'text-emerald-100/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {METRICS[key].label.replace(' latency', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-5 pt-4 sm:px-6">
            <p className="text-xs text-emerald-100/60">Captured during successful refreshes in this session</p>
            <div className="flex gap-1 rounded-md bg-black/15 p-1">
              {(['15', '60', 'all'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRange(value)}
                  aria-pressed={range === value}
                  className={`rounded px-2.5 py-1 text-xs font-medium ${
                    range === value ? 'bg-white/15 text-white' : 'text-emerald-100/60 hover:text-white'
                  }`}
                >
                  {value === 'all' ? 'All' : `${value} pts`}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full px-2 pb-4 pt-3 sm:px-4">
            {visible.length < 2 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-emerald-100/60">
                <Activity size={24} className="opacity-60" />
                <p>Not enough history to display a trend.</p>
                <p className="text-xs">Use Refresh to capture another reading.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visible} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="performanceFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.09)" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                    tick={{ fontSize: 11, fill: 'rgba(209,250,229,0.58)' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={42}
                    tick={{ fontSize: 11, fill: 'rgba(209,250,229,0.58)' }}
                  />
                  <Tooltip
                    contentStyle={{ border: 0, borderRadius: 8, fontSize: 12, color: '#0f172a' }}
                    formatter={(value: number) => [`${value.toFixed(1)} ${METRICS[metric].unit}`, METRICS[metric].label]}
                    labelStyle={{ color: '#64748b', marginBottom: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="#6EE7B7"
                    strokeWidth={2}
                    fill="url(#performanceFill)"
                    dot={false}
                    isAnimationActive={false}
                    activeDot={{ r: 4, fill: '#0D4A3E', stroke: '#6EE7B7', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-[#FFFDF8] p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">Infrastructure capacity</h2>
              <p className="mt-1 text-xs text-slate-500">Current resource utilisation</p>
            </div>
            <Server size={19} className="text-slate-400" />
          </div>
          <div className="mt-5 space-y-3">
            <CapacityCard
              title="Processor"
              value={cpuLoad}
              detail="CPU utilisation"
              icon={Cpu}
            />
            <CapacityCard
              title="Memory"
              value={toNumber(health.memoryCapacity?.percent)}
              detail={`${health.memoryCapacity?.used ?? '—'} used of ${health.memoryCapacity?.total ?? '—'}`}
              icon={Database}
            />
            <CapacityCard
              title="Storage"
              value={toNumber(health.diskCapacity?.percent)}
              detail={`${health.diskCapacity?.used ?? '—'} used of ${health.diskCapacity?.total ?? '—'}`}
              icon={HardDrive}
            />
          </div>
        </section>
      </div>

      {/* Operational status */}
      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-xl bg-[#FFFDF8] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#0D4A3E]" />
            <h2 className="font-semibold text-slate-900">Service health</h2>
          </div>
          <div className="mt-4 flex items-center justify-between border-b border-slate-100 py-3">
            <span className="text-sm text-slate-500">Overall status</span>
            <StatusPill status={serviceStatus} />
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-slate-500">Incident rate</span>
            <span className="font-mono text-sm font-semibold text-slate-900">{display(health.incidentRate )}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 py-3">
            <span className="text-sm text-slate-500">Application version</span>
            <span className="font-mono text-xs font-semibold text-slate-700">{health.version || 'Unknown'}</span>
          </div>
        </section>

        <section className="rounded-xl bg-[#FFFDF8] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-[#0D4A3E]" />
            <h2 className="font-semibold text-slate-900">Cluster availability</h2>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 p-4">
              <p className="text-xs font-medium text-emerald-700">Healthy nodes</p>
              <p className="mt-1 font-mono text-3xl font-semibold text-emerald-800">{healthyNodes}</p>
            </div>
            <div className={`rounded-lg p-4 ${attentionNodes ? 'bg-amber-50' : 'bg-slate-50'}`}>
              <p className={`text-xs font-medium ${attentionNodes ? 'text-amber-700' : 'text-slate-500'}`}>Needs attention</p>
              <p className={`mt-1 font-mono text-3xl font-semibold ${attentionNodes ? 'text-amber-800' : 'text-slate-800'}`}>{attentionNodes}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">{nodes.length} node{nodes.length === 1 ? '' : 's'} reporting to the health endpoint</p>
        </section>

        <section className="rounded-xl bg-[#FFFDF8] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#0D4A3E]" />
            <h2 className="font-semibold text-slate-900">M-Pesa integration</h2>
          </div>
          <div className="mt-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <span className="text-sm text-slate-500">Gateway status</span>
            <StatusPill status={paymentStatus} label={health.safaricomStatus || 'Unknown'} />
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-slate-500">Response time</span>
            <span className="font-mono text-sm font-semibold text-slate-900">{display(health.safaricomLatency, ' ms')}</span>
          </div>
        </section>
      </div>

      {/* Cluster node inventory */}
      <section className="overflow-hidden rounded-xl bg-[#FFFDF8] shadow-sm">
        <div className="flex flex-col gap-4 bg-[#FCEFD9] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <Server size={18} className="text-[#0D4A3E]" />
              <h2 className="font-semibold text-slate-900">Cluster nodes</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Infrastructure members and their reported operational state
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={nodeSearch}
                onChange={(event) => setNodeSearch(event.target.value)}
                placeholder="Search nodes or regions"
                aria-label="Search nodes or regions"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0D4A3E] focus:ring-2 focus:ring-[#0D4A3E]/10 sm:w-56"
              />
            </label>
            <select
              value={nodeFilter}
              onChange={(event) => setNodeFilter(event.target.value as typeof nodeFilter)}
              aria-label="Filter cluster nodes"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#0D4A3E] focus:ring-2 focus:ring-[#0D4A3E]/10"
            >
              <option value="all">All nodes</option>
              <option value="healthy">Healthy</option>
              <option value="attention">Needs attention</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : filteredNodes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-[#DFECFF]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Node</th>
                  <th className="px-6 py-3">Region</th>
                  <th className="px-6 py-3">Operational status</th>
                  <th className="px-6 py-3 text-right">Reported load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((node, index) => {
                  const status: HealthStatus =
                    node.status === 'Healthy' ? 'healthy' : node.status ? 'warning' : 'unknown'

                  return (
                    <tr key={`${node.name ?? 'node'}-${node.region ?? index}`} className="transition hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Server size={15} />
                          </span>
                          <span className="text-sm font-semibold text-slate-800">{node.name || `Node ${index + 1}`}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{node.region || '—'}</td>
                      <td className="px-6 py-4">
                        <StatusPill status={status} label={node.status || 'Unknown'} />
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-medium text-slate-700">{node.load ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <Server size={25} className="text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              {nodes.length ? 'No matching nodes' : 'No cluster nodes reported'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {nodes.length ? 'Try adjusting your search or filter.' : 'Node information will appear here when available.'}
            </p>
          </div>
        )}
      </section>

      <footer className="flex flex-col gap-1 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Version {health.version || 'unknown'} · Dashboard history is session-only</span>
        <span>Telemetry refreshes on demand, on tab focus and after reconnection</span>
      </footer>

      {/* Restart confirmation */}
      {confirmRestart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmRestart(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="restart-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={21} />
              </span>
              <button
                type="button"
                onClick={() => setConfirmRestart(false)}
                aria-label="Close confirmation"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            <h2 id="restart-title" className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
              Restart the cluster?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This operation may interrupt active users and running services. Confirm that you are authorised and that this is an appropriate maintenance window.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRestart(false)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => restartMutation.mutate()}
                disabled={restartMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {restartMutation.isPending ? 'Initiating…' : 'Confirm restart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
