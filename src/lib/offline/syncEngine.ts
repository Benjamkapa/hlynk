import { getPendingSales, removePendingSale, updatePendingSale, countPendingSales } from './db'
import { salesApi } from '../api/providers'
import { toast } from 'sonner'

class SyncEngine {
  private isSyncing = false
  private syncInterval: number | null = null

  start() {
    if (this.syncInterval) return
    
    // Check for sync every 30 seconds if online
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.sync()
      }
    }, 30000)

    // Also sync immediately when coming online
    window.addEventListener('online', () => {
      toast.info('Back online! Syncing pending transactions...')
      this.sync()
    })
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async sync() {
    if (this.isSyncing || !navigator.onLine) return
    
    const pending = await getPendingSales()
    if (pending.length === 0) return

    this.isSyncing = true
    console.log(`[SyncEngine] Starting sync of ${pending.length} sales.`)

    for (const sale of pending) {
      try {
        await salesApi.create(sale.payload)
        await removePendingSale(sale.id)
        console.log(`[SyncEngine] Successfully synced sale ${sale.id}`)
      } catch (error) {
        console.error(`[SyncEngine] Failed to sync sale ${sale.id}:`, error)
        
        // Update retry count
        sale.retries = (sale.retries || 0) + 1
        sale.lastError = error instanceof Error ? error.message : 'Unknown error'
        
        if (sale.retries > 5) {
          // Maybe let the user know this specific one is stuck
          toast.error(`Sale from ${new Date(sale.createdAt).toLocaleString()} failed to sync after multiple attempts.`)
        }
        
        await updatePendingSale(sale)
      }
    }

    this.isSyncing = false
    const remaining = await countPendingSales()
    if (remaining === 0) {
      toast.success('All offline transactions synced successfully!')
    }
  }
}

export const syncEngine = new SyncEngine()
