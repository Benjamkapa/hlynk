import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, LineChart, Line 
} from 'recharts'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { ADMIN_CSS } from './hl-design-system'
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
      <style>{ADMIN_CSS}</style>
      
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black text-slate-900">API Latency Velocity</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time millisecond distribution</p>
            </div>
            <div className="h-10 w-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
               <Activity size={20} />
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono' }}
                />
                <Area type="monotone" dataKey="api" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorApi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-lg border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-2xl font-black text-slate-900">System Load Metrics</h3>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">CPU vs Memory Saturation %</p>
            </div>
            <div className="h-10 w-10 rounded-md bg-slate-50 flex items-center justify-center text-slate-400">
               <Server size={20} />
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono'}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '20px' }}
                  itemStyle={{ fontFamily: 'JetBrains Mono' }}
                />
                <Line type="monotone" dataKey="load" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 6, fill: '#8B5CF6', strokeWidth: 3, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
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
