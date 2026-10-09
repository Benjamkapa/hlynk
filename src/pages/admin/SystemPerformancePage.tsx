import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Globe, Database, Cpu, ShieldCheck, Activity, Server, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { getErrorMessage } from '../../lib/utils/error'
import { useEffect, useState } from 'react'
import InlineLoader from '../../components/shared/InlineLoader'

// ─── Live history ──────────────────────────────────────────────────────────────
// The health endpoint returns current values only, so every 60s poll is stored
// here to draw real trend lines. History resets when the page is reloaded.

type Point = { ts: number; time: string; api: number; db: number; cpu: number; mpesa: number }
type Key = 'api' | 'db' | 'cpu' | 'mpesa'
type Status = 'good' | 'warn' | 'bad'

const MAX_POINTS = 120
const num = (v: any) => { const n = parseFloat(String(v ?? '')); return isNaN(n) ? 0 : n }

const RANGES = [
  { id: 'all', label: 'All', points: MAX_POINTS },
  { id: '5m',  label: '5m',  points: 5 },
  { id: '15m', label: '15m', points: 15 },
  { id: '1h',  label: '1h',  points: 60 },
]

function changePct(pts: Point[], key: Key): number | null {
  if (pts.length < 2) return null
  const a = pts[0][key], b = pts[pts.length - 1][key]
  if (a === 0) return b === 0 ? 0 : null
  return ((b - a) / a) * 100
}

const STATUS_DOT: Record<Status, string> = { good: 'bg-emerald-500', warn: 'bg-amber-500', bad: 'bg-red-500' }

function statusOf(value: number, warnAt: number, badAt: number): Status {
  return value >= badAt ? 'bad' : value >= warnAt ? 'warn' : 'good'
}

