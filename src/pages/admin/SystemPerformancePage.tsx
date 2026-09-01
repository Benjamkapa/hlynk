import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip
} from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Globe, Database, Cpu, ShieldCheck, Activity, Server, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getErrorMessage } from '../../lib/utils/error'
import { useEffect } from 'react'

export default function SystemPerformancePage() {
  const queryClient = useQueryClient()

  const { data: rawHealth, isLoading, error } = useQuery<any>({
    queryKey: ['system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 60000
  })

  useEffect(() => {
    if (error) toast.error('Failed to load system health')
  }, [error])

  const restartMutation = useMutation({
    mutationFn: adminApi.restartCluster,
    onSuccess: () => {
      toast.success('Global cluster restart sequence initiated')
      queryClient.invalidateQueries({ queryKey: ['system-health'] })
    },
    onError: (err: any) => toast.error(`Restart Failed: ${getErrorMessage(err)}`)
  })

  const health = rawHealth?.data || rawHealth
  const performanceData = health?.performanceData || []
  const clusterNodes = health?.nodes || []

  return (
    <div className="space-y-8 pt-4 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">System Health</h1>
          <p className="text-gray-400 text-sm mt-0.5">Real-time infrastructure telemetry &amp; global cluster status</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest hl-mono">Telemetry Active</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100">
            <span className="text-[11px] font-black uppercase tracking-widest hl-mono">{health?.version || 'v1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* KPI Grid — gap-px mosaic matching AdminDashboard */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-gray-100 rounded-[.5rem] overflow-hidden border border-gray-100">
        <MetricCell icon={Globe}       label="API Response"   value={health?.apiLatency || '0ms'}   sub="Avg last 5m"     trend="up"   />
        <MetricCell icon={Database}    label="DB Query Time"  value={health?.dbLatency || '0ms'}    sub="Node-01 Cluster" trend="down" />
        <MetricCell icon={Cpu}         label="CPU Saturation" value={health?.cpuLoad || '0%'}       sub="Global Avg"      trend="up"   />
        <MetricCell icon={ShieldCheck} label="Incident Rate"  value={health?.incidentRate || '0%'}  sub="Critical Zero"   trend="none" />
      </div>

      {/* Performance Chart + Capacity Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2 bg-white rounded-[.5rem] border border-gray-100 p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Performance Trajectory</h3>
              <p className="text-xs text-gray-400 mt-0.5">API latency &amp; throughput over time</p>
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
                <h3 className="text-sm font-medium text-slate-900">Infrastructure Capacity</h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time resource allocation</p>
              </div>
            </div>
            <div className="space-y-5">
              <CapacityBar label="Computing Power" value={health?.cpuLoad || '0%'} widthStyle={health?.cpuLoad || '0%'} color="bg-amber-500" note="Load across all cluster nodes" />
              <CapacityBar
                label="Memory (RAM)"
                value={`${health?.memoryCapacity?.percent || 0}%`}
                subValue={`${health?.memoryCapacity?.used || '0MB'} / ${health?.memoryCapacity?.total || '0MB'}`}
                widthStyle={`${health?.memoryCapacity?.percent || 0}%`}
                color="bg-blue-500"
                note="Volatile memory for runtime processes"
              />
              <CapacityBar
                label="Global Storage"
                value={`${health?.diskCapacity?.percent || 0}%`}
                subValue={`${health?.diskCapacity?.used || '0GB'} / ${health?.diskCapacity?.total || '0GB'}`}
                widthStyle={`${health?.diskCapacity?.percent || 0}%`}
                color="bg-emerald-500"
                note="Capacity on primary storage nodes"
              />
            </div>
          </div>

          {/* Live status rows */}
          <div className="bg-white rounded-[.5rem] border border-gray-100 p-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Live Intelligence
            </h4>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">API Velocity</span>
                <span className="text-xs font-medium text-gray-900 hl-mono">{health?.apiLatency || '0ms'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">Safaricom G2</span>
                <span className={`text-xs font-medium ${health?.safaricomStatus === 'Healthy' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {health?.safaricomStatus || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">Safaricom Latency</span>
                <span className="text-xs font-medium text-[#0D4A3E] hl-mono">{health?.safaricomLatency || '0ms'}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-xs text-gray-400">Incident Rate</span>
                <span className="text-xs font-medium text-gray-900 hl-mono">{health?.incidentRate || '0%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GaugeCard title="API Velocity" sub="Platform distribution latency" icon={Activity} value={parseInt(health?.apiLatency || '0')} max={500} label="System Latency" unit="ms" colorHex="#3B82F6" glowClass="bg-blue-50" />
        <GaugeCard title="Safaricom G2" sub="M-Pesa Webhook & SDK Pulse" icon={Globe} value={parseInt(health?.safaricomLatency || '0')} max={200} label="Safaricom Response" unit="ms" colorHex="#10B981" glowClass={health?.safaricomStatus === 'Healthy' ? 'bg-emerald-50' : 'bg-amber-50'} iconBg={health?.safaricomStatus === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'} />
        <GaugeCard title="Cluster Load" sub="CPU & Memory saturation" icon={Server} value={parseInt(health?.cpuLoad || '0')} max={100} label="Computing Load" unit="%" colorHex="#8B5CF6" glowClass="bg-purple-50" />
      </div>

      {/* Cluster Nodes Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Cluster Availability</h3>
            <p className="text-xs text-gray-400 mt-0.5">Real-time status of global server nodes</p>
          </div>
          <button
            onClick={() => restartMutation.mutate()}
            disabled={restartMutation.isPending}
            className="px-4 py-2 border border-gray-100 rounded-md text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:border-gray-200 transition-all disabled:opacity-40"
          >
            {restartMutation.isPending ? 'Restarting...' : 'Restart Cluster'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : clusterNodes.length > 0 ? clusterNodes.map((node: any, i: number) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                  <td className="px-10 py-5 text-xs font-black text-slate-900 hl-mono">{node.name}</td>
                  <td className="px-10 py-5 text-xs text-slate-400 font-medium uppercase tracking-widest">{node.region}</td>
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
                  <td colSpan={4} className="px-10 py-16 text-center text-slate-400 font-bold text-xs uppercase tracking-widest italic">
                    No nodes found
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

function MetricCell({ icon: Icon, label, value, sub, trend }: {
  icon: any; label: string; value: string; sub: string; trend: 'up' | 'down' | 'none'
}) {
  return (
    <div className="bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-xl sm:text-2xl font-semibold hl-mono tracking-tight text-gray-900">{value}</p>
        {trend !== 'none' && (
          <span className={`flex items-center gap-0.5 text-[10px] font-black hl-mono ${trend === 'up' ? 'text-blue-500' : 'text-emerald-500'}`}>
            {trend === 'up' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />} 12%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
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

function GaugeCard({ title, sub, icon: Icon, value, max, label, unit, colorHex, glowClass, iconBg }: any) {
  return (
    <div className="bg-white p-6 rounded-[.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-sm font-medium text-slate-900">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
        </div>
        <div className={`h-9 w-9 rounded-md flex items-center justify-center ${iconBg ? `${iconBg} text-white shadow-sm` : 'bg-slate-50 text-slate-400'}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="h-[200px] relative z-10">
        <Gauge value={value} max={max} label={label} unit={unit} colorHex={colorHex} />
      </div>
      <div className={`absolute top-0 right-0 h-32 w-32 ${glowClass} rounded-full blur-[60px] -mr-16 -mt-16 opacity-50`} />
    </div>
  )
}

function Gauge({ value, max = 100, label, unit, colorHex = '#10B981' }: {
  value: number; max?: number; label: string; unit: string; colorHex?: string
}) {
  const radius = 100
  const strokeWidth = 20
  const circumference = Math.PI * radius
  const safeValue = isNaN(value) ? 0 : Math.max(0, Math.min(value, max))
  const percent = safeValue / max
  const strokeDashoffset = circumference - percent * circumference
  const rotation = percent * 180 - 90

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-[200px] h-[100px] overflow-hidden">
        <svg className="w-full h-[200px] absolute top-0 left-0" viewBox="0 0 240 240">
          <path d={`M 20 120 A ${radius} ${radius} 0 0 1 220 120`} fill="none" stroke="#F1F5F9" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path
            d={`M 20 120 A ${radius} ${radius} 0 0 1 220 120`}
            fill="none" stroke={colorHex} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        <div
          className="absolute bottom-0 left-1/2 w-1 h-[72px] origin-bottom rounded-t-full bg-slate-700 z-10"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transition: 'transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          <div className="absolute -bottom-1.5 -left-[4px] w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-sm" />
        </div>
      </div>
      <div className="text-center mt-6">
        <p className="text-2xl font-semibold text-slate-900 hl-mono tracking-tight">
          {safeValue}<span className="text-sm text-slate-400 ml-0.5">{unit}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  )
}