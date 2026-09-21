import { CloudOff, RefreshCcw, Wifi } from 'lucide-react'
import { useOfflineStatus } from '../../lib/offline/useOfflineStatus'

export default function OfflineBanner() {
  const { isOnline, pendingCount, requiresAuthForSync } = useOfflineStatus()

  if (isOnline && pendingCount === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none flex flex-col items-end gap-2">
      <div className={`px-4 py-2 rounded-full flex items-center justify-center gap-2 animate-in slide-in-from-right-4 duration-500 shadow-xl border pointer-events-auto ${
        !isOnline 
          ? 'bg-white text-rose-600 border-rose-100' 
          : 'bg-white text-emerald-600 border-emerald-100'
      }`}>
        {!isOnline ? (
          <>
            <CloudOff size={14} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Offline</span>
          </>
        ) : (
          <>
            <Wifi size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Online</span>
          </>
        )}
      </div>

      {pendingCount > 0 && (
        <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg border text-xs font-bold uppercase tracking-wider ${
          requiresAuthForSync && isOnline
            ? 'bg-amber-500 text-white border-amber-400 animate-bounce'
            : 'bg-slate-900/90 backdrop-blur-md text-white border-slate-700'
        }`}>
          <RefreshCcw size={12} className={!requiresAuthForSync ? "animate-spin" : ""} />
          <span>{pendingCount} Pending Sync {requiresAuthForSync && isOnline ? '(Auth Required)' : ''}</span>
        </div>
      )}
    </div>
  )
}
