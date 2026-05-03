import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { toast } from 'sonner'
import { MessageSquare, Search, Filter, Clock, CheckCircle2, AlertCircle, ArrowRight, LifeBuoy, Users, Zap, User, TrendingUp } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useState, useEffect } from 'react'
import { AdminStats } from '../../lib/types/api'

export default function SupportPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const { data: rawStats, isLoading, error } = useQuery<any>({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  const resolveMutation = useMutation({
    mutationFn: adminApi.resolveAllTickets,
    onSuccess: () => {
      toast.success('All open tickets have been flagged as resolved')
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
    onError: () => toast.error('Failed to batch resolve tickets')
  })

  useEffect(() => {
    if (error) toast.error('Failed to load support data')
  }, [error])

  const stats: AdminStats = rawStats?.data || rawStats
  const allTickets = stats?.recentTickets || []
  const filteredTickets = allTickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    (t.businessName || '').toLowerCase().includes(search.toLowerCase())
  )

  const ticketData = stats?.trends?.ticketTrend || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Desk</h1>
          <p className="text-gray-500 font-medium">Manage vendor inquiries and platform incidents</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => resolveMutation.mutate()}
            disabled={resolveMutation.isPending}
            className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Zap size={16} />
            {resolveMutation.isPending ? 'Resolving...' : 'Auto-Resolve All'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SupportCard title="Open Tickets" value={stats?.openTicketsCount || '0'} sub="Requires attention" icon={AlertCircle} variant="red" />
        <StatCard title="Avg. Response" value={stats?.avgResponseTime || '12m'} sub="Real-time avg" icon={Clock} variant="emerald" />
        <StatCard title="Resolved" value={stats?.resolvedTicketsCount || '0'} sub="Total success" icon={CheckCircle2} variant="blue" />
        <StatCard title="Satisfaction" value={stats?.customerSatisfaction || '4.8/5'} sub="Vendor rating" icon={User} variant="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-black text-gray-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-500" />
                Resolution Pulse
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Ticket volume trend (Last 7 Days)</p>
            </div>
          </div>
          <div className="h-[300px] w-full p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketData}>
                <defs>
                  <linearGradient id="supportColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  itemStyle={{fontSize: '11px', fontWeight: 900, textTransform: 'uppercase'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#supportColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0D4A3E] rounded-lg p-8 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="relative z-10">
              <LifeBuoy size={40} className="text-emerald-400 mb-6 opacity-50" />
              <h3 className="text-2xl font-black mb-2 leading-tight">Emergency <br/> DevOps Bridge</h3>
              <p className="text-emerald-100/60 text-xs font-medium leading-relaxed">Direct line for critical platform infrastructure issues only.</p>
           </div>
           
           <div className="relative z-10 mt-8 flex flex-col gap-3">
             <a 
               href="https://wa.me/254700000000"
               target="_blank"
               className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
             >
               <MessageSquare size={16} />
               WhatsApp DevOps
             </a>
             <a 
               href="tel:+254700000000"
               className="w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
             >
               <Clock size={16} />
               Call DevOps
             </a>
           </div>
           <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-emerald-400/10 rounded-full blur-3xl" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tickets by ID, user, or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm" 
            />
          </div>
          <button className="bg-gray-50 text-gray-500 h-12 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">User / Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Priority</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : filteredTickets.length > 0 ? filteredTickets.map((t: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group cursor-pointer">
                  <td className="px-8 py-5 text-sm font-black text-gray-900 hl-mono">{t.id.slice(-8).toUpperCase()}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-gray-800 text-sm">{t.subject}</p>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-gray-500">{t.businessName || t.user}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
                      t.priority === 'High' ? 'text-red-600 bg-red-50' :
                      t.priority === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      t.status === 'Open' ? 'bg-red-100 text-red-700' :
                      t.status === 'In-Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right text-xs font-bold text-gray-400 hl-mono">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, variant }: any) {
  const variants = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-all">
      <div className={`h-12 w-12 rounded-md flex items-center justify-center shrink-0 ${variants[variant as keyof typeof variants]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{title}</p>
        <h3 className="text-xl font-black text-gray-900 hl-mono">{value}</h3>
        <p className="text-[10px] text-gray-500 font-bold">{sub}</p>
      </div>
    </div>
  )
}

function SupportCard({ title, value, sub, icon: Icon, variant }: any) {
  return <StatCard title={title} value={value} sub={sub} icon={Icon} variant={variant} />
}
