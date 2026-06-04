import { useState } from 'react'
import { HardDrive, Search, Trash2, FileText, Image as ImageIcon, ExternalLink, Filter, Database, Loader2, Users, MoreVertical, Shield, LayoutGrid, List, SortAsc, Download, FileCode, CheckCircle2, AlertCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../lib/api/providers'
import { useAuth } from '../../lib/auth/AuthContext'
import { toast } from 'sonner'
import { ConfirmModal } from '../../components/shared/ConfirmModal'

export default function CloudStoragePage() {
  const { user } = useAuth()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [filterFolder, setFilterFolder] = useState('all')
  const [filterType, setFilterType] = useState<'ALL' | 'IMAGE' | 'DOCUMENT'>('ALL')
  const [confirmDelete, setConfirmDelete] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: mediaRes, isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: adminApi.getMedia
  })

  const deleteMutation = useMutation({
    mutationFn: (path: string) => adminApi.deleteMedia(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      toast.success('Media object deleted permanently')
      setConfirmDelete(null)
    },
    onError: () => toast.error('Failed to delete object')
  })

  const media = mediaRes?.data || []
  const folders = ['all', ...new Set(media.map((m: any) => m.folder))] as string[]

  const filteredMedia = media.filter((m: any) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.path.toLowerCase().includes(search.toLowerCase())
    const matchesFolder = filterFolder === 'all' || m.folder === filterFolder
    const matchesType = filterType === 'ALL' || m.type === filterType
    return matchesSearch && matchesFolder && matchesType
  })

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = media.reduce((acc: number, curr: any) => acc + (curr.size || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
             <Shield size={14} />
             <span className="text-[10px] font-black uppercase tracking-widest">Platform Integrity</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Cloud Infrastructure Storage</h1>
          <p className="text-gray-500 font-medium max-w-xl">Centralized media management for identity certificates, product catalogs, and user profiles across the Hlynk ecosystem.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setView('grid')}
                className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <List size={18} />
              </button>
           </div>

           <div className="px-5 py-3 bg-slate-900 text-white rounded-xl border border-white/10 flex items-center gap-4">
              <div className="flex flex-col border-r border-white/10 pr-4">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Size</span>
                 <span className="text-sm font-black hl-mono leading-none">{formatSize(totalSize)}</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">File Count</span>
                 <span className="text-sm font-black hl-mono leading-none">{media.length}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-2xl border border-gray-100 shadow-sm space-y-8">
             
             {/* Search */}
             <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Global Search</p>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
                  <input 
                    type="text"
                    placeholder="Search files..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl text-xs font-black focus:border-emerald-500/10 focus:bg-white focus:ring-0 outline-none transition-all"
                  />
                </div>
             </div>

             {/* Type Filter */}
             <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Content Type</p>
                <div className="flex flex-col gap-1.5">
                   {(['ALL', 'IMAGE', 'DOCUMENT'] as const).map(t => (
                     <button 
                       key={t}
                       onClick={() => setFilterType(t)}
                       className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
                     >
                        {t === 'ALL' ? <Database size={14} /> : t === 'IMAGE' ? <ImageIcon size={14} /> : <FileText size={14} />}
                        {t.toLowerCase()}
                     </button>
                   ))}
                </div>
             </div>

             {/* Folder Filter */}
             <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Directory Root</p>
                   <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">MinIO</span>
                </div>
                <div className="space-y-1">
                   {folders.map(f => (
                     <button 
                       key={f}
                       onClick={() => setFilterFolder(f)}
                       className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between ${filterFolder === f ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                     >
                       <span className="flex items-center gap-2">
                          <HardDrive size={13} className={filterFolder === f ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-500'} />
                          {f}
                       </span>
                       <span className={`text-[10px] font-bold hl-mono ${filterFolder === f ? 'text-emerald-400/50' : 'text-slate-300'}`}>
                          {f === 'all' ? media.length : media.filter((m: any) => m.folder === f).length}
                       </span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="pt-4 mt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                   <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 size={16} />
                   </div>
                   <p className="text-[10px] text-emerald-800 font-bold leading-tight">
                      Storage Node: <span className="uppercase">Operational</span>
                      <br/>
                      <span className="text-emerald-600/60 font-medium">Cluster ID: HLYNK-X12</span>
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-40 flex flex-col items-center justify-center space-y-6">
               <div className="relative">
                  <Loader2 size={60} className="animate-spin text-emerald-500 opacity-20" />
                  <Database size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600 animate-pulse" />
               </div>
               <div className="text-center">
                  <p className="text-lg font-black text-slate-900 tracking-tight">Syncing Storage State...</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Establishing Secure Connection to MinIO Cluster</p>
               </div>
            </div>
          ) : filteredMedia.length > 0 ? (
            
            view === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredMedia.map((file: any) => (
                   <div key={file.path} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-slate-200/40 transition-all hover:-translate-y-1.5 flex flex-col h-full">
                      <div className="aspect-video bg-slate-50 relative overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                         {file.type === 'IMAGE' ? (
                           <img src={file.url} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out" />
                         ) : (
                            <div className="flex flex-col items-center gap-3">
                               <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border-2 ${file.folder === 'certs' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                  {file.name.endsWith('.pfx') ? <Shield size={32} /> : <FileText size={32} />}
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{file.name.split('.').pop()} document</span>
                            </div>
                         )}
                         
                         <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 translate-y-4 group-hover:translate-y-0 duration-300">
                             <a href={file.url} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-xl bg-white text-slate-900 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shadow-xl">
                                <ExternalLink size={18} />
                             </a>
                             <button onClick={() => setConfirmDelete(file)} className="h-10 w-10 rounded-xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all shadow-xl">
                                <Trash2 size={18} />
                             </button>
                         </div>
                      </div>
                      <div className="p-6 space-y-4 flex flex-col flex-1">
                         <div className="space-y-1">
                            <p className="text-sm font-black text-slate-900 truncate tracking-tight group-hover:text-emerald-700 transition-colors uppercase leading-none mb-1">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold hl-mono truncate flex items-center gap-1.5">
                               <SortAsc size={10} className="text-slate-300" />
                               {file.path}
                            </p>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-50">
                            <div>
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Owner</p>
                               <span className="text-[10px] font-black text-slate-600 flex items-center gap-1.5 uppercase tracking-tighter truncate">
                                  <Users size={10} className="text-blue-400" />
                                  {file.ownerName || 'General / Platform'}
                               </span>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Size</p>
                               <span className="text-[10px] font-black text-slate-900 hl-mono">{formatSize(file.size)}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Name</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Owner</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Util</th>
                          <th className="px-8 py-5"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filteredMedia.map((file: any) => (
                         <tr key={file.path} className="group hover:bg-slate-50/70 transition-all">
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                     {file.type === 'IMAGE' ? <ImageIcon size={18} className="text-emerald-500" /> : <FileText size={18} className="text-blue-500" />}
                                  </div>
                                  <div className="min-w-0">
                                     <p className="text-xs font-black text-slate-900 truncate uppercase">{file.name}</p>
                                     <p className="text-[10px] text-slate-400 font-bold hl-mono mt-0.5 truncate max-w-[200px]">{file.path}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest">{file.folder}</span>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`text-[10px] font-black flex items-center gap-1.5 ${file.type === 'IMAGE' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                  {file.type}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{file.ownerName || 'General / Platform'}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <span className="text-[10px] font-black text-slate-900 hl-mono">{formatSize(file.size)}</span>
                            </td>
                            <td className="px-8 py-4 text-right">
                               <div className="flex items-center justify-end gap-2 pr-2">
                                  <a href={file.url} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-emerald-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-emerald-100 shadow-none hover:shadow-lg">
                                     <ExternalLink size={16} />
                                  </a>
                                  <button onClick={() => setConfirmDelete(file)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-red-100 shadow-none hover:shadow-lg">
                                     <Trash2 size={16} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            )
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-40 flex flex-col items-center justify-center text-center">
               <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-8 border border-white">
                  <AlertCircle size={48} className="animate-pulse" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">Zero Assets Discovered</h3>
               <p className="text-sm text-slate-400 font-medium max-w-sm">No storage objects matched your current filter criteria in the storage node.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && deleteMutation.mutate(confirmDelete.path)}
        title="Destroy Cloud Object?"
        message={`This action will permanently purge '${confirmDelete?.name}' from the Hlynk storage cluster. Live links will break immediately.`}
        confirmText="Confirm Purge"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
