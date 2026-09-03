import { useState, useRef, useEffect } from 'react'
import { User, Store, Bell, Lock, Save, Camera, Loader2, LogOut, Trash2, Users, Shield, Mail, Phone, ArrowRight, Plus, CheckCircle2, Edit, FileText, RefreshCcw, Code, Sparkles, Eye, AlertTriangle, Terminal, ShieldCheck, CreditCard } from 'lucide-react'
import { ConfirmModal } from '../../components/shared/ConfirmModal'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { api } from '../../lib/api/client'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'
import { useLocation, NavLink, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import FeatureGate from '../../components/shared/FeatureGate'
import { hasOfflinePin, clearOfflinePin } from '../../lib/offline/offlinePin'
import PinSetupModal from '../../components/auth/PinSetupModal'
import { AnimatePresence } from 'framer-motion'
import { subscribeToPushNotifications, unsubscribeFromPush, getPushSubscriptionState } from '../../lib/notifications/pushService'

const EtimsIcon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <img src="https://etims.kra.go.ke/assets/images/logo.jpg" alt="eTIMS" style={{ width: size, height: size }} className={`${className || ''} object-contain mix-blend-darken shrink-0`} />
);

const MpesaIcon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <img src="https://monisnapcontent.kinsta.cloud/wp-content/uploads/2021/09/M-PESA_LOGO-640x467.png?v=1632335437" alt="M-Pesa" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

const KcbIcon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <img src="https://buni.kcbgroup.com/_nuxt/logo.71b8fc4b.svg" alt="KCB" style={{ width: size, height: size }} className={`${className || ''} object-contain shrink-0`} />
);

