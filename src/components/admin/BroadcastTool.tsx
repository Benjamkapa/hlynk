import { useState, useRef, useEffect } from 'react'
import { Send, Bell, Users, User, Star, X, Loader2, Search, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '../../lib/api/client'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'

export default function BroadcastTool() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [target, setTarget] = useState<'all' | 'specific' | 'review'>('all')
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<'info' | 'warning' | 'success'>('info')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Suggestions search query
  const { data: suggestionsRes, isLoading: searching } = useQuery({
    queryKey: ['broadcast-user-search', searchQuery],
    queryFn: () => api.get('/notifications/search-users', { params: { query: searchQuery } }).then(r => r.data),
    enabled: target === 'specific' && searchQuery.trim().length >= 2,
    staleTime: 30000
  })

  const suggestions = suggestionsRes?.items || []

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addEmail = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails([...selectedEmails, email])
    }
  }

  const removeEmail = (email: string) => {
    setSelectedEmails(selectedEmails.filter(e => e !== email))
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (target === 'review') {
      setSending(true)
      try {
        const res = await api.post('/notifications/broadcast', {
          target: 'all',
          title: '⭐ Share Your Experience',
          message: "We'd love to hear how hlynk is helping your business. Tap to leave a quick rating — it takes less than a minute!",
          type: 'review_request',
        })
        toast.success(res.data.message || 'Review request sent to all vendors')
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to send review request')
      } finally {
        setSending(false)
      }
      return
    }

    if (!title.trim()) return toast.error('Please enter a notification title')
    if (!message.trim()) return toast.error('Please enter message content')

    let finalEmails = selectedEmails
    if (target === 'specific') {
      if (finalEmails.length === 0) {
        if (searchQuery.trim().includes('@')) {
          finalEmails = [searchQuery.trim()]
        } else {
          return toast.error('Please select at least one vendor recipient')
        }
      }
    }

    setSending(true)
    try {
      const res = await api.post('/notifications/broadcast', {
        target,
        emails: target === 'specific' ? finalEmails : undefined,
        title: title.trim(),
        message: message.trim(),
        type
      })
      toast.success(res.data.message || 'Broadcast sent successfully')
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
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden transition-all duration-200">
      {/* Header bar */}
      <div className="px-5 py-3.5 border-b border-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Broadcast Messaging</h3>
            <p className="text-xs text-gray-400">Push in-app notices and device notifications to vendors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Audience Selector */}
          <div className="inline-flex p-1 bg-gray-50 rounded-lg border border-gray-100 text-xs">
            <button
              type="button"
              onClick={() => { setTarget('all'); setIsCollapsed(false); }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                target === 'all'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Users size={13} />
              <span>All Vendors</span>
            </button>
            <button
              type="button"
              onClick={() => { setTarget('specific'); setIsCollapsed(false); }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                target === 'specific'
                  ? 'bg-white text-gray-900 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <User size={13} />
              <span>Specific Target</span>
            </button>
            <button
              type="button"
              onClick={() => { setTarget('review'); setIsCollapsed(false); }}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-medium ${
                target === 'review'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Star size={13} className="text-amber-500" />
              <span>Review Prompt</span>
            </button>
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!isCollapsed && (
        <div className="p-5 animate-in fade-in duration-200">
          {target === 'review' ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-lg flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-900">Platform Review Invitation</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Sends an automated prompt to all registered vendors inviting them to review their experience on hlynk. Vendors can submit ratings directly from their dashboard.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={sending}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Star size={13} className="fill-white" />}
                  <span>{sending ? 'Sending Prompt...' : 'Send Review Request to All'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              {/* Target info / recipient picker */}
              {target === 'specific' ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-gray-700">Target Recipients</label>
                    {selectedEmails.length > 0 && (
                      <span className="text-[11px] text-gray-400">{selectedEmails.length} selected</span>
                    )}
                  </div>

                  {/* Selected recipient chips */}
                  {selectedEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border border-gray-100 rounded-lg">
                      {selectedEmails.map(email => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-800 rounded-md text-xs border border-gray-200 shadow-xs"
                        >
                          <span className="truncate max-w-[220px]">{email}</span>
                          <button
                            type="button"
                            onClick={() => removeEmail(email)}
                            className="text-gray-400 hover:text-gray-700"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedEmails([])}
                        className="text-[11px] text-gray-400 hover:text-red-600 px-2 py-1 transition-colors self-center"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Search input with live suggestion popover */}
                  <div className="relative" ref={searchRef}>
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => {
                        setSearchQuery(e.target.value)
                        setIsDropdownOpen(true)
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Type vendor business name or email to search..."
                      className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                    />
                    {searching && (
                      <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                    )}

                    {isDropdownOpen && suggestions.length > 0 && searchQuery.trim().length >= 2 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-52 overflow-y-auto divide-y divide-gray-50">
                        {suggestions.map((u: any) => {
                          const isSelected = selectedEmails.includes(u.email)
                          return (
                            <button
                              key={u.id || u.email}
                              type="button"
                              onClick={() => {
                                if (!isSelected) addEmail(u.email)
                                setSearchQuery('')
                                setIsDropdownOpen(false)
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-xs transition-colors"
                            >
                              <div className="truncate pr-2">
                                <p className="font-medium text-gray-900 truncate">{u.name}</p>
                                <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                              </div>
                              {isSelected ? (
                                <Check size={14} className="text-emerald-600 shrink-0" />
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold shrink-0">Add</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                  <Users size={14} className="text-emerald-600 shrink-0" />
                  <span>Audience: <strong>All registered vendors</strong> will receive this message.</span>
                </div>
              )}

              {/* Title & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-700">Notice Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Scheduled System Maintenance"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Severity</label>
                  <div className="grid grid-cols-3 gap-1 h-[34px] p-0.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setType('info')}
                      className={`rounded-md flex items-center justify-center font-medium text-[11px] transition-all ${
                        type === 'info' ? 'bg-white text-blue-600 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Info
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('warning')}
                      className={`rounded-md flex items-center justify-center font-medium text-[11px] transition-all ${
                        type === 'warning' ? 'bg-white text-amber-600 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Warning
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('success')}
                      className={`rounded-md flex items-center justify-center font-medium text-[11px] transition-all ${
                        type === 'success' ? 'bg-white text-emerald-600 shadow-xs font-semibold' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      Success
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Message Content</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write message details for the notification..."
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-t border-gray-50">
                <span className="text-[11px] text-gray-400">
                  Delivered to in-app notification center and push notifications
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>{sending ? 'Broadcasting...' : 'Send Broadcast'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
