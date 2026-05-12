import { useState, useRef, useEffect } from 'react'
import { User, Store, Bell, Lock, Save, Camera, Loader2, LogOut, Trash2, Users, Shield, Mail, Phone, ArrowRight, Plus, CheckCircle2, Edit, FileText, RefreshCcw, Code, Sparkles, Eye } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FeatureGate from '../../components/shared/FeatureGate'

export default function SettingsPage() {
  const { user, refreshUser, logout } = useAuth()
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('Profile')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        operationalSettings: d.operationalSettings || { taxInclusive: true, autoPrint: false }
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

  const allTabs = [
    { name: 'Profile', icon: User },
    { name: 'Business', icon: Store },
    { name: 'Developer', icon: Code },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Lock },
    { name: 'Logs', icon: Shield, role: ['PROVIDER', 'SUPER_ADMIN'] },
  ]

  const tabs = allTabs.filter(tab => {
    if (tab.role) return tab.role.includes(user?.role || '')
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
          className="bg-[#0D4A3E] text-white h-12 px-8 rounded-xl font-black text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2 disabled:opacity-50"
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
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all ${activeTab === tab.name
                  ? 'bg-white text-emerald-600 shadow-sm border border-emerald-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm p-8">
            <h3 className="text-xl font-black text-gray-900 mb-8 border-b border-gray-50 pb-4">{activeTab} Details</h3>

            {activeTab === 'Profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-24 w-24 rounded-3xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-inner">
                      {user?.photoUrl || user?.avatar ? (
                        <img src={user.photoUrl || user.avatar} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <User size={40} className="text-gray-300" />
                      )}
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
                      className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-xl shadow-lg hover:bg-emerald-700 transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
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
                    label="Full Name"
                    value={formData.name}
                    onChange={(v: string) => setFormData({ ...formData, name: v })}
                  />
                  <InputGroup
                    label="Email Address"
                    value={formData.email}
                    onChange={(v: string) => setFormData({ ...formData, email: v })}
                  />
                  <InputGroup
                    label="Phone Number"
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
                  <InputGroup
                    label="Business Category"
                    value={formData.category}
                    onChange={(v: string) => setFormData({ ...formData, category: v })}
                  />
                </div>
                <InputGroup
                  label="Physical Address"
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
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Developer' && (
              <div className="space-y-6">
                <FeatureGate feature="mpesa_stk">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Vendor M-Pesa Gateway</h4>
                  <p className="text-[11px] text-gray-500 mb-6 font-medium max-w-lg">Enter your Daraja API credentials to receive payments directly to your Till or Paybill number via STK Push.</p>
                  <div className="space-y-4 max-w-2xl bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex gap-4 mb-4">
                      <button
                        onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'sandbox' } } })}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env !== 'production' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' : 'bg-white border border-slate-200 text-slate-500'}`}
                      >Sandbox</button>
                      <button
                        onClick={() => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, env: 'production' } } })}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${formData.operationalSettings?.mpesa?.env === 'production' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/10' : 'bg-white border border-slate-200 text-slate-500'}`}
                      >Production</button>
                    </div>
                    <InputGroup
                      label="Consumer Key"
                      value={formData.operationalSettings?.mpesa?.consumerKey || ''}
                      onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, consumerKey: v } } })}
                    />
                    <InputGroup
                      label="Consumer Secret"
                      type="password"
                      value={formData.operationalSettings?.mpesa?.consumerSecret || ''}
                      onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, consumerSecret: v } } })}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <InputGroup
                        label="Shortcode"
                        value={formData.operationalSettings?.mpesa?.shortcode || ''}
                        onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, shortcode: v } } })}
                      />
                      <InputGroup
                        label="Passkey"
                        type="password"
                        value={formData.operationalSettings?.mpesa?.passkey || ''}
                        onChange={(v: string) => setFormData({ ...formData, operationalSettings: { ...formData.operationalSettings, mpesa: { ...formData.operationalSettings?.mpesa, passkey: v } } })}
                      />
                    </div>
                  </div>
                </FeatureGate>
              </div>
            )}

            {activeTab === 'Notifications' && (
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Channel Preferences</h4>
                <div className="space-y-4">
                  <ToggleItem
                    title="Email Alerts"
                    desc="Receive daily sales reports via email"
                    active={formData.notificationSettings?.emailAlerts}
                    onToggle={(v: boolean) => setFormData({
                      ...formData,
                      notificationSettings: { ...formData.notificationSettings, emailAlerts: v }
                    })}
                  />
                  <ToggleItem
                    title="SMS Notifications"
                    desc="Get notified when stock is low"
                    active={formData.notificationSettings?.smsNotifications}
                    onToggle={(v: boolean) => setFormData({
                      ...formData,
                      notificationSettings: { ...formData.notificationSettings, smsNotifications: v }
                    })}
                  />
                  <ToggleItem
                    title="Marketing"
                    desc="News about new features and promotions"
                    active={formData.notificationSettings?.marketing}
                    onToggle={(v: boolean) => setFormData({
                      ...formData,
                      notificationSettings: { ...formData.notificationSettings, marketing: v }
                    })}
                  />
                </div>
              </div>
            )}


            {activeTab === 'Security' && (
              <div className="space-y-8">
                <div className="space-y-6 max-w-md">
                  <InputGroup
                    label="Current Password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.currentPassword || ''}
                    onChange={(v: string) => setFormData({ ...formData, currentPassword: v })}
                  />
                  <InputGroup
                    label="New Password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.newPassword || ''}
                    onChange={(v: string) => setFormData({ ...formData, newPassword: v })}
                  />
                  <InputGroup
                    label="Confirm New Password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.confirmPassword || ''}
                    onChange={(v: string) => setFormData({ ...formData, confirmPassword: v })}
                  />
                </div>

                <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4">Danger Zone</h4>
                  <p className="text-xs text-gray-500 mb-6 font-medium">Once you delete your account, there is no going back. Please be certain.</p>
                  <button
                    onClick={() => setConfirmDeleteId('deactivate')}
                    disabled={deactivateMutation.isPending}
                    className="px-6 py-3 border-2 border-red-100 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2"
                  >
                    {deactivateMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Logs' && (
              <FeatureGate feature="audit_logs">
                <ActivityLogViewer />
              </FeatureGate>
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
          setConfirmDeleteId(null)
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )
}

function InputGroup({ label, value, onChange, placeholder, type = "text", mono = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono' : ''}`}
      />
    </div>
  )
}

function ToggleItem({ title, desc, active, onToggle }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
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


function ActivityLogViewer() {
  const [page, setPage] = useState(1)
  const { data: logsData, isLoading: logsLoading, refetch } = useQuery({
    queryKey: ['activity-logs', page],
    queryFn: () => providersApi.getActivityLogs({ page, limit: 10 })
  })

  const handleExport = () => {
    if (!logsData?.items) return
    const csvContent = [
      ['Date', 'User', 'Action', 'Details', 'IP Address'],
      ...logsData.items.map((log: any) => [
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
            {logsData?.pagination?.total || 0} secure events recorded in this audit period
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 transition-all shadow-sm"
          >
            <RefreshCcw size={18} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 bg-[#0D4A3E] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:-translate-y-0.5 transition-all"
          >
            <FileText size={16} /> Export Audit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-slate-100 overflow-hidden shadow-sm">
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
              ) : logsData?.items.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-300 italic font-medium">No activity recorded for this period.</td></tr>
              ) : (
                logsData.items.map((log: any) => (
                  <tr key={log.id} className="hover:bg-emerald-50/30 transition-all group">
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-900 leading-none mb-1">{new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-[9px] font-bold text-slate-400 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white transition-all">
                          {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{log.user?.name || 'System'}</p>
                          <p className="text-[9px] font-medium text-slate-400">{log.ipAddress || 'Internal'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
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

        {logsData?.pagination && logsData.pagination.pages > 1 && (
          <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Page {page} of {logsData.pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-10 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-30"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => Math.min(logsData.pagination.pages, p + 1))}
                disabled={page === logsData.pagination.pages}
                className="h-10 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-30"
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