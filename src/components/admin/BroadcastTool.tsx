import { useState, useEffect } from 'react'
import { Send, Bell, Mail, Users, Info, AlertTriangle, CheckCircle2, Loader2, Search, X } from 'lucide-react'
import { api } from '../../lib/api/client'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

export default function BroadcastTool() {
  const [target, setTarget] = useState<'all' | 'specific'>('all')
  const [emails, setEmails] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'error'>('info')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch suggestions based on search query
  const { data: suggestionsRes, isLoading: searching } = useQuery({
    queryKey: ['broadcast-user-search', searchQuery],
    queryFn: () => api.get('/notifications/search-users', { params: { query: searchQuery } }).then(r => r.data),
    enabled: target === 'specific' && searchQuery.length >= 2,
    staleTime: 60000
  })

  const suggestions = suggestionsRes?.items || []

  // Fetch all vendors for the "Quick Pick" list
  const { data: allVendorsRes } = useQuery({
    queryKey: ['all-vendors-list'],
    queryFn: () => api.get('/notifications/search-users', { params: { query: '' } }).then(r => r.data),
    enabled: target === 'specific',
    staleTime: 300000 // 5 mins
  })

  const allVendors = allVendorsRes?.items || []

  const addEmail = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email])
    }
  }

  const removeEmail = (email: string) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email))
  }

  const handleSend = async () => {
    if (!title || !message) return toast.error('Title and Message are required')
    
    let finalEmails = selectedEmails
    if (target === 'specific' && finalEmails.length === 0) {
      // Fallback to manual entry if they typed something but didn't select
      if (searchQuery.includes('@')) {
        finalEmails = [searchQuery.trim()]
      } else {
        return toast.error('Please provide at least one vendor email')
      }
    }

    setSending(true)
    try {
      const res = await api.post('/notifications/broadcast', {
        target,
        emails: target === 'specific' ? finalEmails : undefined,
        title,
        message,
        type
      })
      toast.success(res.data.message || 'Notification broadcasted successfully')
      
      setTitle('')
      setMessage('')
      setSelectedEmails([])
      setSearchQuery('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send broadcast')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="p-8 border-b border-gray-50 bg-emerald-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Bell size={20} className="text-emerald-400" />
            Platform-Wide Messaging
          </h3>
          <p className="text-emerald-300/60 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Direct In-App & Native Push Broadcast</p>
        </div>
        <Send className="absolute -right-6 -bottom-6 text-white/5 -rotate-12" size={120} />
      </div>

      <div className="p-8 space-y-6">
        <div className="flex gap-4">
          <button
            onClick={() => setTarget('all')}
            className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              target === 'all' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-gray-50 border-gray-100 text-gray-400 grayscale hover:grayscale-0'
            }`}
          >
            <Users size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">To All Vendors</span>
          </button>
          <button
            onClick={() => setTarget('specific')}
            className={`flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              target === 'specific' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-gray-50 border-gray-100 text-gray-400 grayscale hover:grayscale-0'
            }`}
          >
            <Mail size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Specific Targets</span>
          </button>
        </div>

        {target === 'specific' && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Recipients ({selectedEmails.length})</label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl min-h-[50px]">
                {selectedEmails.map(email => (
                  <span key={email} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200 animate-in zoom-in-95">
                    {email}
                    <button onClick={() => removeEmail(email)} className="hover:text-emerald-900"><X size={12} /></button>
                  </span>
                ))}
                {selectedEmails.length === 0 && <span className="text-[10px] text-gray-400 font-bold italic py-1 px-1">Search and select vendors below...</span>}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor by name or email..."
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 shadow-sm"
              />
              {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-600" size={16} />}
              
              {suggestions.length > 0 && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 shadow-2xl z-50 max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest p-3 border-b border-gray-50">Search Results</p>
                  {suggestions.map((u: any) => (
                    <button
                      key={u.id}
                      onClick={() => { addEmail(u.email); setSearchQuery(''); }}
                      className="w-full flex items-center justify-between p-3 hover:bg-emerald-50 rounded-lg transition-all text-left"
                    >
                      <div>
                        <p className="text-xs font-black text-gray-900">{u.name}</p>
                        <p className="text-[10px] text-gray-500 font-bold">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Select from Registry</label>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">All Vendors ({allVendors.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar p-1">
                 {allVendors.map((u: any) => (
                   <button
                    key={u.id}
                    onClick={() => addEmail(u.email)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                      selectedEmails.includes(u.email)
                        ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10'
                        : 'bg-white border-gray-100 hover:border-emerald-200'
                    }`}
                   >
                     <div className="min-w-0 pr-2">
                        <p className="text-[10px] font-black text-gray-900 truncate">{u.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold truncate leading-none mt-1">{u.email}</p>
                     </div>
                     {selectedEmails.includes(u.email) && <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />}
                   </button>
                 ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notification Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. System Maintenance"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notice Severity</label>
            <div className="flex gap-2">
              <TypeButton active={type === 'info'} color="blue" icon={Info} onClick={() => setType('info')} />
              <TypeButton active={type === 'success'} color="emerald" icon={CheckCircle2} onClick={() => setType('success')} />
              <TypeButton active={type === 'warning'} color="amber" icon={AlertTriangle} onClick={() => setType('warning')} />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detailed Content</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/10 min-h-[100px]"
          />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6 group">
          <div className="flex gap-3 items-start">
             <div className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Info size={10} />
             </div>
             <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
               <span className="text-slate-900 font-black">Dual-Delivery Logic:</span> This message will be stored in the vendor's 
               <span className="text-emerald-600"> In-App Inbox</span> and pushed as a 
               <span className="text-emerald-600"> Native Device Notification</span> if they have permissions enabled.
             </p>
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full bg-[#0D4A3E] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0A3D33] transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/10 disabled:opacity-50"
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          {sending ? 'Pushing to Data Nodes...' : 'Initiate Broadcast'}
        </button>
      </div>
    </div>
  )
}

function TypeButton({ active, color, icon: Icon, onClick }: any) {
  const colors: any = {
    blue: active ? 'bg-blue-100 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-400 border-gray-100',
    emerald: active ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-100',
    amber: active ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-100',
  }

  return (
    <button
      onClick={onClick}
      className={`flex-1 p-3 rounded-lg border transition-all flex items-center justify-center ${colors[color]}`}
    >
      <Icon size={16} />
    </button>
  )
}
