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
import { Download, RefreshCw, Search } from 'lucide-react'
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
const POLL_MS = 5_00

const METRICS: Record<MetricKey, { label: string; unit: string }> = {
  api: { label: 'API', unit: ' ms' },
  db: { label: 'Database', unit: ' ms' },
  cpu: { label: 'CPU', unit: '%' },
  mpesa: { label: 'M-Pesa', unit: ' ms' },
}

const numberValue = (value: unknown): number => {
  const parsed = Number.parseFloat(String(value ?? '').replace('%', '').replace('ms', '').trim())
  return Number.isFinite(parsed) ? parsed : 0
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
  if (values.every((v) => v === 'healthy')) return 'healthy'
  return 'unknown'
}

const STATUS_TEXT: Record<HealthStatus, string> = {
  healthy: 'Operational',
  warning: 'Degraded',
  critical: 'Critical',
  unknown: 'Unknown',
}

const DOT: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
  unknown: 'bg-slate-300',
}

const TEXT: Record<HealthStatus, string> = {
  healthy: 'text-emerald-700',
  warning: 'text-amber-700',
  critical: 'text-red-600',
  unknown: 'text-slate-500',
}

function Dot({ status }: { status: HealthStatus }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${DOT[status]}`} />
}

function Reading({
  label,
  value,
  unit,
  status,
  points,
  metricKey,
}: {
  label: string
  value: string
  unit?: string
  status: HealthStatus
  points: Point[]
  metricKey?: MetricKey
}) {
  const spark = metricKey ? points.slice(-24) : []
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <Dot status={status} />
      </div>
      <p className="mt-2 font-serif text-3xl tabular-nums tracking-tight text-slate-900">
        {value}
        {unit && value !== '—' ? (
          <span className="ml-1 font-sans text-sm text-slate-400">{unit.trim()}</span>
        ) : null}
      </p>
      <div className="mt-3 h-8">
        {metricKey && spark.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <YAxis hide domain={['auto', 'auto']} />
              <Area
                dataKey={metricKey}
                type="monotone"
                stroke="#0D4A3E"
                strokeWidth={1.5}
                fill="none"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function Bar({ label, percent, detail }: { label: string; percent: number; detail: string }) {
  const safe = Math.min(100, Math.max(0, Number.isFinite(percent) ? percent : 0))
  const tone = safe >= 90 ? 'bg-red-500' : safe >= 70 ? 'bg-amber-500' : 'bg-[#0D4A3E]'
  return (
    <div className="py-4">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-slate-700">{label}</p>
        <p className="text-sm font-medium tabular-nums text-slate-900">{safe.toFixed(0)}%</p>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-700 ${tone}`} style={{ width: `${safe}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-slate-400">{detail}</p>
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

    // Poll the existing health endpoint every 1 seconds.
    // If a request is still running, wait for it instead of starting another.
    refetchInterval: (query) =>
      query.state.fetchStatus === 'fetching' ? false : POLL_MS,

    // Do not keep polling while the dashboard is in a background tab.
    refetchIntervalInBackground: false,

    // Returning to the tab does not trigger an extra focus-based request.
    refetchOnWindowFocus: false,

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
  const paymentStatus: HealthStatus =
    health.safaricomStatus === 'Healthy' ? 'healthy' : health.safaricomStatus ? 'warning' : 'unknown'
  const incidentStatus: HealthStatus = incidentRate === 0 ? 'healthy' : incidentRate < 2 ? 'warning' : 'critical'
  const serviceStatus = overallStatus([apiStatus, dbStatus, cpuStatus, paymentStatus])
  const healthyNodes = nodes.filter((n) => n.status === 'Healthy').length
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
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `system-health-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Health snapshot exported')
  }

  // Chart data
  const visible = range === 'all' ? history : history.slice(-Number(range))
  const series = visible.map((p) => p[metric])
  const latest = series.length ? series[series.length - 1] : null
  const low = series.length ? Math.min(...series) : null
  const high = series.length ? Math.max(...series) : null
  const unit = METRICS[metric].unit

  const asMs = (v: unknown) => (typeof v === 'number' ? v : v ? numberValue(v) : null)
  const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))

  const updated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 pt-2 text-slate-900">
      {/* Header */}
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {updated ? `Updated ${updated}` : 'Waiting for first reading'}
          </p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight">System performance</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`mr-2 flex items-center gap-2 text-sm ${TEXT[serviceStatus]}`}>
            <Dot status={serviceStatus} />
            {STATUS_TEXT[serviceStatus]}
          </span>
          <button
            type="button"
            onClick={exportSnapshot}
            disabled={!rawHealth}
            title="Export snapshot"
            className="inline-flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={13} />
            Export
          </button>
          <button
            type="button"
            onClick={() => setConfirmRestart(true)}
            disabled={restartMutation.isPending}
            className="rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Restart cluster
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <span>Health data couldn’t be refreshed. Figures may be out of date.</span>
          <button type="button" onClick={() => refetch()} className="font-medium underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      {/* Readings */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        {isLoading ? (
          <div className="p-12">
            <InlineLoader message="Loading telemetry..." />
          </div>
        ) : (
          <div className="grid grid-cols-2 divide-slate-200 max-xl:divide-y xl:grid-cols-4 xl:divide-x [&>*:nth-child(odd)]:max-xl:border-r [&>*:nth-child(odd)]:max-xl:border-slate-200">
            <Reading
              label="API response"
              value={show(health.apiLatency)}
              unit=" ms"
              status={apiStatus}
              points={history}
              metricKey="api"
            />
            <Reading
              label="Database"
              value={show(health.dbLatency)}
              unit=" ms"
              status={dbStatus}
              points={history}
              metricKey="db"
            />
            <Reading
              label="CPU load"
              value={show(health.cpuLoad)}
              unit="%"
              status={cpuStatus}
              points={history}
              metricKey="cpu"
            />
            <Reading
              label="Incident rate"
              value={show(health.incidentRate)}
              unit="%"
              status={incidentStatus}
              points={history}
            />
          </div>
        )}
      </section>

      {/* Trend + capacity */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        {/* Trend */}
        <section className="bg-[#0D4A3E] p-6 text-white sm:p-8 rounded-md xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex gap-5 text-sm">
                {(Object.keys(METRICS) as MetricKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setMetric(key)}
                    className={`border-b pb-1 transition-colors ${
                      metric === key
                        ? 'border-emerald-300 text-white'
                        : 'border-transparent text-emerald-100/50 hover:text-emerald-100'
                    }`}
                  >
                    {METRICS[key].label}
                  </button>
                ))}
              </div>
              <p className="mt-6 font-serif text-4xl tabular-nums tracking-tight">
                {latest === null ? '—' : latest}
                <span className="ml-1 font-sans text-base text-emerald-100/60">{unit.trim()}</span>
              </p>
              <p className="mt-1 text-xs text-emerald-100/60">
                {low === null ? '' : `Low ${low}${unit}  ·  High ${high}${unit}`}
              </p>
            </div>

            <div className="flex gap-4 text-xs">
              {(
                [
                  ['15', '15'],
                  ['60', '60'],
                  ['all', 'All'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setRange(value)}
                  aria-pressed={range === value}
                  className={`transition-colors ${
                    range === value ? 'text-white underline underline-offset-4' : 'text-emerald-100/50 hover:text-emerald-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 h-64 w-full">
            {visible.length < 2 ? (
              <div className="flex h-full items-center justify-center text-sm text-emerald-100/60">
                Collecting data — keep this page open.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visible} margin={{ top: 8, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6EE7B7" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6EE7B7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                    tick={{ fontSize: 11, fill: 'rgba(209,250,229,0.55)' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tick={{ fontSize: 11, fill: 'rgba(209,250,229,0.55)' }}
                  />
                  <Tooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }}
                    content={({ active, payload, label }: any) =>
                      active && payload?.length ? (
                        <div className="rounded bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="text-slate-500">{label}</p>
                          <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
                            {payload[0].value}
                            {unit}
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke="#6EE7B7"
                    strokeWidth={1.75}
                    fill="url(#trendFill)"
                    dot={false}
                    isAnimationActive={false}
                    activeDot={{ r: 4, fill: '#0D4A3E', stroke: '#6EE7B7', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Capacity + payments */}
        <div className="space-y-8">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold">Capacity</h2>
            </div>
            <div className="divide-y divide-slate-100 px-6 grid grid-cols-3">
              <Bar label="Processor" percent={cpuLoad} detail="CPU utilisation" />
              <Bar
                label="Memory"
                percent={numberValue(health.memoryCapacity?.percent)}
                detail={`${health.memoryCapacity?.used ?? '—'} of ${health.memoryCapacity?.total ?? '—'}`}
              />
              <Bar
                label="Storage"
                percent={numberValue(health.diskCapacity?.percent)}
                detail={`${health.diskCapacity?.used ?? '—'} of ${health.diskCapacity?.total ?? '—'}`}
              />
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold">M-Pesa</h2>
            </div>
            <dl className="divide-y divide-slate-100 px-6">
              <div className="flex items-center justify-between py-3.5">
                <dt className="text-sm text-slate-500">Status</dt>
                <dd className={`flex items-center gap-2 text-sm font-medium ${TEXT[paymentStatus]}`}>
                  <Dot status={paymentStatus} />
                  {health.safaricomStatus || 'Unknown'}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <dt className="text-sm text-slate-500">Response time</dt>
                <dd className="text-sm font-medium tabular-nums text-slate-900">
                  {asMs(health.safaricomLatency) === null ? '—' : `${health.safaricomLatency} ms`}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>

      {/* Nodes */}
      <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Cluster nodes</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {healthyNodes} healthy
              {attentionNodes > 0 ? ` · ${attentionNodes} need attention` : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <label className="relative block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                placeholder="Search"
                className="w-40 rounded border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-[#0D4A3E] sm:w-52"
              />
            </label>
            <select
              value={nodeFilter}
              onChange={(e) => setNodeFilter(e.target.value as typeof nodeFilter)}
              className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-[#0D4A3E]"
            >
              <option value="all">All</option>
              <option value="healthy">Healthy</option>
              <option value="attention">Needs attention</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12">
            <InlineLoader message="Checking nodes..." />
          </div>
        ) : filteredNodes.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="px-6 py-3 font-medium">Node</th>
                  <th className="px-6 py-3 font-medium">Region</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Load</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNodes.map((node, index) => {
                  const s: HealthStatus = node.status === 'Healthy' ? 'healthy' : node.status ? 'warning' : 'unknown'
                  return (
                    <tr key={`${node.name ?? 'node'}-${node.region ?? index}`} className="hover:bg-slate-50">
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-900">
                        {node.name || `Node ${index + 1}`}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-slate-500">{node.region || '—'}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-2 text-sm ${TEXT[s]}`}>
                          <Dot status={s} />
                          {node.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm tabular-nums text-slate-900">
                        {node.load ?? '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-6 py-14 text-center text-sm text-slate-400">
            {nodes.length ? 'No nodes match your search.' : 'No cluster nodes reported.'}
          </p>
        )}
      </section>

      <footer className="text-xs text-slate-400">
        Version {health.version || 'unknown'} · refreshes every 5 seconds · trend history clears on reload
      </footer>

      {/* Restart confirmation */}
      {confirmRestart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="restart-title"
            className="w-full max-w-sm rounded-md bg-white p-6 shadow-2xl"
          >
            <h2 id="restart-title" className="font-serif text-xl text-slate-900">
              Restart the cluster?
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This may interrupt active users. Only continue if you’re authorised and it’s a safe time.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmRestart(false)}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => restartMutation.mutate()}
                disabled={restartMutation.isPending}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {restartMutation.isPending ? 'Sending…' : 'Restart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}