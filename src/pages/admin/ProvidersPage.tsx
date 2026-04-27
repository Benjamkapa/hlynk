import { useState } from 'react'
import { Plus, Search, Eye, ShieldAlert, UserCheck, Filter } from 'lucide-react'
import { ADMIN_CSS } from './hl-design-system'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { PaginatedResponse } from '../../lib/types/api'

export default function ProvidersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data: tenantsData, isLoading } = useQuery<PaginatedResponse<any>>({
    queryKey: ['admin-tenants', search],
    queryFn: () => adminApi.getTenants({ search }),
    placeholderData: keepPreviousData
  })

  const providers = tenantsData?.items || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Businesses</h1>
          <p className="text-gray-500 font-medium">Control vendor accounts and monitor platform tenants</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Add Business
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by business name, owner, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium" 
            />
          </div>
          <button className="bg-gray-50 text-gray-500 h-11 px-4 rounded-md flex items-center gap-2 font-bold text-xs hover:bg-gray-100 transition-all border border-gray-100">
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Risk Score</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Sales Today</th>
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
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-sm">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold hl-mono">{p.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{p.plan}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      p.risk === 'Low' ? 'bg-emerald-50 text-emerald-600' :
                      p.risk === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {p.risk}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-gray-900 text-sm hl-mono">KES {p.salesToday?.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
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
      </div>

      <SlideOver isOpen={!!selectedProvider} onClose={() => setSelectedProvider(null)} title="Business Details">
         {selectedProvider && (
           <div className="space-y-8">
             <div className="flex items-center gap-6 p-8 bg-gray-50 rounded-xl border border-gray-100">
               <div className="w-16 h-16 rounded-xl bg-[#0D4A3E] text-white flex items-center justify-center text-2xl font-black shadow-lg">
                 {selectedProvider.name.charAt(0)}
               </div>
               <div>
                 <h3 className="text-xl font-black text-gray-900">{selectedProvider.name}</h3>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Joined <span className="hl-mono">{selectedProvider.joined}</span></p>
               </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sales Today</p>
                 <p className="text-lg font-black text-[#0D4A3E] hl-mono">{selectedProvider.salesToday}</p>
               </div>
               <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Risk Score</p>
                 <p className="text-lg font-black text-gray-900 uppercase">{selectedProvider.risk}</p>
               </div>
             </div>

             <div className="space-y-4">
               <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Management Actions</h4>
               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { toast.success('Provider Suspended'); setSelectedProvider(null); }} className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all">
                   <ShieldAlert size={18} /> Suspend
                 </button>
                 <button onClick={() => { toast.success('Account Verified'); setSelectedProvider(null); }} className="flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-[#0D4A3E] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-lg">
                   <UserCheck size={18} /> Verify
                 </button>
               </div>
               <button onClick={() => { toast.error('Account Deleted'); setSelectedProvider(null); }} className="w-full py-4 text-gray-300 hover:text-red-600 text-[10px] font-black uppercase tracking-widest transition-all">Delete Account Permanently</button>
             </div>
           </div>
         )}
      </SlideOver>

      <SlideOver isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Business">
         <AddBusinessForm onClose={() => setIsAddModalOpen(false)} />
      </SlideOver>
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
