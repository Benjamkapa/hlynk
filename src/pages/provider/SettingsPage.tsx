import { useState, useRef, useEffect } from 'react'
import { User, Store, Bell, Lock, Save, Camera, Loader2, LogOut, Trash2, Users, Shield, Mail, Phone, ArrowRight, Plus, CheckCircle2, Edit, FileText, RefreshCcw, Code, Sparkles, Eye, AlertTriangle, Terminal, ShieldCheck } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { useLocation, NavLink, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FeatureGate from '../../components/shared/FeatureGate'
import { hasOfflinePin, clearOfflinePin } from '../../lib/offline/offlinePin'
import PinSetupModal from '../../components/auth/PinSetupModal'
import { AnimatePresence } from 'framer-motion'

const EtimsIcon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <img src="https://etims.kra.go.ke/assets/images/logo.jpg" alt="eTIMS" style={{ width: size, height: size }} className={`${className || ''} object-contain mix-blend-darken shrink-0`} />
);

const MpesaIcon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <img src="https://monisnapcontent.kinsta.cloud/wp-content/uploads/2021/09/M-PESA_LOGO-640x467.png?v=1632335437" alt="M-Pesa" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

const KcbIcon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <img src="https://sandbox.buni.kcbgroup.com/devportal/site/themes/wso2/images/logo-inverse.svg" alt="KCB" style={{ width: size, height: size, filter: 'invert(1)' }} className={`${className || ''} object-contain shrink-0`} />
);

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth()
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(() => window.innerWidth < 1024 ? 'Platform Hub' : 'Profile')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pinHasPin, setPinHasPin] = useState(() => hasOfflinePin())
  const [showPinSetup, setShowPinSetup] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: providersApi.getMyProfile
  })

  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (profile?.data) {
      const d = profile.data
      setFormData({
        name: d.user?.name || '',
        email: d.user?.email || '',
        phone: d.phone || '',
        businessName: d.businessName || '',
        category: d.category || '',
        location: d.location || '',
        notificationSettings: d.notificationSettings || { emailAlerts: true, smsNotifications: true, marketing: false },
        operationalSettings: d.operationalSettings || { taxInclusive: true, autoPrint: false, lowStockThreshold: 5 }
      })
    }
  }, [profile])

  const updateMutation = useMutation({
    mutationFn: providersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      refreshUser()
      toast.success('Settings saved successfully')
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const passwordMutation = useMutation({
    mutationFn: providersApi.changePassword,
    onSuccess: () => {
      toast.success('Password updated successfully')
      setFormData((prev: any) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const deactivateMutation = useMutation({
    mutationFn: providersApi.deactivateAccount,
    onSuccess: () => {
      toast.success('Account deactivated')
      logout()
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await providersApi.uploadPhoto(file)
      await refreshUser()
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    if (activeTab === 'Security') {
      if (!formData.newPassword) return
      if (formData.newPassword !== formData.confirmPassword) {
        return toast.error('Passwords do not match')
      }
      passwordMutation.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
    } else {
      updateMutation.mutate(formData)
    }
  }

  interface SettingsTab {
    name: string
    icon: any
    role?: string[]
    plan?: 'PLUS' | 'MAX'
    mobileOnly?: boolean
  }

  const allTabs: SettingsTab[] = [
    { name: 'Platform Hub', icon: Sparkles, mobileOnly: true }, // NEW: Mini Bar for all hidden features
    { name: 'Profile', icon: User },
    { name: 'Business', icon: Store, role: ['PROVIDER', 'SUPER_ADMIN'] },
    { name: 'Staff Management', icon: Users, role: ['PROVIDER', 'SUPER_ADMIN'], plan: 'PLUS' },
    { name: 'Customers', icon: Users, role: ['PROVIDER'], mobileOnly: true },
    { name: 'M-Pesa Setup', icon: MpesaIcon, role: ['PROVIDER'], plan: 'PLUS', mobileOnly: true },
    { name: 'KCB Setup', icon: KcbIcon, role: ['PROVIDER'], plan: 'PLUS', mobileOnly: true },
    { name: 'KRA eTIMS', icon: EtimsIcon, role: ['PROVIDER'], mobileOnly: true },
    { name: 'My Plan', icon: Sparkles, role: ['PROVIDER', 'SUPER_ADMIN'], mobileOnly: true },
    { name: 'Data Management', icon: Trash2, role: ['PROVIDER', 'SUPER_ADMIN'] },
    { name: 'Security', icon: Lock },
  ]

  const tabs = allTabs.filter(tab => {
    // Role-based filtering
    if (tab.role && !tab.role.includes(user?.role || '')) return false

    // Plan-based filtering
    if (tab.plan) {
      const getPlanWeight = (p: string) => p.includes('MAX') ? 3 : p.includes('PLUS') ? 2 : 1;
      const currentPlan = (user?.subscription?.planName || 'LITE').toUpperCase();
      const userWeight = getPlanWeight(currentPlan);
      const requiredWeight = getPlanWeight(tab.plan);
      if (userWeight < requiredWeight) return false;
    }

    return true
  })

  if (isLoading) return <div className="p-12 text-center animate-pulse">Loading settings...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 font-medium">Manage your personal profile and business configurations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || passwordMutation.isPending}
          className="bg-[#0D4A3E] text-white h-12 px-8 rounded-[.5rem] font-black text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {updateMutation.isPending || passwordMutation.isPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-[.5rem] font-bold text-sm hover:shadow hover:bg-emerald-100/40 transition-all ${tab.mobileOnly ? 'lg:hidden ' : ''}${activeTab === tab.name
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">{activeTab} Details</h3>

            {activeTab === 'Platform Hub' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-emerald-900 text-white p-8 rounded-[.5rem] relative overflow-hidden">
                   <div className="relative z-10">
                      <h4 className="text-2xl font-black mb-2">Platform Modules Hub</h4>
                      <p className="text-emerald-200 text-sm font-medium">Quick access to all system features and hidden configurations</p>
                   </div>
                   <Sparkles className="absolute -right-4 -bottom-4 text-white/10" size={120} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ModuleTile icon={FileText} label="Inventory" sub="Products & Stock" link="/dashboard/products" color="bg-blue-50 text-blue-600" />
                  <ModuleTile icon={RefreshCcw} label="Sales" sub="History & Records" link="/dashboard/sales" color="bg-emerald-50 text-emerald-600" />
                  <ModuleTile icon={EtimsIcon} label="KRA eTIMS" sub="Compliance" link="/dashboard/etims" color="bg-red-50 text-red-600" isImg />
                  <ModuleTile icon={Users} label="Customers" sub="CRM Database" link="/dashboard/customers" color="bg-amber-50 text-amber-600" />
                  <ModuleTile icon={MpesaIcon} label="M-Pesa" sub="STK Setup" link="/dashboard/developer" color="bg-green-50 text-green-600" isImg />
                  <ModuleTile icon={KcbIcon} label="KCB Bank" sub="STK Setup" link="/dashboard/developer" color="bg-indigo-50 text-indigo-600" isImg />
                  <ModuleTile icon={Trash2} label="Expenses" sub="Cost Tracking" link="/dashboard/expenses" color="bg-purple-50 text-purple-600" />
                  <ModuleTile icon={Shield} label="Security" sub="Activity Logs" link="/dashboard/logs" color="bg-slate-100 text-slate-600" />
                  <ModuleTile icon={Plus} label="New Sale" sub="Terminal" link="/dashboard/record-sale" color="bg-rose-50 text-rose-600" />
                  <ModuleTile icon={Users} label="Staff" sub="Team Control" link="/dashboard/staff" color="bg-indigo-50 text-indigo-600" />
                  <ModuleTile icon={Mail} label="Help Desk" sub="Support Center" link="/dashboard/help" color="bg-cyan-50 text-cyan-600" />
                </div>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-[.5rem] bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-inner">
                      <img 
                        src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData?.name || user?.name || '')}&background=0D4A3E&color=fff`} 
                        className="h-full w-full object-cover" 
                        alt="" 
                        referrerPolicy="no-referrer"
                      />
                      {uploading && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                          <Loader2 size={24} className="text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-[.5rem] shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900">Profile Photo</h4>
                    <p className="text-xs text-gray-500 font-medium">PNG, JPG or GIF. Max 5MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="Your Name"
                    value={formData.name}
                    onChange={(v: string) => setFormData({ ...formData, name: v })}
                  />
                  <InputGroup
                    label="Email"
                    value={formData.email}
                    disabled
                  />
                  <InputGroup
                    label="Phone"
                    value={formData.phone}
                    onChange={(v: string) => setFormData({ ...formData, phone: v })}
                    mono
                  />
                </div>
              </div>
            )}

            {activeTab === 'Business' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="Business Name"
                    value={formData.businessName}
                    onChange={(v: string) => setFormData({ ...formData, businessName: v })}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Business Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="hl-select"
                    >
                      <option value="">Select Category</option>
                      {['Retail', 'Groceries', 'Pharmacy', 'Hardware', 'Clothing', 'Electronics', 'Restaurant', 'Other'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                  <InputGroup
                    label="Where are you located?"
                    value={formData.location}
                    onChange={(v: string) => setFormData({ ...formData, location: v })}
                  />

                <div className="pt-6 border-t border-gray-50">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Operational Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToggleItem
                      title="Tax Inclusive Pricing"
                      desc="All product prices include 16% VAT"
                      active={formData.operationalSettings?.taxInclusive}
                      onToggle={(v: boolean) => setFormData({
                        ...formData,
                        operationalSettings: { ...formData.operationalSettings, taxInclusive: v }
                      })}
                    />
                    <ToggleItem
                      title="Auto-Print Receipts"
                      desc="Automatically print receipt after each sale"
                      active={formData.operationalSettings?.autoPrint}
                      onToggle={(v: boolean) => setFormData({
                        ...formData,
                        operationalSettings: { ...formData.operationalSettings, autoPrint: v }
                      })}
                    />
                        <InputGroup
                          label="Low Stock Threshold"
                          placeholder="e.g. 5"
                          type="number"
                          value={formData.operationalSettings?.lowStockThreshold || ''}
                          onChange={(v: string) => setFormData({
                            ...formData,
                            operationalSettings: { ...formData.operationalSettings, lowStockThreshold: parseInt(v) || 0 }
                          })}
                        />
                        <div className="mt-4 p-4 bg-emerald-50 rounded-[.5rem] border border-emerald-100">
                          <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest leading-relaxed">
                            <Sparkles size={12} className="inline mr-1" />
                            Smart Tuning: Setting this to <span className="text-emerald-900 font-black">{formData.operationalSettings?.lowStockThreshold || 0}</span> means we will flag items in your inventory as "Low Stock" when their quantity drops below this number.
                          </p>
                        </div>
                     </div>
                  </div>
                </div>
            )}

            {activeTab === 'Staff Management' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900">Your Team</h4>
                    <p className="text-xs text-gray-500">Configure who has access to your workshop</p>
                  </div>
                  <Link to="/dashboard/staff" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage in full screen <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="h-[500px] overflow-hidden rounded-[.5rem] border border-gray-100 bg-gray-50">
                   <iframe src="/dashboard/staff" className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            )}

            {activeTab === 'Customers' && (
              <div className="space-y-6 lg:hidden">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900">Customers</h4>
                    <p className="text-xs text-gray-500">Manage your customer database</p>
                  </div>
                  <Link to="/dashboard/customers" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage in full screen <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="h-[600px] overflow-hidden rounded-[.5rem] border border-gray-100 bg-gray-50">
                   <iframe src="/dashboard/customers" className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            )}

            {activeTab === 'M-Pesa Setup' && (
              <div className="space-y-6 lg:hidden">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900">M-Pesa Intergration</h4>
                  </div>
                  <Link to="/dashboard/developer" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage in full screen <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="h-[800px] overflow-hidden rounded-[.5rem] border border-gray-100 bg-gray-50">
                   <iframe src="/dashboard/developer" className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            )}

            {activeTab === 'KCB Setup' && (
              <div className="space-y-6 lg:hidden">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900">KCB Bank Intergration</h4>
                  </div>
                  <Link to="/dashboard/developer" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage in full screen <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="h-[800px] overflow-hidden rounded-[.5rem] border border-gray-100 bg-gray-50">
                   <iframe src="/dashboard/developer" className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            )}

            {activeTab === 'KRA eTIMS' && (
              <div className="space-y-6 lg:hidden">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900">KRA eTIMS</h4>
                  </div>
                  <Link to="/dashboard/etims" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Manage in full screen <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="h-[800px] overflow-hidden rounded-[.5rem] border border-gray-100 bg-gray-50">
                   <iframe src="/dashboard/etims" className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            )}

            {activeTab === 'My Plan' && (
              <div className="space-y-6 lg:hidden">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-lg font-black text-gray-900">Subscription & Billing</h4>
                  </div>
                  <Link to="/dashboard/subscription" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                    Open in full screen <ArrowRight size={12} />
                  </Link>
                </div>
                <div className="h-[800px] overflow-hidden rounded-[.5rem] border border-gray-100 bg-gray-50">
                   <iframe src="/dashboard/subscription" className="w-full h-full border-none pointer-events-auto" />
                </div>
              </div>
            )}



            {activeTab === 'Data Management' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-8 bg-amber-50 border border-amber-100 rounded-[.5rem] flex items-start gap-5">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="text-lg font-black text-amber-900 mb-2">Reset Business Data</h4>
                    <p className="text-sm text-amber-800 leading-relaxed max-w-xl">
                      This action will <strong>permanently delete</strong> all your sales records, history, added products, expenses, and customer logs. This is useful for clearing test data before you start your real business operations.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setConfirmDeleteId('clear-workshop')}
                        className="px-8 py-4 bg-amber-600 text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-900/10 active:scale-95"
                      >
                        Reset Workshop Data
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
                  <div className="p-6 bg-slate-50 rounded-[.5rem] border border-slate-100">
                    <h5 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                       <FileText size={16} /> Auto-Backup
                    </h5>
                    <p className="text-[10px] text-slate-500 font-medium">Export your data to CSV automatically every week.</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[.5rem] border border-slate-100">
                    <h5 className="font-black text-slate-900 mb-2 flex items-center gap-2">
                       <RefreshCcw size={16} /> Data Portability
                    </h5>
                    <p className="text-[10px] text-slate-500 font-medium">Import your products from Excel or CSV files.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-10">
                <ActivityLogViewer />

                {/* ── Offline PIN Management ─────────────────────────────────── */}
                <div className="pt-10 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Offline PIN</h4>
                  </div>
                  <div className={`p-6 rounded-[.5rem] border flex items-center justify-between gap-4 ${
                    pinHasPin
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-amber-50 border-amber-100'
                  }`}>
                    <div>
                      <p className={`text-sm font-black mb-1 ${
                        pinHasPin ? 'text-emerald-900' : 'text-amber-900'
                      }`}>
                        {pinHasPin ? '✓ Offline PIN is active' : 'No offline PIN set'}
                      </p>
                      <p className={`text-[10px] font-medium leading-relaxed max-w-md ${
                        pinHasPin ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {pinHasPin
                          ? 'Your session will lock (not log out) when you go offline. Enter your PIN to resume without internet.'
                          : 'Without a PIN, you cannot log back in if you lose internet. Set one to protect your offline access.'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {pinHasPin && (
                        <button
                          onClick={() => {
                            clearOfflinePin()
                            setPinHasPin(false)
                            toast.success('Offline PIN removed')
                          }}
                          className="px-4 py-2.5 border border-red-200 text-red-500 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                        >
                          Remove PIN
                        </button>
                      )}
                      <button
                        onClick={() => setShowPinSetup(true)}
                        className="px-5 py-2.5 bg-[#0D4A3E] text-white rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#0A3D33] transition-all shadow-lg shadow-emerald-900/10"
                      >
                        {pinHasPin ? 'Change PIN' : 'Set PIN'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-gray-100">
                  <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6">Danger Zone</h4>
                  <div className="p-8 rounded-[.5rem] bg-red-50 border border-red-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-red-900">Deactivate Account</p>
                      <p className="text-[10px] text-red-600 font-bold mt-1">This will immediately revoke access for all your staff.</p>
                    </div>
                    <button 
                      onClick={() => setConfirmDeleteId('deactivate')}
                      className="px-6 py-3 bg-red-600 text-white rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      {/* Parent ConfirmModal: only handles account deactivation */}
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action will disable your access."
        confirmText="Delete"
        onConfirm={() => {
          if (confirmDeleteId === 'deactivate') deactivateMutation.mutate()
          if (confirmDeleteId === 'clear-workshop') {
            providersApi.clearData()
              .then(() => {
                toast.success('Workshop data cleared')
                queryClient.invalidateQueries()
                setActiveTab('Profile')
              })
              .catch(err => toast.error(getErrorMessage(err)))
          }
          setConfirmDeleteId(null)
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {/* PIN Setup Modal */}
      <AnimatePresence>
        {showPinSetup && (
          <PinSetupModal
            onDone={() => {
              setShowPinSetup(false)
              setPinHasPin(hasOfflinePin())
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function InputGroup({ label, value, onChange, placeholder, type = "text", mono = false, disabled = false }: any) {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-60' : ''}`}>
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-gray-50 border-none rounded-[.5rem] py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono' : ''} ${disabled ? 'cursor-not-allowed select-none' : ''}`}
      />
    </div>
  )
}

function ToggleItem({ title, desc, active, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[.5rem] bg-gray-50 border border-gray-100">
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
      </div>
      <Toggle active={active} onToggle={onToggle} />
    </div>
  )
}

function Toggle({ active, onToggle }: { active: boolean; onToggle?: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onToggle?.(!active)}
      className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${active ? 'bg-emerald-600' : 'bg-gray-300'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  )
}


function ModuleTile({ icon: Icon, label, sub, link, color, isImg = false }: any) {
  return (
    <Link to={link} className="p-6 bg-gray-50 border border-gray-100 rounded-[.5rem] hover:bg-white hover:shadow-md transition-all group">
      <div className={`h-12 w-12 rounded-[.5rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-black text-gray-900 leading-none mb-1.5">{label}</p>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{sub}</p>
      </div>
    </Link>
  )
}


function ActivityLogViewer() {
  const [page, setPage] = useState(1)
  const { data: logsData, isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['activity-logs', page],
    queryFn: () => providersApi.getActivityLogs({ page, limit: 10 })
  })

  const handleExport = () => {
    if (!logsData?.data?.items) return
    const csvContent = [
      ['Date', 'User', 'Action', 'Details', 'IP Address'],
      ...logsData.data.items.map((log: any) => [
        new Date(log.createdAt).toLocaleString(),
        log.user?.name || 'System',
        log.logName || log.action,
        log.details,
        log.ipAddress
      ])
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity_logs_${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">System Security Logs</h3>
          <p className="text-[11px] text-slate-400 font-medium italic lowercase tracking-wider">
            {logsData?.data?.pagination?.total || 0} secure events recorded in this audit period
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-3 bg-white border border-slate-100 rounded-[.5rem] text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 bg-[#0D4A3E] text-white rounded-[.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:-translate-y-0.5 transition-all"
          >
            <FileText size={16} /> Export Audit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Timeline</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Agent</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logsLoading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" /></td></tr>
              ) : !logsData?.data?.items || logsData.data.items.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-300 italic font-medium">No activity recorded for this period.</td></tr>
              ) : (
                logsData.data.items.map((log: any) => (
                  <tr key={log.id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-900 leading-none mb-1">{new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-[9px] font-bold text-slate-400 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[.5rem] bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white transition-all">
                          {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{log.user?.name || 'System'}</p>
                          <p className="text-[9px] font-medium text-slate-400">{log.ipAddress || 'Internal'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-[.5rem] text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                        {log.logName || log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-slate-600 font-medium max-w-[300px] leading-relaxed">{log.details}</p>
                        {log.actionId && (
                          <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hl-mono">Trace ID: {log.actionId}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {logsData?.data?.pagination && logsData.data.pagination.totalPages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {page} of {logsData.data.pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 px-4 bg-white border border-slate-100 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(logsData.data.pagination.totalPages, p + 1))}
                disabled={page === logsData.data.pagination.totalPages}
                className="h-10 px-4 bg-white border border-slate-100 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}