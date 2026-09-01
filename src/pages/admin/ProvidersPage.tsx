import { useState, useEffect } from 'react'
import { Plus, Search, Eye, ShieldAlert, UserCheck, TrendingUp, Bell, Users, Landmark, ArrowUpRight } from 'lucide-react'
import Pagination from '../../components/shared/Pagination'
import { SlideOver } from '../../components/shared/SlideOver'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
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
    queryFn: () => adminApi.getTenants({ search, status, planName, page, limit: 5 }),
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
    <div className="space-y-8 animate-in fade-in duration-500 pt-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Business Oversight</h1>
          <p className="text-gray-400 text-sm mt-0.5">Platform growth trajectory and vendor account management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-md border border-emerald-100">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Bell size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">Live registrations</span>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0D4A3E] text-white h-10 px-5 rounded-md font-medium text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Add business
          </button>
        </div>
      </div>

      {/* Chart + KPIs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white p-6 rounded-[.5rem] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">New users trajectory</h3>
              <p className="text-xs text-gray-400 mt-0.5">Global platform registration flow (8 weeks)</p>
            </div>
            <div className="h-8 w-8 rounded-md bg-slate-50 flex items-center justify-center text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={weeklyGrowth} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F8FAFC" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono' }} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#CBD5E1', fontWeight: 700, fontFamily: 'JetBrains Mono' }} dx={-10} />
                <Tooltip
                  cursor={{ stroke: '#F1F5F9', strokeWidth: 1 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px -12px rgba(0,0,0,0.05)', padding: '12px 16px' }}
                  itemStyle={{ fontWeight: 800, color: '#0D4A3E', fontFamily: 'JetBrains Mono', fontSize: 11 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0D4A3E"
                  strokeWidth={1}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0D4A3E', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <SummaryCard icon={Landmark} label="Total businesses" value={String(stats?.overview?.totalProviders || 0)} sub="Platform tenants" />
          <SummaryCard icon={Users} label="Active today" value={String(stats?.overview?.activeToday || 0)} sub="On-cloud now" />

          <div className="bg-white p-5 rounded-[.5rem] border border-gray-100">
            <p className="text-xs text-gray-400 mb-3">New registration awaiting verification</p>
            <div className="p-3 bg-slate-50 rounded-md border border-slate-100 mb-3">
              <p className="text-sm font-medium text-gray-900">{stats?.recentRegistrations?.[0]?.name || 'No new entries'}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 hl-mono">{stats?.recentRegistrations?.[0]?.plan || 'LITE'} plan</p>
            </div>
            <button className="w-full py-2.5 bg-[#0D4A3E] text-white rounded-md text-xs font-medium hover:bg-[#0A3D33] transition-all flex items-center justify-center gap-1.5">
              Review application <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-[.5rem] border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Provider registry</h3>
            <p className="text-xs text-gray-400 mt-0.5">Manage tenant lifecycle</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="text"
                placeholder="Search by name, slug or phone..."
                value={search}
                onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                className="w-full bg-slate-50 border-none rounded-md py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm"
              />
            </div>
            <select
              value={status}
              onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              className="bg-slate-50 border-none rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[130px] transition-all"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Suspended</option>
            </select>
            <select
              value={planName}
              onChange={(e) => handleFilterChange(setPlanName, e.target.value)}
              className="bg-slate-50 border-none rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/10 min-w-[130px] transition-all"
            >
              <option value="">All plans</option>
              <option value="LITE">Starter</option>
              <option value="PLUS">Growth</option>
              <option value="MAX">Business Pro</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Business</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Services</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Users</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent mx-auto" />
                  </td>
                </tr>
              ) : providers.length > 0 ? providers.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm border border-emerald-100">
                        {p.businessName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.businessName}</p>
                        <p className="text-[10px] text-gray-400 font-bold hl-mono">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-widest">{p.planName === 'MAX' ? 'Business Pro' : p.planName === 'PLUS' ? 'Growth' : p.planName === 'LITE' ? 'Starter' : 'TRIAL'}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="text-[10px] font-black hl-mono text-gray-500">
                      {p.servicesCount || 0}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-medium text-gray-900 text-sm hl-mono">{p.usersCount || 0}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {p.isActive === 1 ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => setSelectedProvider(p)} className="p-2 hover:bg-emerald-50 rounded-md transition-all">
                      <Eye size={16} className="text-gray-400 group-hover:text-emerald-600" />
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

        <div className="border-t border-slate-50 p-6">
          <Pagination
            page={page}
            pages={pagination.pages}
            total={pagination.total}
            onPageChange={setPage}
            label="Provider"
          />
        </div>
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
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    businessName: provider.businessName,
    slug: provider.slug || '',
    appliedReferralCode: provider.appliedReferralCode || ''
  })

  useEffect(() => {
    setForm({
      businessName: provider.businessName,
      slug: provider.slug || '',
      appliedReferralCode: provider.appliedReferralCode || ''
    })
  }, [provider])

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
      toast.success(provider.isActive ? 'Provider suspended' : 'Provider activated')
      onClose()
    },
    onError: () => toast.error('Failed to update status')
  })

  const impersonateMutation = useMutation({
    mutationFn: () => adminApi.impersonateUser(provider.primaryUserId),
    onSuccess: (res: any) => {
      localStorage.setItem('accessToken', res.data.accessToken)
      localStorage.setItem('refreshToken', res.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      toast.success(`Logged in as ${provider.businessName}`)
      window.location.href = '/provider/dashboard'
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to impersonate user')
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateTenant(provider.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tenants'] })
      toast.success('Business details updated')
      setIsEditing(false)
      onClose()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update business details')
  })

  if (isEditing) {
    return (
      <div className="space-y-5">
        <InputGroup label="Business Name" value={form.businessName} onChange={(v: string) => setForm({ ...form, businessName: v })} />
        <InputGroup label="URL Slug" value={form.slug} onChange={(v: string) => setForm({ ...form, slug: v })} mono />
        <InputGroup label="Referred By (Referral Code)" placeholder="Enter referral code or leave blank" value={form.appliedReferralCode} onChange={(v: string) => setForm({ ...form, appliedReferralCode: v })} mono />

        <div className="flex gap-3 mt-6">
          <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-md font-medium text-sm hover:bg-gray-200 transition-all">Cancel</button>
          <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} className="flex-1 py-3 bg-[#0D4A3E] text-white rounded-md font-medium text-sm hover:bg-[#0A3D33] transition-all">Save</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[.5rem] border border-gray-100 relative">
        <button onClick={() => setIsEditing(true)} className="absolute top-4 right-4 text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md">Edit</button>
        <div className="w-12 h-12 rounded-md bg-[#0D4A3E] text-white flex items-center justify-center text-lg font-black">
          {provider.businessName?.charAt(0) || '?'}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{provider.businessName}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Joined <span className="hl-mono">{new Date(provider.createdAt).toLocaleDateString()}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-[.5rem] border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Users</p>
          <p className="text-lg font-semibold text-[#0D4A3E] hl-mono">{provider._count?.users || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-[.5rem] border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Services</p>
          <p className="text-lg font-semibold text-gray-900 hl-mono">{provider._count?.services || 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium text-gray-400 border-b border-gray-50 pb-2">Management actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => toggleStatusMutation.mutate()} disabled={toggleStatusMutation.isPending} className="flex items-center justify-center gap-2 py-3 px-4 rounded-md border border-red-100 text-red-600 text-xs font-medium hover:bg-red-50 transition-all">
            <ShieldAlert size={16} /> {provider.isActive ? 'Suspend' : 'Activate'}
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-gray-100 text-gray-400 text-xs font-medium cursor-not-allowed">
            <UserCheck size={16} /> Verify
          </button>
        </div>
        {provider.primaryUserId && (
          <button
            onClick={() => impersonateMutation.mutate()}
            disabled={impersonateMutation.isPending}
            className="w-full mt-1 py-3 bg-emerald-600 text-white rounded-md font-medium text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            {impersonateMutation.isPending ? 'Logging in...' : `Login as ${provider.businessName}`}
          </button>
        )}
        <button onClick={() => setConfirmDelete(true)} disabled={deleteMutation.isPending} className="w-full py-3 text-gray-400 hover:text-red-600 text-xs font-medium transition-all">
          {deleteMutation.isPending ? 'Deleting...' : 'Delete account permanently'}
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Business Permanently"
        message="Are you sure you want to permanently delete this business and all its data? This action is irreversible and will destroy all records, subscriptions, and associated identities."
        confirmText="Delete Business"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

function AddBusinessForm({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    category: 'Other',
    planName: 'LITE'
  })

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="Business Name" placeholder="e.g. Quick Mart" value={form.businessName} onChange={(v: string) => setForm({ ...form, businessName: v })} />
        <InputGroup label="Owner Full Name" placeholder="e.g. John Doe" value={form.ownerName} onChange={(v: string) => setForm({ ...form, ownerName: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <InputGroup label="Phone Number" placeholder="07... " mono value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
        <InputGroup label="Email Address" placeholder="owner@business.com" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Business Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-md py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm"
          >
            <option value="Accounting & Tax Services">Accounting & Tax Services</option>
            <option value="Agrovet">Agrovet</option>
            <option value="Agricultural Cooperative">Agricultural Cooperative</option>
            <option value="Art & Craft Business">Art & Craft Business</option>
            <option value="Bakery">Bakery</option>
            <option value="Barber Shop">Barber Shop</option>
            <option value="Cafe">Cafe</option>
            <option value="Car Wash">Car Wash</option>
            <option value="Car Yard">Car Yard</option>
            <option value="Catering Services">Catering Services</option>
            <option value="Church">Church</option>
            <option value="Clinic">Clinic</option>
            <option value="College">College</option>
            <option value="Community Organization">Community Organization</option>
            <option value="Construction Services">Construction Services</option>
            <option value="Consultancy">Consultancy</option>
            <option value="Cosmetics Shop">Cosmetics Shop</option>
            <option value="Courier Services">Courier Services</option>
            <option value="Cyber Cafe">Cyber Cafe</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Dairy Business">Dairy Business</option>
            <option value="Daycare">Daycare</option>
            <option value="Dental Clinic">Dental Clinic</option>
            <option value="Digital Agency">Digital Agency</option>
            <option value="Driving School">Driving School</option>
            <option value="E-commerce Business">E-commerce Business</option>
            <option value="Electrical Services">Electrical Services</option>
            <option value="Electronics Shop">Electronics Shop</option>
            <option value="Farm">Farm</option>
            <option value="Fashion & Boutique">Fashion & Boutique</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Financial Services">Financial Services</option>
            <option value="Freelancer">Freelancer</option>
            <option value="Furniture Workshop">Furniture Workshop</option>
            <option value="Garage">Garage</option>
            <option value="Guest House">Guest House</option>
            <option value="Hardware Store">Hardware Store</option>
            <option value="Hospital">Hospital</option>
            <option value="Hotel">Hotel</option>
            <option value="Insurance Agency">Insurance Agency</option>
            <option value="Interior Design">Interior Design</option>
            <option value="Internet Service Provider">Internet Service Provider</option>
            <option value="IT Services">IT Services</option>
            <option value="Legal Services">Legal Services</option>
            <option value="Lounge & Bar">Lounge & Bar</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Marketing Agency">Marketing Agency</option>
            <option value="Mechanic Garage">Mechanic Garage</option>
            <option value="Microfinance">Microfinance</option>
            <option value="Mini Mart">Mini Mart</option>
            <option value="Mobile Phone Shop">Mobile Phone Shop</option>
            <option value="Mosque">Mosque</option>
            <option value="NGO">NGO</option>
            <option value="Online Business">Online Business</option>
            <option value="Optical Clinic">Optical Clinic</option>
            <option value="Other">Other / General</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Plumbing Services">Plumbing Services</option>
            <option value="Poultry Farm">Poultry Farm</option>
            <option value="Printing & Branding">Printing & Branding</option>
            <option value="Real Estate Agency">Real Estate Agency</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Retail Store">Retail Store</option>
            <option value="SACCO">SACCO</option>
            <option value="Salon">Salon</option>
            <option value="School">School</option>
            <option value="Software Development">Software Development</option>
            <option value="Spa & Beauty">Spa & Beauty</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400">Onboarding Plan</label>
          <select
            value={form.planName}
            onChange={(e) => setForm({ ...form, planName: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-md py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm"
          >
            <option value="LITE">Starter (7-Day Trial)</option>
            <option value="PLUS">Growth (Subscription)</option>
            <option value="MAX">Business Pro (Subscription)</option>
          </select>
        </div>
      </div>

      <button
        onClick={() => mutation.mutate(form)}
        disabled={mutation.isPending}
        className="w-full py-3.5 mt-4 bg-[#0D4A3E] text-white rounded-md font-medium text-sm hover:bg-[#0A3D33] transition-all flex items-center justify-center"
      >
        {mutation.isPending ? 'Registering...' : 'Complete Registration'}
      </button>
    </div>
  )
}


function InputGroup({ label, placeholder, mono = false, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-md py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: any, label: string, value: string, sub: string }) {
  return (
    <div className="bg-white p-5 rounded-[.5rem] border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-gray-300" />
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <p className="text-xl font-semibold hl-mono tracking-tight text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  )
}