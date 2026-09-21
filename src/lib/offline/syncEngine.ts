import { getPendingSales, removePendingSale, updatePendingSale, countPendingSales } from './db'
import { salesApi } from '../api/providers'
import { toast } from 'sonner'

class SyncEngine {
  private isSyncing = false
  private syncInterval: number | null = null

  start() {
    if (this.syncInterval) return
    
    // Initial check
    this.flush()

    // Listen to network changes
    window.addEventListener('online', () => {
      this.flush()
    })

    // Periodic check every 15 seconds
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) this.flush()
    }, 15000)
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async flush(): Promise<boolean> {
    if (this.isSyncing || !navigator.onLine) return false
    
    const pending = await getPendingSales()
    if (pending.length === 0) return true

    this.isSyncing = true
    console.log(`[SyncEngine] Syncing ${pending.length} offline transactions...`)
    toast.info(`Syncing ${pending.length} offline transaction(s)...`)

    let successCount = 0
    for (const sale of pending) {
      try {
        await salesApi.create(sale.payload)
        await removePendingSale(sale.id)
        successCount++
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.warn('[SyncEngine] Auth required for sync. Redirecting to login.')
          this.isSyncing = false
          window.location.href = '/login'
          return false
        }
        sale.retries = (sale.retries || 0) + 1
        sale.lastError = error instanceof Error ? error.message : 'Unknown error'
        await updatePendingSale(sale)
      }
    }

    this.isSyncing = false
    const remaining = await countPendingSales()
    if (remaining === 0) {
      toast.success('All offline transactions synced successfully!')
    } else if (successCount > 0) {
      toast.warning(`${successCount} synced, ${remaining} pending sync.`)
    }
    return remaining === 0
  }
}

export const syncEngine = new SyncEngine()
