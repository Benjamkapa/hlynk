import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save, Upload, MapPin, Phone, Clock, Briefcase, Info, ExternalLink, Globe, Layout } from 'lucide-react'
import { providersApi } from '../../lib/api/providers'
import { PROVIDER_CSS } from '../admin/hl-design-system'

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
  const [tab, setTab] = useState<'profile' | 'hours' | 'appearance'>('profile')
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-profile'] }); toast.success('Profile preferences updated') },
    onError: () => toast.error('Synchronization failed'),
  })

  const photoMut = useMutation({
    mutationFn: (file: File) => providersApi.uploadPhoto(file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['provider-profile'] }); toast.success('Brand asset updated'); setPhotoFile(null) },
    onError: () => toast.error('Upload failed'),
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }))

  if (isLoading || !form) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
       <Loader2 size={32} style={{ animation: 'hl-spin .7s linear infinite', color: 'var(--mint)' }} />
    </div>
  )

  const tabs = [
    { id: 'profile', label: 'BUSINESS IDENTITY', icon: Briefcase },
    { id: 'hours', label: 'OPERATIONAL WINDOWS', icon: Clock },
    { id: 'appearance', label: 'PUBLIC PRESENCE', icon: Layout },
  ]

  return (
    <>
      <style>{PROVIDER_CSS}</style>
      <div className="hl-dash" style={{ padding: '28px 32px 60px' }}>
        
        <div className="hl-page-header">
          <div>
            <h1 className="hl-page-title">Profile Configuration</h1>
            <p className="hl-page-subtitle">Standardize your brand identity across the HudumaLynk network</p>
          </div>
          <button onClick={() => updateMut.mutate(form)} disabled={updateMut.isPending} className="hl-btn-primary" style={{ minWidth: 160, justifyContent: 'center' }}>
            {updateMut.isPending ? <Loader2 size={16} style={{ animation: 'hl-spin .7s linear infinite' }} /> : <Save size={16} />}
            {updateMut.isPending ? 'SYNCHRONIZING' : 'SAVE CONFIGURATION'}
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, background: 'var(--surface2)', padding: '6px', borderRadius: 14, border: '1px solid var(--border)', width: 'fit-content' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              style={{ 
                padding: '10px 18px', borderRadius: 10, fontSize: '.68rem', fontWeight: 900, transition: 'all .25s', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                background: tab === t.id ? 'var(--mint)' : 'transparent',
                color: tab === t.id ? '#fff' : 'var(--ink3)',
                boxShadow: tab === t.id ? '0 4px 12px rgba(29,186,135,.15)' : 'none'
              }}>
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ maxWidth: 880 }}>
          {tab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'hl-up .4s ease both' }}>
              
              {/* Branding Section */}
              <div className="hl-card">
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Briefcase size={16} color="var(--mint)" />
                      <h3>Core Brand Identity</h3>
                   </div>
                </div>
                <div className="hl-card-body" style={{ padding: '28px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 32 }}>
                    <div>
                      <p className="hl-form-label" style={{ marginBottom: 12 }}>Brand Asset</p>
                      <div className="hl-input-wrap" style={{ position: 'relative', width: 120, height: 120, borderRadius: 16, overflow: 'hidden', border: '2px dashed var(--border)', background: 'var(--surface2)', cursor: 'pointer' }}
                        onClick={() => document.getElementById('photo-upload')?.click()}>
                        {photoPreview || form.photoUrl ? (
                          <img src={photoPreview || form.photoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)' }}>
                            <Upload size={24} />
                            <span style={{ fontSize: '.5rem', fontWeight: 900, marginTop: 4 }}>UPLOAD LOGO</span>
                          </div>
                        )}
                        <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                      </div>
                      {photoFile && (
                        <button onClick={(e) => { e.stopPropagation(); photoMut.mutate(photoFile) }} disabled={photoMut.isPending}
                          className="hl-btn-primary" style={{ width: 120, height: 32, padding: 0, justifyContent: 'center', fontSize: '.6rem', marginTop: 12, borderRadius: 8 }}>
                          {photoMut.isPending ? <Loader2 size={12} style={{ animation: 'hl-spin .7s linear infinite' }} /> : 'COMMIT UPLOAD'}
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="hl-form-label">Commercial Entity Name</label>
                        <input value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} className="hl-form-input" style={{ borderRadius: 12 }} />
                      </div>
                      <div>
                        <label className="hl-form-label">Primary Industry Category</label>
                        <select value={form.category || ''} onChange={e => set('category', e.target.value)} className="hl-form-input" style={{ borderRadius: 12 }}>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="hl-form-label">Official Phone Terminal</label>
                        <div className="hl-input-wrap">
                           <span className="hl-input-icon"><Phone size={14} /></span>
                           <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} className="hl-form-input icon-left" style={{ borderRadius: 12 }} />
                        </div>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label className="hl-form-label">Business Narrative</label>
                        <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe your unique value proposition…" className="hl-form-input" style={{ borderRadius: 12, resize: 'none' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geographic Data */}
              <div className="hl-card">
                <div className="hl-card-header" style={{ background: 'var(--surface2)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MapPin size={16} color="var(--mint)" />
                      <h3>Geographic Presence</h3>
                   </div>
                </div>
                <div className="hl-card-body" style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div>
                    <label className="hl-form-label">County Jurisdiction</label>
                    <select value={form.county || ''} onChange={e => set('county', e.target.value)} className="hl-form-input" style={{ borderRadius: 12 }}>
                      {KENYA_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="hl-form-label">Precise Estate / Building</label>
                    <div className="hl-input-wrap">
                      <span className="hl-input-icon"><MapPin size={14} /></span>
                      <input value={form.location || ''} onChange={e => set('location', e.target.value)} className="hl-form-input icon-left" style={{ borderRadius: 12 }} placeholder="e.g. Westlands Commercial Center" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'hours' && (
            <div className="hl-card" style={{ animation: 'hl-up .4s ease both' }}>
              <div className="hl-card-header" style={{ background: 'var(--surface2)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock size={16} color="var(--mint)" />
                    <h3>Service Availability Windows</h3>
                 </div>
              </div>
              <div className="hl-card-body" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 20px', borderRadius: 12, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <span style={{ width: 100, fontSize: '.75rem', fontWeight: 900, color: 'var(--ink)' }}>{day.toUpperCase()}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                        <input placeholder="08:00 AM" className="hl-form-input" style={{ width: 120, height: 36, fontSize: '.75rem', borderRadius: 8, textAlign: 'center' }} />
                        <span style={{ fontSize: '.6rem', fontWeight: 900, color: 'var(--ink3)' }}>TO</span>
                        <input placeholder="06:00 PM" className="hl-form-input" style={{ width: 120, height: 36, fontSize: '.75rem', borderRadius: 8, textAlign: 'center' }} />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--mint)' }} />
                        <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)' }}>CLOSED</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'hl-up .4s ease both' }}>
               <div className="hl-card" style={{ padding: '32px', textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                     <Globe size={32} color="var(--mint)" />
                  </div>
                  <h3 style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 12 }}>Public Profile Visuals</h3>
                  <p style={{ color: 'var(--ink3)', fontSize: '.88rem', maxWidth: 440, margin: '0 auto 28px', lineHeight: 1.6 }}>
                    This section allows you to customize how your business appears to potential customers on the public directory. Changes here impact your brand conversion rate.
                  </p>
                  <button className="hl-btn-outline" style={{ margin: '0 auto' }}>
                     <ExternalLink size={14} /> VIEW PUBLIC PROFILE
                  </button>
               </div>

               <div style={{ padding: '20px', borderRadius: 16, border: '1px dashed var(--border)', background: 'var(--surface2)', display: 'flex', gap: 14 }}>
                  <Info size={20} color="var(--ink3)" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500, lineHeight: 1.5 }}>
                    <strong>Privacy Note:</strong> Your contact information is only visible to registered customers who initiate a service request. 
                    Standard public viewers see only your business narrative and general location.
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
