import { useState } from 'react'
import { Plus, Search, Eye, ShieldAlert, UserCheck, Filter, TrendingUp, Bell, Users, Landmark, Zap, LayoutGrid } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export default function ProvidersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [planName, setPlanName] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  })

  const { data: tenantsRes, isLoading } = useQuery<any>({
    queryKey: ['admin-tenants', search, status, planName, page],
    queryFn: () => adminApi.getTenants({ search, status, planName, page, limit: 10 }),
    placeholderData: keepPreviousData
  })

  const stats = statsData?.data || statsData;
  const providers = tenantsRes?.data?.tenants || []
  const pagination = tenantsRes?.data || { total: 0, pages: 1 }
  const weeklyGrowth = stats?.trends?.weeklyGrowth || []

  const handleFilterChange = (setter: any, val: string) => {
    setter(val)
    setPage(1)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Oversight</h1>
          <p className="text-gray-500 font-medium">Platform growth trajectory and vendor account management</p>
        </div>
        <div className="flex gap-4">
           <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 animate-pulse">
              <Bell size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Live Registration Stream</span>
           </div>
           <button 
             onClick={() => setIsAddModalOpen(true)} 
             className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 shadow-xl shadow-emerald-950/20"
           >
             <Plus size={18} /> Add Business
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
         <div className="xl:col-span-3 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <div>
                  <h3 className="text-xl font-black text-gray-900">New Users Trajectory</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Global platform registration flow (8 Weeks)</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp size={20} />
               </div>
            </div>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyGrowth}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700, fontFamily: 'JetBrains Mono'}} dy={15} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94A3B8', fontWeight: 700, fontFamily: 'JetBrains Mono'}} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                       itemStyle={{ fontWeight: 800, color: '#0D4A3E', fontFamily: 'JetBrains Mono' }}
                     />
                     <Line 
                       type="monotone" 
                       dataKey="value" 
                       stroke="#0D4A3E" 
                       strokeWidth={4} 
                       dot={{ r: 4, fill: '#0D4A3E', strokeWidth: 2, stroke: '#fff' }}
                       activeDot={{ r: 6, strokeWidth: 0 }}
                     />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>
         
         <div className="space-y-6">
            <StatsCard title="Total Businesses" value={stats?.overview?.totalProviders || 0} sub="Platform Tenants" icon={Landmark} color="emerald" />
            <StatsCard title="Active Today" value={stats?.overview?.activeToday || 0} sub="On-Cloud Now" icon={Users} color="blue" />
            <div className="bg-[#0D4A3E] p-6 rounded-2xl text-white relative overflow-hidden">
               <div className="relative z-10">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">New Registration</p>
                  <h4 className="text-sm font-black mb-4">Awaiting Verification</h4>
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 mb-4 backdrop-blur-md">
                     <p className="text-xs font-black">{stats?.recentRegistrations?.[0]?.name || 'No new entries'}</p>
                     <p className="text-[9px] text-emerald-300 font-bold uppercase mt-1 hl-mono">{stats?.recentRegistrations?.[0]?.plan || 'LITE'} Plan</p>
                  </div>
                  <button className="w-full py-3 bg-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Review Application</button>
               </div>
               <Zap size={100} className="absolute -right-8 -bottom-8 opacity-5 -rotate-12" />
            </div>
         </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6 bg-white">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-[#0D4A3E] text-white flex items-center justify-center shadow-lg">
                <LayoutGrid size={20} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900">Provider Registry</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Manage Tenant Lifecycle</p>
             </div>
          </div>
          <div className="flex flex-wrap gap-4 flex-1 justify-end">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, slug or phone..." 
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold" 
              />
            </div>
            <select 
              value={status} 
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px] transition-all"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Suspended</option>
            </select>
            <select 
              value={planName} 
              onChange={(e) => handleFilterChange(setPlanName, e.target.value)}
              className="bg-slate-50 border-none rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[140px] transition-all"
            >
              <option value="">All Plans</option>
              <option value="LITE">Lite</option>
              <option value="PLUS">Plus</option>
              <option value="MAX">Max</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Services</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Users</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : providers.length > 0 ? providers.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {p.businessName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{p.businessName}</p>
                        <p className="text-[10px] text-gray-400 font-bold hl-mono">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{p.planName || 'TRIAL'}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black hl-mono text-gray-500">
                      {p.servicesCount || 0}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-gray-900 text-sm hl-mono">{p.usersCount || 0}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.isActive === 1 ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setSelectedProvider(p)} className="p-2 hover:bg-emerald-50 rounded-md transition-all group-hover:scale-110">
                      <Eye size={18} className="text-gray-400 group-hover:text-emerald-600" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No businesses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          page={page} 
          pages={pagination.pages} 
          total={pagination.total} 
          onPageChange={setPage}
          label="Provider"
        />
      </div>

      <SlideOver isOpen={!!selectedProvider} onClose={() => setSelectedProvider(null)} title="Business Details">
         {selectedProvider && (
           <ProviderDetailsPanel provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
         )}
      </SlideOver>

      <SlideOver isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Business">
         <AddBusinessForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>
    </div>
  )
}

