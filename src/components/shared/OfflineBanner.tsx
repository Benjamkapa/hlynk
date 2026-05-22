import { CloudOff, RefreshCcw, Wifi } from 'lucide-react'
import { useOfflineStatus } from '../../lib/offline/useOfflineStatus'

export default function OfflineBanner() {
  const { isOnline, pendingCount } = useOfflineStatus()

  if (isOnline && pendingCount === 0) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] px-4 py-2 flex items-center justify-center gap-3 animate-in slide-in-from-top duration-500 shadow-lg ${
      !isOnline 
        ? 'bg-rose-600 text-white' 
        : 'bg-emerald-600 text-white'
    }`}>
      {!isOnline ? (
        <>
          <CloudOff size={16} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">You are currently offline</span>
        </>
      ) : (
        <>
          <Wifi size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Back online</span>
        </>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
          <RefreshCcw size={12} className="animate-spin-slow" />
          <span className="text-[10px] font-bold hl-mono uppercase">{pendingCount} Pending Sync</span>
        </div>
      )}
    </div>
  )
}
