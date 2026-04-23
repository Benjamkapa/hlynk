import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, Upload, MapPin, Phone, Clock, Briefcase } from 'lucide-react'
import { providersApi } from '../../lib/api/providers'

const KENYA_COUNTIES = [
  'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
  'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
  'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
  'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
  'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri',
  'Samburu','Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia',
  'Turkana','Uasin Gishu','Vihiga','Wajir','West Pokot'
]

const CATEGORIES = [
  'Salon & Barbershop','Electronics Repair','Phone Repair','Mechanic',
  'Cleaning Services','Food & Catering','Plumbing','Electrical',
  'Tailoring','Freelancer','Tutoring','Photography','Other'
]

export default function SettingsPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'profile' | 'hours'>('profile')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState<any>(null)

  const { isLoading } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: providersApi.getMyProfile,
    onSuccess: (res: any) => { if (!form) setForm(res.data) },
  } as any)

  const updateMut = useMutation({
    mutationFn: providersApi.updateProfile,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-profile'] }); toast.success('Profile updated!') },
    onError: () => toast.error('Failed to save changes'),
  })

  const photoMut = useMutation({
    mutationFn: (file: File) => providersApi.uploadPhoto(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-profile'] }); toast.success('Photo updated!'); setPhotoFile(null) },
    onError: () => toast.error('Failed to upload photo'),
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  if (isLoading || !form) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>
  )

  const tabs = [
    { id: 'profile', label: 'General Information' },
    { id: 'hours', label: 'Working Hours' },
  ]

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your business profile and preferences</p>
        </div>
        <button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending} className="btn-primary">
          {updateMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {updateMut.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="page-body space-y-6">
        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="space-y-5">
            {/* Photo + branding */}
            <div className="card p-5">
              <h2 className="font-semibold text-foreground mb-4">Business Branding</h2>
              <div className="flex items-start gap-6 flex-wrap">
                <div>
                  <p className="form-label">Business Logo / Photo</p>
                  <div className="relative h-24 w-24 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary transition-colors"
                    onClick={() => document.getElementById('photo-upload')?.click()}>
                    {photoPreview || form.photoUrl ? (
                      <img src={photoPreview || form.photoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                        <Upload size={20} className="text-muted-foreground mx-auto mb-1" />
                        <p className="text-[10px] text-muted-foreground">Click to upload</p>
                      </div>
                    )}
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </div>
                  {photoFile && (
                    <button onClick={() => photoMut.mutate(photoFile)} disabled={photoMut.isPending}
                      className="btn-primary text-xs py-1.5 mt-2 w-24 justify-center">
                      {photoMut.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Upload'}
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-[200px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Business Name</label>
                    <div className="relative">
                      <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} className="form-input pl-9" />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="form-input">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Description</label>
                    <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Tell customers about your business…" className="form-input resize-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact + Location */}
            <div className="card p-5">
              <h2 className="font-semibold text-foreground mb-4">Contact &amp; Location</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="form-input pl-9" placeholder="0712 345 678" />
                  </div>
                </div>
                <div>
                  <label className="form-label">WhatsApp Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} className="form-input pl-9" placeholder="0712 345 678" />
                  </div>
                </div>
                <div>
                  <label className="form-label">County</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <select value={form.county || ''} onChange={e => set('county', e.target.value)} className="form-input pl-9">
                      {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Location / Estate</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input value={form.location || ''} onChange={e => set('location', e.target.value)} className="form-input pl-9" placeholder="e.g. Westlands, Nairobi" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'hours' && (
          <div className="card p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={18} className="text-primary" /> Working Hours
            </h2>
            <div className="space-y-3">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                <div key={day} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                  <span className="w-24 text-sm font-medium text-foreground">{day}</span>
                  <input placeholder="8:00 AM" className="form-input w-32 text-sm" />
                  <span className="text-muted-foreground text-sm">to</span>
                  <input placeholder="6:00 PM" className="form-input w-32 text-sm" />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer ml-auto">
                    <input type="checkbox" className="rounded" />
                    Closed
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