function ProviderDetailsPanel({ provider, onClose }: { provider: any, onClose: () => void }) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ businessName: provider.businessName, slug: provider.slug || '' })

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteTenant(provider.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      toast.success('Account permanently deleted')
      onClose()
    },
    onError: () => toast.error('Failed to delete account')
  })

  const toggleStatusMutation = useMutation({
    mutationFn: () => provider.isActive ? adminApi.suspendTenant(provider.id) : adminApi.activateTenant(provider.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      toast.success(provider.isActive ? 'Provider Suspended' : 'Provider Activated')
      onClose()
    },
    onError: () => toast.error('Failed to update status')
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateTenant(provider.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      toast.success('Business details updated')
      setIsEditing(false)
      onClose()
    },
    onError: () => toast.error('Failed to update business details')
  })

  if (isEditing) {
    return (
      <div className="space-y-6">
        <InputGroup label="Business Name" value={form.businessName} onChange={(v: string) => setForm({ ...form, businessName: v })} />
        <InputGroup label="URL Slug" value={form.slug} onChange={(v: string) => setForm({ ...form, slug: v })} mono />
        <div className="flex gap-4 mt-6">
          <button onClick={() => setIsEditing(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-md font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancel</button>
          <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="flex-1 py-4 bg-[#0D4A3E] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl">Save</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6 p-8 bg-gray-50 rounded-xl border border-gray-100 relative">
        <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Edit</button>
        <div className="w-16 h-16 rounded-xl bg-[#0D4A3E] text-white flex items-center justify-center text-2xl font-black shadow-lg">
          {provider.businessName?.charAt(0) || '?'}
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">{provider.businessName}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Joined <span className="hl-mono">{new Date(provider.createdAt).toLocaleDateString()}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Users</p>
          <p className="text-lg font-black text-[#0D4A3E] hl-mono">{provider._count?.users || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Services</p>
          <p className="text-lg font-black text-gray-900 hl-mono">{provider._count?.services || 0}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Management Actions</h4>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => toggleStatusMutation.mutate()} disabled={toggleStatusMutation.isPending} className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all">
            <ShieldAlert size={18} /> {provider.isActive ? 'Suspend' : 'Activate'}
          </button>
          <button className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-[#0D4A3E] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-lg opacity-50 cursor-not-allowed">
            <UserCheck size={18} /> Verify
          </button>
        </div>
        <button onClick={() => { if(window.confirm('Are you sure you want to permanently delete this business and all its data?')) deleteMutation.mutate(); }} disabled={deleteMutation.isPending} className="w-full py-4 text-gray-300 hover:text-red-600 text-[10px] font-black uppercase tracking-widest transition-all">
          {deleteMutation.isPending ? 'Deleting...' : 'Delete Account Permanently'}
        </button>
      </div>
    </div>
  )
}

function AddBusinessForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ businessName: '', ownerName: '', phone: '' })

  const mutation = useMutation({
    mutationFn: adminApi.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      toast.success('Business registered successfully')
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to register business')
  })

  return (
    <div className="space-y-6">
      <InputGroup label="Business Name" placeholder="e.g. Quick Mart" value={form.businessName} onChange={(v: string) => setForm({ ...form, businessName: v })} />
      <InputGroup label="Owner Full Name" placeholder="e.g. John Doe" value={form.ownerName} onChange={(v: string) => setForm({ ...form, ownerName: v })} />
      <InputGroup label="Phone Number" placeholder="e.g. 0712 345 678" mono value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
      
      <button 
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending}
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-md font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-xl flex items-center justify-center"
      >
        {mutation.isPending ? 'Registering...' : 'Register Business'}
      </button>
    </div>
  )
}

function InputGroup({ label, placeholder, mono = false, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-md py-4 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono' : ''}`} 
      />
    </div>
  )
}

function StatsCard({ title, value, sub, icon: Icon, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  }
  return (
    <div className={`p-6 rounded-2xl border shadow-sm ${colors[color] || 'bg-gray-50 border-gray-100 text-gray-600'}`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</p>
        <Icon size={18} className="opacity-50" />
      </div>
      <h4 className="text-2xl font-black hl-mono leading-none mb-1">{value}</h4>
      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{sub}</p>
    </div>
  )
}
