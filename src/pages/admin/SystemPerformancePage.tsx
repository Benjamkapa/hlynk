import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, LineChart, Line 
} from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { Globe, Database, Cpu, ShieldCheck, Activity, Server, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getErrorMessage } from '../../lib/utils/error'

import { useEffect } from 'react'
import { SystemHealth } from '../../lib/types/api'

export default function SystemPerformancePage() {
  const queryClient = useQueryClient()
  const { data: rawHealth, isLoading, error } = useQuery<any>({
    queryKey: ['system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 10000
  })

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
    <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">System Health</h1>
          <p className="text-slate-500 font-medium text-xl">Real-time infrastructure telemetry & global cluster status</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-widest hl-mono">Telemetry Active</span>
           </div>
           <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
              <span className="text-[11px] font-black uppercase tracking-widest hl-mono">{health?.version || 'v1.0.0'}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard title="API Response" value={health?.apiLatency || '0ms'} sub="Avg last 5m" icon={Globe} trend="up" color="blue" />
        <MetricCard title="DB Query Time" value={health?.dbLatency || '0ms'} sub="Node-01 Cluster" icon={Database} trend="down" color="emerald" />
        <MetricCard title="CPU Saturation" value={health?.cpuLoad || '0%'} sub="Global Avg" icon={Cpu} trend="up" color="amber" />
        <MetricCard title="Incident Rate" value={health?.incidentRate || '0%'} sub="Critical Zero" icon={ShieldCheck} trend="none" color="purple" />
      </div>

      {/* Infrastructure Capacity */}
      <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-sm">
         <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-md bg-slate-900 text-white flex items-center justify-center">
               <Server size={20} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900">Infrastructure Capacity</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Resource Allocation & Cluster Availability</p>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* CPU */}
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Computing Power</span>
                  <span className="text-lg font-black hl-mono text-slate-900">{health?.cpuLoad || '0%'}</span>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000" 
                    style={{ width: health?.cpuLoad || '0%' }}
                  />
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Processing load across all cluster nodes</p>
            </div>

            {/* Memory */}
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Memory (RAM)</span>
                  <div className="text-right">
                     <span className="text-lg font-black hl-mono text-slate-900">{health?.memoryCapacity?.percent || 0}%</span>
                     <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">{health?.memoryCapacity?.used || '0MB'} / {health?.memoryCapacity?.total || '0MB'}</p>
                  </div>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${health?.memoryCapacity?.percent || 0}%` }}
                  />
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Volatile memory utilization for runtime processes</p>
            </div>

            {/* Disk */}
            <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Storage</span>
                  <div className="text-right">
                     <span className="text-lg font-black hl-mono text-slate-900">{health?.diskCapacity?.percent || 0}%</span>
                     <p className="text-[10px] text-slate-400 font-bold uppercase leading-none">{health?.diskCapacity?.used || '0GB'} / {health?.diskCapacity?.total || '0GB'}</p>
                  </div>
               </div>
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${health?.diskCapacity?.percent || 0}%` }}
                  />
               </div>
               <p className="text-[10px] text-slate-400 font-medium">Remaining capacity on primary storage nodes</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black text-slate-900">API Velocity</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Platform Distribution Latency</p>
            </div>
            <div className="h-10 w-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
               <Activity size={20} />
            </div>
          </div>
          <div className="h-[300px]">
             <Gauge 
                value={parseInt(health?.apiLatency || '0')} 
                max={500} 
                label="System Latency" 
                unit="ms" 
                colorHex="#3B82F6" 
             />
          </div>
          <div className="absolute top-0 right-0 h-32 w-32 bg-blue-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
        </div>

        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black text-slate-900 text-emerald-600">Safaricom G2</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">M-Pesa Webhook & SDK Pulse</p>
            </div>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg ${health?.safaricomStatus === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
               <Globe size={20} />
            </div>
          </div>
          <div className="h-[300px]">
             <Gauge 
                value={parseInt(health?.safaricomLatency || '0')} 
                max={200} 
                label="Safaricom Response" 
                unit="ms" 
                colorHex="#10B981" 
             />
          </div>
          <div className={`absolute top-0 right-0 h-32 w-32 rounded-full blur-[60px] -mr-16 -mt-16 opacity-30 ${health?.safaricomStatus === 'Healthy' ? 'bg-emerald-100' : 'bg-amber-100'}`} />
        </div>

        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black text-slate-900">Cluster Load</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">CPU & Memory Saturation</p>
            </div>
            <div className="h-10 w-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
               <Server size={20} />
            </div>
          </div>
          <div className="h-[300px]">
             <Gauge 
                value={parseInt(health?.cpuLoad || '0')} 
                max={100} 
                label="Computing Load" 
                unit="%" 
                colorHex="#8B5CF6" 
             />
          </div>
          <div className="absolute top-0 right-0 h-32 w-32 bg-purple-50 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
        </div>
      </div>


      {/* Cluster Nodes */}
      <div className="bg-slate-900 rounded-lg p-10 text-white relative overflow-hidden">
         <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-2xl font-black">Cluster Availability</h3>
                  <p className="text-slate-400 text-sm font-medium mt-1">Real-time status of global server nodes</p>
               </div>
               <button 
                 onClick={() => restartMutation.mutate()}
                 disabled={restartMutation.isPending}
                 className="px-6 py-3 bg-white/5 border border-white/10 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
               >
                 {restartMutation.isPending ? 'Restarting...' : 'Restart Cluster'}
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {isLoading ? (
                 <div className="col-span-full py-10 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto" />
                 </div>
               ) : clusterNodes.length > 0 ? clusterNodes.map((node: any, i: number) => (
                 <div key={i} className="p-6 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-xs font-black hl-mono">{node.name}</p>
                       <div className={`h-2 w-2 rounded-full ${node.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{node.region}</p>
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-xs font-bold text-slate-500 mb-1">Load</p>
                          <p className="text-lg font-black hl-mono">{node.load}</p>
                       </div>
                       <button className="h-8 w-8 rounded-md bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                          <Activity size={14} className="text-slate-400" />
                       </button>
                    </div>
                 </div>
               )) : (
                 <p className="col-span-full text-center text-slate-500 py-10 text-xs font-black uppercase tracking-widest">No nodes found</p>
               )}
            </div>
         </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, sub, icon: Icon, trend, color }: any) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden">
      <div className={`h-14 w-14 rounded-md flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colorMap[color as keyof typeof colorMap]}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">{title}</p>
        <div className="flex items-baseline gap-3">
           <h2 className="text-3xl font-black text-slate-900 hl-mono tracking-tighter">{value}</h2>
           {trend !== 'none' && (
             <span className={`flex items-center gap-1 text-[10px] font-black hl-mono ${trend === 'up' ? 'text-blue-500' : 'text-emerald-500'}`}>
                {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} 12%
             </span>
           )}
        </div>
        <p className="text-xs text-slate-400 font-bold mt-2">{sub}</p>
      </div>
    </div>
  )
}

function Gauge({ value, max = 100, label, unit, colorHex = "#10B981" }: any) {
  const radius = 100;
  const strokeWidth = 24;
  const circumference = Math.PI * radius; // Semi-circle
  const safeValue = isNaN(value) ? 0 : Math.max(0, Math.min(value, max));
  const percent = safeValue / max;
  const strokeDashoffset = circumference - (percent * circumference);
  const rotation = percent * 180 - 90;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="relative w-[240px] h-[120px] overflow-hidden">
        <svg className="w-full h-[240px] absolute top-0 left-0" viewBox="0 0 240 240">
          <path
            d={`M 20 120 A ${radius} ${radius} 0 0 1 220 120`}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={`M 20 120 A ${radius} ${radius} 0 0 1 220 120`}
            fill="none"
            stroke={colorHex}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        
        {/* Animated Caliber (Needle) */}
        <div 
           className="absolute bottom-0 left-1/2 w-1.5 h-24 origin-bottom rounded-t-full bg-slate-800 z-10"
           style={{ 
             transform: `translateX(-50%) rotate(${rotation}deg)`, 
             transition: 'transform 1.5s cubic-bezier(0.22, 1, 0.36, 1)' 
           }}
        >
          <div className="absolute -bottom-2 -left-[5px] w-4 h-4 rounded-full bg-slate-800 border-[3px] border-white shadow-sm" />
        </div>
      </div>
      
      <div className="text-center mt-12">
        <h2 className="text-5xl font-black text-slate-900 hl-mono tracking-tighter">
           {safeValue}<span className="text-xl text-slate-400 ml-1">{unit}</span>
        </h2>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{label}</p>
      </div>
    </div>
  )
}

