import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      // console.log('SW Registered:', r)
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  useEffect(() => {
    if (offlineReady) {
      // toast.success('App is ready for offline use!')
      setOfflineReady(false)
    }
  }, [offlineReady])

  useEffect(() => {
    if (needRefresh) {
      toast('Update Available', {
        description: 'A new version is available. Click to reload.',
        action: {
          label: 'Update',
          onClick: () => updateServiceWorker(true),
        },
        duration: Infinity,
        icon: <RefreshCw className="h-4 w-4 animate-spin text-emerald-600" />,
        onDismiss: () => setNeedRefresh(false),
      })
    }
  }, [needRefresh, updateServiceWorker])

  return null
}