export default function SettingsPage() {
  const { user, refreshUser, logout, patchUser } = useAuth()
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
      let mods: string[] = [];
      if (Array.isArray(d.activeModules) && d.activeModules.length > 0) mods = d.activeModules;
      else if (typeof d.activeModules === 'string') {
        try { mods = JSON.parse(d.activeModules); } catch (_) {}
      }
      if (!mods.length && Array.isArray(user?.activeModules)) mods = user.activeModules;
      else if (!mods.length && typeof user?.activeModules === 'string') {
        try { mods = JSON.parse(user.activeModules); } catch (_) {}
      }
      if (!mods.length) mods = ['POS'];

      setFormData((prev: any) => ({
        ...prev,
        name: d.user?.name || '',
        email: d.user?.email || '',
        phone: d.phone || '',
        businessName: d.businessName || '',
        category: d.category || '',
        location: d.location || '',
        activeModules: prev?.activeModules?.length ? prev.activeModules : mods,
        notificationSettings: d.notificationSettings || { emailAlerts: true, smsNotifications: true, marketing: false },
        operationalSettings: d.operationalSettings || { taxInclusive: true, autoPrint: false, lowStockThreshold: 5 }
      }))
    }
  }, [profile])

  const handleModuleToggle = (moduleKey: 'POS' | 'HOSPITALITY', enable: boolean) => {
    let current: string[] = [];
    if (Array.isArray(formData.activeModules) && formData.activeModules.length > 0) {
      current = formData.activeModules;
    } else if (Array.isArray(user?.activeModules) && user.activeModules.length > 0) {
      current = user.activeModules;
    } else {
      current = ['POS'];
    }

    let updated: string[] = [];
    if (enable) {
      updated = Array.from(new Set([...current, moduleKey]));
    } else {
      updated = current.filter((m: string) => m !== moduleKey);
    }

    if (updated.length === 0) {
      toast.error('At least one active module must remain enabled');
      return;
    }

    // 1. Update local state
    setFormData((prev: any) => ({ ...prev, activeModules: updated }));

    // 2. Real-time navigation menu update!
    patchUser({ activeModules: updated });

    // 3. Persist to backend database immediately
    providersApi.updateProfile({
      businessName: formData.businessName || user?.businessName,
      activeModules: updated
    }).then(async () => {
      toast.success(`${moduleKey === 'POS' ? 'POS & Retail' : 'Bookings, Rentals & Services'} module updated`);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
    }).catch((err) => {
      toast.error(getErrorMessage(err));
    });
  };

  const updateMutation = useMutation({
    mutationFn: providersApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-profile'] })
      patchUser({
        businessName: formData.businessName,
        name: formData.name,
        activeModules: formData.activeModules,
      })
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

  const deleteAccountMutation = useMutation({
    mutationFn: providersApi.deleteProfileAndFacility,
    onSuccess: () => {
      toast.success('Your profile, facility, and all business data have been permanently erased.')
      localStorage.clear()
      sessionStorage.clear()
      logout()
      window.location.href = '/register'
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
    // { name: 'Customers', icon: Users, role: ['PROVIDER'], mobileOnly: true },
    { name: 'Notifications', icon: Bell },
    // { name: 'Payment Gateway', icon: CreditCard, role: ['PROVIDER'], mobileOnly: true },
    // { name: 'KRA eTIMS', icon: EtimsIcon, role: ['PROVIDER'], mobileOnly: true },
    // { name: 'My Plan', icon: Sparkles, role: ['PROVIDER', 'SUPER_ADMIN'], mobileOnly: true },
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

    // Responsive filtering: Hide "mobileOnly" tabs on desktop (>=1024px)
    if (tab.mobileOnly && window.innerWidth >= 1024) return false;

    return true
  })

  if (isLoading) return <div className="p-12 text-center animate-pulse">Loading settings...</div>

  return (
    // Extra bottom padding on small screens: the primary nav collapses into a
    // fixed bottom bar there, so page content needs room not to sit under it.
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500 pt-4 lg:pt-6 pb-28 lg:pb-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 font-medium text-sm lg:text-base">Manage your personal profile and business configurations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || passwordMutation.isPending}
          className="w-full sm:w-auto bg-[#0D4A3E] text-white h-12 px-8 rounded-[.5rem] font-black text-sm hover:bg-[#0A3D33] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {updateMutation.isPending || passwordMutation.isPending ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-8">
        {/* Tab navigation: an evenly spaced grid on small screens (everything
            visible at once, clear of the bottom nav — no side-scrolling
            needed), vertical sidebar list from lg upward. */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 lg:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-1.5 rounded-[.5rem] text-center transition-all ${
                activeTab === tab.name
                  ? 'bg-[#0D4A3E] text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              <span className="text-[10px] font-semibold leading-tight">{tab.name}</span>
            </button>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-col lg:gap-2">
          {tabs.filter((tab) => !tab.mobileOnly).map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-[.5rem] font-bold text-sm transition-all ${
                activeTab === tab.name
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
          <div className="bg-white rounded-[.5rem] border border-gray-100 shadow-sm p-5 lg:p-8">
            <h3 className="text-lg lg:text-xl font-black text-gray-900 mb-6 lg:mb-8 border-b border-gray-50 pb-4">{activeTab} Details</h3>

            {activeTab === 'Platform Hub' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-emerald-900 text-white p-6 md:p-8 rounded-[.5rem] relative overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="text-xl md:text-2xl font-black mb-1 md:mb-2">Platform Modules</h4>
                    <p className="text-emerald-200 text-[10px] md:text-sm font-medium">Quick access to all system features</p>
                  </div>
                  <Sparkles className="absolute -right-4 -bottom-4 text-white/10" size={100} />
                </div>
              </div>
            )}

            {activeTab === 'Profile' && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-lg">
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
                      {[
                        'Accounting & Tax Services',
                        'Agrovet',
                        'Agricultural Cooperative',
                        'Art & Craft Business',
                        'Bakery',
                        'Barber Shop',
                        'Cafe',
                        'Car Wash',
                        'Car Yard',
                        'Catering Services',
                        'Church',
                        'Clinic',
                        'College',
                        'Community Organization',
                        'Construction Services',
                        'Consultancy',
                        'Cosmetics Shop',
                        'Courier Services',
                        'Cyber Cafe',
                        'Cyber Security',
                        'Dairy Business',
                        'Daycare',
                        'Dental Clinic',
                        'Digital Agency',
                        'Driving School',
                        'E-commerce Business',
                        'Electrical Services',
                        'Electronics Shop',
                        'Farm',
                        'Fashion & Boutique',
                        'Fast Food',
                        'Financial Services',
                        'Freelancer',
                        'Furniture Workshop',
                        'Garage',
                        'Guest House',
                        'Hardware Store',
                        'Hospital',
                        'Hotel',
                        'Insurance Agency',
                        'Interior Design',
                        'Internet Service Provider',
                        'IT Services',
                        'Legal Services',
                        'Lounge & Bar',
                        'Manufacturing',
                        'Marketing Agency',
                        'Mechanic Garage',
                        'Microfinance',
                        'Mini Mart',
                        'Mobile Phone Shop',
                        'Mosque',
                        'NGO',
                        'Online Business',
                        'Optical Clinic',
                        'Other',
                        'Pharmacy',
                        'Plumbing Services',
                        'Poultry Farm',
                        'Printing & Branding',
                        'Real Estate Agency',
                        'Restaurant',
                        'Retail Store',
                        'SACCO',
                        'Salon',
                        'School',
                        'Software Development',
                        'Spa & Beauty',
                        'Supermarket',
                        'Tailoring & Fashion Design',
                        'Training Centre',
                        'Transport Services',
                        'Travel Agency',
                        'University',
                        'Veterinary Clinic',
                        'Welding & Fabrication',
                        'Wholesale Shop'
                      ].map(c => (
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

                <div className="space-y-2 mt-6">
                   <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Sales Channels / Sources</label>
                   <input
                      type="text"
                      placeholder="e.g. Walk-in, Uber Eats, Glovo (comma separated)"
                      value={(formData.operationalSettings?.saleSources || ['In-Store', 'Walk-in']).join(', ')}
                      onChange={(e) => {
                         const raw = e.target.value.split(',').map(s => s.trimStart()).filter(Boolean);
                         setFormData({
                            ...formData,
                            operationalSettings: { ...formData.operationalSettings, saleSources: raw }
                         })
                      }}
                      className="w-full bg-gray-50 border-none rounded-[.5rem] py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold"
                   />
                </div>

                <div className="pt-6 border-t border-gray-50 mt-6">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Active Platform Modules</h4>
                  <p className="text-xs text-gray-500 font-medium mb-6">Enable or disable modules for your business. Sidebar and navigation update in real time.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <ToggleItem
                      title="Point of Sale & Retail Inventory"
                      desc="Inventory Management, Cashier Terminal, Sales History & Expense Tracking"
                      active={(formData.activeModules || user?.activeModules || ['POS']).includes('POS')}
                      onToggle={(active: boolean) => handleModuleToggle('POS', active)}
                    />
                    <ToggleItem
                      title="Bookings, Rentals & Services"
                      desc="Units, Fleet/Car Rentals, Car Wash, Equipment, Stays, Rates & Operations"
                      active={(formData.activeModules || user?.activeModules || []).includes('HOSPITALITY')}
                      onToggle={(active: boolean) => handleModuleToggle('HOSPITALITY', active)}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 mt-6">
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

            {activeTab === 'Data Management' && (
              <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="p-5 lg:p-8 bg-amber-50 border border-amber-100 rounded-[.5rem] flex flex-col sm:flex-row items-start gap-5">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={24} />
                  <div className="w-full">
                    <h4 className="text-lg font-black text-amber-900 mb-2">Reset Business Data</h4>
                    <p className="text-sm text-amber-800 leading-relaxed max-w-xl">
                      This action will <strong>permanently delete</strong> all your sales records, history, added products, expenses, and customer logs. This is useful for clearing test data before you start your real business operations.
                    </p>
                    <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => setConfirmDeleteId('clear-workshop')}
                        className="w-full sm:w-auto px-8 py-4 bg-amber-600 text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all shadow-xl shadow-amber-900/10 active:scale-95"
                      >
                        Reset Workshop Data
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 lg:p-8 bg-red-50 border border-red-100 rounded-[.5rem] flex flex-col sm:flex-row items-start gap-5">
                  <Trash2 className="text-red-600 shrink-0 mt-1" size={24} />
                  <div className="w-full">
                    <h4 className="text-lg font-black text-red-900 mb-2">Delete Profile & Facility Data</h4>
                    <p className="text-sm text-red-800 leading-relaxed max-w-xl">
                      Completely and permanently erases your user profile, facility tenant, staff logins, product catalog, sales, expenses, and financial logs from HudumaLynk. <strong>This action cannot be undone.</strong>
                    </p>
                    <div className="mt-6 lg:mt-8">
                      <button
                        onClick={() => setConfirmDeleteId('delete-profile-facility')}
                        className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/10 active:scale-95"
                      >
                        Delete Profile & Facility
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 lg:p-8 bg-blue-50 border border-blue-100 rounded-[.5rem] flex flex-col sm:flex-row items-start gap-5">
                  <RefreshCcw className="text-blue-600 shrink-0 mt-1" size={24} />
                  <div className="w-full">
                    <h4 className="text-lg font-black text-blue-900 mb-2">Wipe Application Cache</h4>
                    <p className="text-sm text-blue-800 leading-relaxed max-w-xl">
                      If you see errors like <strong>"Service worker took too long to activate"</strong> or "Old version detected", use this to force the app to refresh. This will log you out but fix most mobile update issues.
                    </p>
                    <div className="mt-6 lg:mt-8">
                      <button
                        onClick={async () => {
                          if (confirm('This will wipe local caches and log you out to fix update issues. Proceed?')) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            for (let registration of registrations) {
                              await registration.unregister();
                            }
                            if ('caches' in window) {
                              const keys = await caches.keys();
                              for (let key of keys) {
                                await caches.delete(key);
                              }
                            }
                            // Preserve one-time prompt sentinels so they don't re-fire after reset
                            const preserve: Record<string, string | null> = {};
                            for (let i = 0; i < localStorage.length; i++) {
                              const k = localStorage.key(i)!;
                              if (k === 'hlynk_pin_prompted' || k.startsWith('hlynk_reviewed_')) {
                                preserve[k] = localStorage.getItem(k);
                              }
                            }
                            localStorage.clear();
                            Object.entries(preserve).forEach(([k, v]) => { if (v !== null) localStorage.setItem(k, v); });
                            sessionStorage.clear();
                            window.location.href = '/login?reset=true';
                          }
                        }}
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-[.5rem] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/10 active:scale-95"
                      >
                        Force Hard Reset
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

            {activeTab === 'Notifications' && (
              <NotificationsPanel
                settings={formData.notificationSettings}
                onUpdate={(s: any) => setFormData({ ...formData, notificationSettings: s })}
              />
            )}

            {activeTab === 'Security' && (
              <div className="space-y-8 lg:space-y-10">
                <ActivityLogViewer />

                <div className="pt-8 lg:pt-10 border-t border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Offline PIN</h4>
                  </div>
                  <div className={`p-5 lg:p-6 rounded-[.5rem] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${pinHasPin
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-amber-50 border-amber-100'
                    }`}>
                    <div>
                      <p className={`text-sm font-black mb-1 ${pinHasPin ? 'text-emerald-900' : 'text-amber-900'
                        }`}>
                        {pinHasPin ? '✓ Offline PIN is active' : 'No offline PIN set'}
                      </p>
                      <p className={`text-[10px] font-medium leading-relaxed max-w-md ${pinHasPin ? 'text-emerald-700' : 'text-amber-700'
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

                <div className="pt-8 lg:pt-10 border-t border-gray-100">
                  <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6">Danger Zone</h4>
                  <div className="space-y-4">
                    <div className="p-5 lg:p-8 rounded-[.5rem] bg-amber-50 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-amber-900">Deactivate Account</p>
                        <p className="text-[10px] text-amber-700 font-bold mt-1">This will temporarily revoke access for all your staff logins.</p>
                      </div>
                      <button
                        onClick={() => setConfirmDeleteId('deactivate')}
                        className="w-full sm:w-auto px-6 py-3 bg-amber-600 text-white rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/10"
                      >
                        Deactivate
                      </button>
                    </div>

                    <div className="p-5 lg:p-8 rounded-[.5rem] bg-red-50 border border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-black text-red-900">Permanently Delete Profile & Facility Data</p>
                        <p className="text-[10px] text-red-600 font-bold mt-1">Completely wipes your user account, staff, sales, inventory, and facility from HudumaLynk.</p>
                      </div>
                      <button
                        onClick={() => setConfirmDeleteId('delete-profile-facility')}
                        className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white rounded-[.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10"
                      >
                        Delete Profile & Facility
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title={
          confirmDeleteId === 'delete-profile-facility'
            ? 'PERMANENTLY DELETE PROFILE & FACILITY?'
            : confirmDeleteId === 'deactivate'
            ? 'Deactivate Account?'
            : 'Reset Business Data?'
        }
        message={
          confirmDeleteId === 'delete-profile-facility'
            ? 'CRITICAL WARNING: This will permanently erase your user profile, all staff logins, inventory, sales, financial records, and your facility tenant from HudumaLynk. THIS CANNOT BE UNDONE. Are you absolutely sure?'
            : confirmDeleteId === 'deactivate'
            ? 'Are you sure you want to deactivate your account? This action will disable access for you and your staff.'
            : 'Are you sure you want to reset workshop data? All sales and product data will be cleared.'
        }
        confirmText={confirmDeleteId === 'delete-profile-facility' ? 'Yes, Delete Everything' : 'Confirm'}
        onConfirm={() => {
          if (confirmDeleteId === 'deactivate') deactivateMutation.mutate()
          if (confirmDeleteId === 'delete-profile-facility') deleteAccountMutation.mutate()
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

function NotificationsPanel({ settings = {}, onUpdate }: any) {
  const [pushState, setPushState] = useState<'subscribed' | 'denied' | 'prompt' | 'unsupported' | 'ios_browser'>('prompt');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPushSubscriptionState().then(setPushState as any);
  }, []);

  const handlePushToggle = async (active: boolean) => {
    setLoading(true);
    try {
      if (active) {
        await subscribeToPushNotifications();
        toast.success('Native notifications enabled!');
      } else {
        await unsubscribeFromPush();
        toast.success('Native notifications disabled.');
      }
      const newState = await getPushSubscriptionState();
      setPushState(newState as any);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update push settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-emerald-50 p-5 lg:p-6 rounded-[.5rem] border border-emerald-100 flex items-start gap-4">
        <Bell className="text-emerald-600 mt-1 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-1">Native Alerts</h4>
          <p className="text-xs text-emerald-700 leading-relaxed max-w-lg">
            Enable native push notifications to receive real-time alerts for M-Pesa payments, low stock levels, and critical security events even when the app is closed.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 lg:p-6 bg-gray-50 rounded-[.5rem] border border-gray-100">
          <div>
            <p className="font-black text-gray-900 text-sm">Web Push Notifications</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
              {pushState === 'subscribed' ? '✓ Currently Active' : pushState === 'denied' ? '⚠ Blocked in Browser' : 'Inactive'}
            </p>
          </div>
          {loading ? (
            <Loader2 className="animate-spin text-emerald-600" size={20} />
          ) : pushState === 'unsupported' ? (
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Unsupported</span>
          ) : pushState === 'ios_browser' ? (
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Action Required</span>
              <button
                onClick={() => toast.info('To enable notifications on iPhone: Tap "Share" and select "Add to Home Screen". Push only works in standalone mode!')}
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
              >
                Setup on iPhone
              </button>
            </div>
          ) : pushState === 'denied' ? (
            <button
              onClick={() => toast.info('Please reset notification permissions in your browser address bar.')}
              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-[.5rem] text-[10px] font-black uppercase tracking-widest"
            >
              How to fix?
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {pushState === 'subscribed' && (
                <button
                  onClick={async () => {
                    try {
                      await api.post('/notifications/test');
                      toast.success('Test notification sent!');
                    } catch (err) {
                      toast.error('Failed to send test');
                    }
                  }}
                  className="px-3 py-1.5 border border-emerald-100 text-emerald-600 rounded-[.4rem] text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all"
                >
                  Send Test
                </button>
              )}
              <Toggle active={pushState === 'subscribed'} onToggle={handlePushToggle} />
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ToggleItem
            title="Email Alerts"
            desc="Receive transaction summaries via email"
            active={settings?.emailAlerts || false}
            onToggle={(v: boolean) => onUpdate({ ...settings, emailAlerts: v })}
          />
          <ToggleItem
            title="SMS Notifications"
            desc="Get critical alerts via SMS (charges apply)"
            active={settings?.smsNotifications || false}
            onToggle={(v: boolean) => onUpdate({ ...settings, smsNotifications: v })}
          />
          <ToggleItem
            title="Marketing updates"
            desc="New features and business tips"
            active={settings?.marketing || false}
            onToggle={(v: boolean) => onUpdate({ ...settings, marketing: v })}
          />
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, type = "text", mono = false, disabled = false }: any) {
  return (
    <div className={`space-y-2 ${disabled ? 'opacity-60' : ''}`}>
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={value ?? ''}
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
    <div className="flex items-center justify-between gap-4 p-4 rounded-[.5rem] bg-gray-50 border border-gray-100">
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
      className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer shrink-0 ${active ? 'bg-emerald-600' : 'bg-gray-300'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  )
}


function ModuleTile({ icon: Icon, label, sub, link, color, isImg = false, isComingSoon = false }: any) {
  return (
    <Link to={link} className={`p-5 lg:p-6 bg-gray-50 border border-gray-100 rounded-[.5rem] hover:bg-white hover:shadow-md transition-all group relative ${isComingSoon ? 'opacity-60 grayscale' : ''}`}>
      {isComingSoon && (
        <span className="absolute top-3 right-3 text-[8px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
          Soon
        </span>
      )}
      <div className={`h-11 w-11 lg:h-12 lg:w-12 rounded-[.5rem] flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-black text-gray-900 leading-none mb-1.5">{label}</p>
        {/* <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{sub} {isComingSoon ? '(Coming Soon)' : ''}</p> */}
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg lg:text-xl font-black text-slate-900 tracking-tight mb-1">System Security Logs</h3>
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
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 bg-[#0D4A3E] text-white rounded-[.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:-translate-y-0.5 transition-all"
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
                <th className="px-5 lg:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Event Timeline</th>
                <th className="px-5 lg:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">User Agent</th>
                <th className="px-5 lg:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Operation</th>
                <th className="px-5 lg:px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Action Details</th>
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
                    <td className="px-5 lg:px-8 py-5 whitespace-nowrap">
                      <p className="text-xs font-black text-slate-900 leading-none mb-1">{new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                      <p className="text-[9px] font-bold text-slate-400 hl-mono">{new Date(log.createdAt).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-5 lg:px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-[.5rem] bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-white transition-all shrink-0">
                          {log.user?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 leading-none mb-1">{log.user?.name || 'System'}</p>
                          <p className="text-[9px] font-medium text-slate-400">{log.ipAddress || 'Internal'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 lg:px-8 py-5 whitespace-nowrap">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-[.5rem] text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                        {log.logName || log.action}
                      </span>
                    </td>
                    <td className="px-5 lg:px-8 py-5">
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
          <div className="p-5 lg:p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
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