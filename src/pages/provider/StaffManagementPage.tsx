import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Users, Shield, DollarSign, Activity } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { SlideOver } from '../../components/shared/SlideOver'
import { toast } from 'sonner'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import FeatureGate from '../../components/shared/FeatureGate'

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const loadStaff = async () => {
    setIsLoading(true)
    try {
      const res = await providersApi.getStaff()
      setStaffList(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search))

  const handleDelete = async () => {
    if (!confirmDeleteId) return
    try {
      await providersApi.deleteStaff(confirmDeleteId)
      toast.success('Staff team member removed')
      setConfirmDeleteId(null)
      loadStaff()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const getCalculatedCommission = (saleTotal: number, type: string, rate: number) => {
    if (!saleTotal) return 0
    if (type === 'PERCENTAGE') return saleTotal * (rate / 100)
    if (type === 'FLAT') return rate // Note: this calculates aggregate flat rate which might not be correct if it's per item, but we'll approximate per sale count instead? Wait. Flat might mean per sale. Let's do (rate * salesCount) later.
    return 0
  }

  return (
    <FeatureGate feature="staff_accounts">
      <div className="space-y-8 animate-in fade-in duration-500 pt-6">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Team Management</h1>
            <p className="text-gray-500 font-medium">Manage team members, permissions, and calculate commissions</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsAddModalOpen(true)} 
              className="bg-[#0D4A3E] text-white h-12 px-6 rounded-md font-bold text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Add Member
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        
          <SlideOver 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            title="Add New Member"
          >
            <StaffForm onClose={() => { setIsAddModalOpen(false); loadStaff() }} />
          </SlideOver>

          <SlideOver 
            isOpen={!!editingStaff} 
            onClose={() => setEditingStaff(null)} 
            title="Edit Member"
          >
            {editingStaff && <StaffForm staff={editingStaff} onClose={() => { setEditingStaff(null); loadStaff() }} />}
          </SlideOver>

          <div className="p-6 border-b border-gray-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search team members by name or phone..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-md py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-medium" 
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Permissions</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Sales</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Owed Commission</th>
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
                ) : filteredStaff.length > 0 ? filteredStaff.map((s: any) => {
                  
                  const tSales = Number(s.totalSales || 0);
                  const sCount = Number(s.salesCount || 0);
                  const commOwed = s.commissionType === 'PERCENTAGE' 
                    ? tSales * (Number(s.commissionRate) / 100)
                    : s.commissionType === 'FLAT' 
                      ? sCount * Number(s.commissionRate) 
                      : 0;

                  return (
                    <tr key={s.id} className="hover:bg-emerald-50/30 transition-all group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt={s.name} className="h-10 w-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black border border-emerald-100 text-[10px]">
                              {s.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-black text-slate-900 text-sm block">{s.name}</span>
                            <span className={`text-[9px] font-bold tracking-widest uppercase ${s.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                              {s.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="block text-[11px] font-bold text-slate-600">{s.phone}</span>
                        {s.email && <span className="block text-[10px] text-slate-400">{s.email}</span>}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1">
                          {s.permissions?.length > 0 ? s.permissions.map((p: string) => (
                            <span key={p} className="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-widest">{p}</span>
                          )) : (
                            <span className="text-[9px] text-slate-400">Basic</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="block text-sm font-black text-slate-900 hl-mono">KES {tSales.toLocaleString()}</span>
                        <span className="block text-[9px] font-bold text-slate-400">{sCount} Transaction(s)</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="block text-sm font-black text-[#0D4A3E] hl-mono">KES {commOwed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <span className="block text-[9px] font-bold text-slate-400">
                          {s.commissionType === 'PERCENTAGE' ? `${s.commissionRate}%` : s.commissionType === 'FLAT' ? `KES ${s.commissionRate}/sale` : 'No Comm'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingStaff(s) }}
                            className="p-2 hover:bg-white hover:shadow-lg rounded-lg transition-all text-slate-300 hover:text-emerald-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(s.id) }}
                            className="p-2 hover:bg-white hover:shadow-lg rounded-lg transition-all text-slate-300 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No team members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ConfirmModal
          isOpen={!!confirmDeleteId}
          title="Remove Member"
          message="Are you sure you want to remove this team member? They will lose access to the system completely."
          confirmText="Remove"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </div>
    </FeatureGate>
  )
}

function StaffForm({ staff, onClose }: { staff?: any; onClose: () => void }) {
  const [form, setForm] = useState({ 
    name: staff?.name || '', 
    phone: staff?.phone || '', 
    email: staff?.email || '', 
    password: '',
    commissionType: staff?.commissionType || 'NONE',
    commissionRate: staff?.commissionRate?.toString() || '0',
    isActive: staff ? staff.isActive : true,
    permissions: staff?.permissions || []
  })
  const [loading, setLoading] = useState(false)

  const togglePermission = (p: string) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(p) 
        ? prev.permissions.filter((x: string) => x !== p)
        : [...prev.permissions, p]
    }))
  }

  const handleSubmit = async () => {
    if (!form.name || !form.phone) {
      return toast.error('Name and Phone are required.')
    }
    if (!staff && !form.email && !form.password) {
      return toast.error('Please provide either an Email (for Google Login) or a Password.')
    }
    setLoading(true)
    try {
      const payload = { ...form, commissionRate: parseFloat(form.commissionRate) || 0 }
      if (staff) {
        if (!payload.password) delete (payload as any).password // don't send empty password updates
        await providersApi.updateStaff(staff.id, payload)
        toast.success('Staff updated successfully')
      } else {
        await providersApi.createStaff(payload)
        toast.success('New staff member added')
      }
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const availablePermissions = [
    { id: 'overview', label: 'View Dashboard' },
    { id: 'sales', label: 'Record Sales' },
    { id: 'products', label: 'Manage Inventory' },
    { id: 'customers', label: 'Manage Customers' },
    { id: 'reports', label: 'View Reports' },
  ]

  return (
    <div className="space-y-6">
      <InputGroup label="Full Name *" placeholder="Jane Doe" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
      <div className="grid grid-cols-2 gap-4">
        <InputGroup label="Phone Number *" placeholder="0712 345 678" mono value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
        <InputGroup label="Work Email" placeholder="Required for Google Login" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
      </div>
      
      <InputGroup 
        label={staff ? "Change Password" : "Manual Password (Optional if Email is set)"} 
        placeholder="••••••••" 
        type="password"
        value={form.password} 
        onChange={(v: string) => setForm({ ...form, password: v })} 
      />

      <div className="border-t border-slate-100 pt-6 mt-2">
        <h3 className="text-xs font-black uppercase text-slate-800 mb-4 tracking-widest flex items-center gap-2"><DollarSign size={14} /> Commission Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Type</label>
            <select 
              value={form.commissionType}
              onChange={(e) => setForm({ ...form, commissionType: e.target.value })}
              className="w-full bg-slate-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold appearance-none text-sm"
            >
              <option value="NONE">No Commission</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Rate per Sale</option>
            </select>
          </div>
          {form.commissionType !== 'NONE' && (
            <InputGroup 
              label={form.commissionType === 'PERCENTAGE' ? "Rate (%)" : "Rate (KES)"} 
              placeholder="0" 
              mono 
              value={form.commissionRate} 
              onChange={(v: string) => setForm({ ...form, commissionRate: v })} 
            />
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-xs font-black uppercase text-slate-800 mb-4 tracking-widest flex items-center gap-2"><Shield size={14} /> Access Permissions</h3>
        <div className="grid grid-cols-2 gap-3">
          {availablePermissions.map(p => (
            <label key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100">
              <input 
                type="checkbox"
                checked={form.permissions.includes(p.id)}
                onChange={() => togglePermission(p.id)}
                className="h-4 w-4 accent-emerald-600 rounded"
              />
              <span className="text-xs font-bold text-slate-700">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {staff && (
        <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer">
          <input 
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 accent-emerald-600 rounded"
          />
          <span className="text-sm font-bold text-slate-700">Account is Active</span>
        </label>
      )}

      <button 
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-5 mt-6 bg-[#0D4A3E] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center disabled:opacity-50"
      >
        {loading ? 'Saving...' : staff ? 'Update Team Member' : 'Add Team Member'}
      </button>
    </div>
  )
}

function InputGroup({ label, placeholder, mono = false, type = "text", value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{label}</label>
      <input 
        type={type} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-xl py-4 px-4 outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-sm font-bold ${mono ? 'hl-mono text-[#0D4A3E]' : ''}`} 
      />
    </div>
  )
}