export default function SystemPerformancePage() {
  const queryClient = useQueryClient()
  const [history, setHistory] = useState<Point[]>([])

  const { data: rawHealth, isLoading, error, dataUpdatedAt } = useQuery<any>({
    queryKey: ['system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 60000
  })

  useEffect(() => {
    if (error) toast.error('Failed to load system health')
  }, [error])

  const health = rawHealth?.data || rawHealth
  const performanceData = health?.performanceData || []
  const clusterNodes = health?.nodes || []

  useEffect(() => {
    if (!health || !dataUpdatedAt) return
    setHistory(prev => {
      if (prev.length && prev[prev.length - 1].ts === dataUpdatedAt) return prev
      const point: Point = {
        ts: dataUpdatedAt,
        time: new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        api: num(health.apiLatency),
        db: num(health.dbLatency),
        cpu: num(health.cpuLoad),
        mpesa: num(health.safaricomLatency),
      }
      return [...prev, point].slice(-MAX_POINTS)
    })
  }, [dataUpdatedAt, health])

  const restartMutation = useMutation({
    mutationFn: adminApi.restartCluster,
    onSuccess: () => {
      toast.success('Global cluster restart sequence initiated')
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    },
    onError: (err: any) => toast.error(`Restart Failed: ${getErrorMessage(err)}`)
  })

  const incidents = num(health?.incidentRate)

  return (
    <div className="space-y-8 pt-4 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">System Health</h1>
          <p className="text-gray-400 text-sm mt-0.5">Live server and cluster status, refreshed every minute</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold">Live</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
            <span className="text-xs font-semibold hl-mono">{health?.version || 'v1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <MetricCell icon={Globe} label="API response" value={health?.apiLatency || '0ms'} sub="Average, last 5 minutes"
          history={history} dataKey="api" color="#2EA3F2" status={statusOf(num(health?.apiLatency), 200, 500)} />
        <MetricCell icon={Database} label="Database query time" value={health?.dbLatency || '0ms'} sub="Node-01 cluster"
          history={history} dataKey="db" color="#10B981" status={statusOf(num(health?.dbLatency), 50, 200)} />
        <MetricCell icon={Cpu} label="CPU load" value={health?.cpuLoad || '0%'} sub="Average across all nodes"
          history={history} dataKey="cpu" color="#8B5CF6" status={statusOf(num(health?.cpuLoad), 70, 90)} />
        <MetricCell icon={ShieldCheck} label="Incident rate" value={health?.incidentRate || '0%'}
          sub={incidents === 0 ? 'No critical incidents' : 'Needs attention'}
          status={incidents === 0 ? 'good' : incidents < 2 ? 'warn' : 'bad'} />
      </div>

      {/* Performance Chart + Capacity Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 bg-white rounded-[.5rem] border border-gray-100 p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Performance trajectory</h3>
              <p className="text-xs text-gray-400 mt-0.5">API latency and throughput over time</p>
            </div>
            <div className="h-8 w-8 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
              <Activity size={16} />
            </div>
          </div>
          <div className="h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10B981" stopOpacity={0.06} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono' }} dx={-10} />
                <Tooltip
                  cursor={{ stroke: '#F1F5F9', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 800, color: '#0F172A', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={1} fillOpacity={1} fill="url(#perfGradient)" dot={false} activeDot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute top-0 right-0 h-64 w-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50" />
        </div>

        <div className="space-y-6">
          {/* Capacity bars */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-md bg-slate-900 text-white flex items-center justify-center">
                <Server size={15} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900">Infrastructure capacity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Current resource usage</p>
              </div>
            </div>
            <div className="space-y-5">
              <CapacityBar label="Processing power" value={health?.cpuLoad || '0%'} widthStyle={health?.cpuLoad || '0%'} color="bg-amber-500" note="Load across all cluster nodes" />
              <CapacityBar
                label="Memory (RAM)"
                value={`${health?.memoryCapacity?.percent || 0}%`}
                subValue={`${health?.memoryCapacity?.used || '0MB'} / ${health?.memoryCapacity?.total || '0MB'}`}
                widthStyle={`${health?.memoryCapacity?.percent || 0}%`}
                color="bg-blue-500"
                note="Memory used by running processes"
              />
              <CapacityBar
                label="Storage"
                value={`${health?.diskCapacity?.percent || 0}%`}
                subValue={`${health?.diskCapacity?.used || '0GB'} / ${health?.diskCapacity?.total || '0GB'}`}
                widthStyle={`${health?.diskCapacity?.percent || 0}%`}
                color="bg-emerald-500"
                note="Space used on primary storage nodes"
              />
            </div>
          </div>

          {/* Live status rows */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Live status</h4>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">API response</span>
                <span className="text-xs font-medium text-gray-900 hl-mono">{health?.apiLatency || '0ms'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">Safaricom M-Pesa</span>
                <span className={`text-xs font-medium ${health?.safaricomStatus === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {health?.safaricomStatus || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">Safaricom response time</span>
                <span className="text-xs font-medium text-[#0D4A3E] hl-mono">{health?.safaricomLatency || '0ms'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">Incident rate</span>
                <span className="text-xs font-medium text-gray-900 hl-mono">{health?.incidentRate || '0%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend graphs (replace the old gauges) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <TrendCard title="API response time" sub="How fast the platform answers requests" icon={Activity}
          history={history} dataKey="api" unit="ms" color="#2EA3F2" />
        <TrendCard title="Safaricom M-Pesa" sub="Payment confirmation response time" icon={Globe}
          history={history} dataKey="mpesa" unit="ms" color="#10B981"
          iconBg={health?.safaricomStatus === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'} />
        <TrendCard title="Cluster load" sub="Processor usage across nodes" icon={Server}
          history={history} dataKey="cpu" unit="%" color="#8B5CF6" />
      </div>

      {/* Cluster Nodes Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Cluster availability</h3>
            <p className="text-xs text-gray-400 mt-0.5">Current status of each server node</p>
          </div>
          <button
            onClick={() => restartMutation.mutate()}
            disabled={restartMutation.isPending}
            className="px-4 py-2 border border-gray-100 rounded-md text-xs font-semibold text-gray-500 hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-40"
          >
            {restartMutation.isPending ? 'Restarting...' : 'Restart cluster'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-xs font-medium text-slate-400">Node</th>
                <th className="px-10 py-5 text-xs font-medium text-slate-400">Region</th>
                <th className="px-10 py-5 text-xs font-medium text-slate-400">Status</th>
                <th className="px-10 py-5 text-xs font-medium text-slate-400 text-right">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <InlineLoader message="Checking cluster nodes..." />
                  </td>
                </tr>
              ) : clusterNodes.length > 0 ? clusterNodes.map((node: any, i: number) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-all">
                  <td className="px-10 py-5 text-xs font-semibold text-slate-900 hl-mono">{node.name}</td>
                  <td className="px-10 py-5 text-xs text-slate-400 font-medium">{node.region}</td>
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${node.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className={`text-xs font-medium ${node.status === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>{node.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5 text-right text-xs font-semibold text-slate-900 hl-mono">{node.load}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-10 py-16 text-center text-slate-400 text-sm">
                    No nodes reported yet. They appear here once the cluster sends its first status update.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Change({ pct }: { pct: number | null }) {
  // For latency and load, a rise is bad and a fall is good.
  if (pct === null) return <span className="text-[11px] text-gray-300">collecting data</span>
  if (Math.abs(pct) < 0.5) {
    return <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gray-400"><Minus size={11} /> steady</span>
  }
  const up = pct > 0
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-semibold hl-mono ${up ? 'text-amber-600' : 'text-emerald-600'}`}>
      {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} {Math.abs(pct).toFixed(0)}%
    </span>
  )
}

function MetricCell({ icon: Icon, label, value, sub, status, history, dataKey, color }: {
  icon: any; label: string; value: string; sub: string; status: Status
  history?: Point[]; dataKey?: Key; color?: string
}) {
  const hasSpark = history && dataKey && history.length > 1
  return (
    <div className="bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{label}</p>
        <span className={`ml-auto h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]}`} title={status === 'good' ? 'Healthy' : status === 'warn' ? 'Watch' : 'Critical'} />
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-xl sm:text-2xl font-semibold hl-mono tracking-tight text-gray-900">{value}</p>
        {history && dataKey && <Change pct={changePct(history, dataKey)} />}
      </div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
      {history && dataKey && (
        <div className="h-9 mt-3 -mx-1">
          {hasSpark && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={['auto', 'auto']} />
                <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.25} fill={`url(#spark-${dataKey})`} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}

function CapacityBar({ label, value, subValue, widthStyle, color, note }: {
  label: string; value: string; subValue?: string; widthStyle: string; color: string; note: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <div className="text-right">
          <span className="text-xs font-semibold text-gray-900 hl-mono">{value}</span>
          {subValue && <p className="text-[10px] text-slate-400 hl-mono leading-none">{subValue}</p>}
        </div>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-1000 rounded-full`} style={{ width: widthStyle }} />
      </div>
      <p className="text-[10px] text-slate-400">{note}</p>
    </div>
  )
}

function TrendCard({ title, sub, icon: Icon, history, dataKey, unit, color, iconBg }: {
  title: string; sub: string; icon: any; history: Point[]; dataKey: Key
  unit: string; color: string; iconBg?: string
}) {
  const [range, setRange] = useState('all')
  const size = RANGES.find(r => r.id === range)?.points ?? MAX_POINTS
  const pts = history.slice(-size)
  const latest = pts.length ? pts[pts.length - 1][dataKey] : 0
  const values = pts.map(p => p[dataKey])
  const gradId = `trend-${dataKey}`

  return (
    <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`h-9 w-9 shrink-0 rounded-md flex items-center justify-center ${iconBg ? `${iconBg} text-white` : 'bg-slate-50 text-slate-400'}`}>
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-slate-900 truncate">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {RANGES.map(r => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              aria-pressed={range === r.id}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${range === r.id ? 'text-white' : 'text-gray-400 hover:text-gray-700'}`}
              style={range === r.id ? { backgroundColor: color } : undefined}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <p className="text-2xl font-semibold text-slate-900 hl-mono tracking-tight">
          {latest}<span className="text-sm text-slate-400 ml-0.5">{unit}</span>
        </p>
        <Change pct={changePct(pts, dataKey)} />
      </div>
      <p className="text-xs text-slate-400 mt-0.5">
        {values.length > 1 ? `Low ${Math.min(...values)}${unit} · High ${Math.max(...values)}${unit}` : 'Waiting for more readings'}
      </p>

      <div className="h-[220px] mt-4">
        {pts.length < 2 ? (
          <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 px-6">
            The graph fills in as new readings arrive, one per minute. Keep this page open to build the trend.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" debounce={100}>
            <AreaChart data={pts} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 4" />
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
                labelFormatter={(l) => `At ${l}`}
                formatter={(v: any) => [`${v}${unit}`, title]}
                contentStyle={{ borderRadius: 10, border: '1px solid #f1f5f9', boxShadow: '0 12px 28px -10px rgba(0,0,0,0.12)', padding: '8px 12px', fontSize: 12 }}
              />
              <Area
                type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.75}
                fill={`url(#${gradId})`} dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

