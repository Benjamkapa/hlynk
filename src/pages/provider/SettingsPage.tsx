import { useState, useRef } from 'react'
import { User, Store, Bell, Lock, Shield, Save, Camera, Loader2 } from 'lucide-react'
import { ADMIN_CSS } from '../admin/hl-design-system'
import { toast } from 'sonner'
import { useAuth } from '../../lib/auth/AuthContext'
import { providersApi } from '../../lib/api/providers'
import { getErrorMessage } from '../../lib/utils/error'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      await providersApi.uploadPhoto(file)
      await refreshUser()
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  const tabs = [
    { name: 'Profile', icon: User },
    { name: 'Business', icon: Store },
    { name: 'Notifications', icon: Bell },
    { name: 'Security', icon: Lock },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6">
      <style>{ADMIN_CSS}</style>
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 font-medium">Manage your personal profile and business configurations</p>
        </div>
        <button 
          onClick={() => toast.success('Settings saved successfully')}
          className="bg-[#0D4A3E] text-white h-12 px-8 rounded-xl font-black text-sm hover:bg-[#0A3D33] transition-all flex items-center gap-2"
        >
          <Save size={18} /> Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab.name 
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
                      {user?.avatar ? (
                        <img src={user.avatar} className="h-full w-full object-cover" alt="" />
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
                  <InputGroup label="Full Name" value={user?.name || ''} />
                  <InputGroup label="Email Address" value={user?.email || ''} />
                  <InputGroup label="Phone Number" value={user?.phone || ''} mono />
                </div>
              </div>
            )}

            {activeTab === 'Business' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup label="Business Name" value={user?.businessName || ''} />
                  <InputGroup label="Business Category" value="Provider" />
                </div>
                <InputGroup label="Physical Address" value="Update your business location in profile" />
                
                <div className="pt-6 border-t border-gray-50">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Operational Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ToggleItem title="Tax Inclusive Pricing" desc="All product prices include 16% VAT" active={true} />
                    <ToggleItem title="Auto-Print Receipts" desc="Automatically print receipt after each sale" active={false} />
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'Notifications' && (
              <div className="space-y-6">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Channel Preferences</h4>
                <div className="space-y-4">
                  <ToggleItem title="Email Alerts" desc="Receive daily sales reports via email" active={true} />
                  <ToggleItem title="SMS Notifications" desc="Get notified when stock is low" active={true} />
                  <ToggleItem title="Marketing" desc="News about new features and promotions" active={false} />
                </div>
              </div>
            )}

            {activeTab === 'Security' && (
              <div className="space-y-8">
                <div className="space-y-6 max-w-md">
                  <InputGroup label="Current Password" placeholder="••••••••" type="password" />
                  <InputGroup label="New Password" placeholder="••••••••" type="password" />
                  <InputGroup label="Confirm New Password" placeholder="••••••••" type="password" />
                </div>
                
                <div className="pt-8 border-t border-gray-50">
                   <h4 className="text-xs font-black text-red-600 uppercase tracking-widest mb-4">Danger Zone</h4>
                   <button className="px-6 py-3 border-2 border-red-100 text-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">
                     Deactivate My Account
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InputGroup({ label, value, placeholder, type = "text", mono = false }: any) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
      <input 
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border-none rounded-xl py-3.5 px-4 outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-sm font-bold ${mono ? 'hl-mono' : ''}`} 
      />
    </div>
  )
}

function ToggleItem({ title, desc, active }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
      </div>
      <Toggle active={active} />
    </div>
  )
}

function Toggle({ active }: { active: boolean }) {
  return (
    <div className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${active ? 'bg-emerald-600' : 'bg-gray-300'}`}>
      <div className={`w-4 h-4 bg-white rounded-full transition-all ${active ? 'translate-x-6' : 'translate-x-0'}`} />
    </div>
  )
}
