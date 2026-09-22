import {
  getPendingSales, removePendingSale, updatePendingSale, countPendingSales,
  getPendingResources, removePendingResource,
  getPendingEvents, removePendingEvent,
  getPendingOperations, removePendingOperation
} from './db'
import { salesApi } from '../api/providers'
import { resourcesApi, eventsApi, operationsApi } from '../api/universal'
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
    
    const [pendingSales, pendingRes, pendingEvt, pendingOps] = await Promise.all([
      getPendingSales(),
      getPendingResources(),
      getPendingEvents(),
      getPendingOperations(),
    ])

    const totalPending = pendingSales.length + pendingRes.length + pendingEvt.length + pendingOps.length
    if (totalPending === 0) return true

    this.isSyncing = true
    console.log(`[SyncEngine] Syncing ${totalPending} offline records...`)
    toast.info(`Syncing ${totalPending} offline record(s)...`)

    let successCount = 0

    // 1. Flush Sales
    for (const sale of pendingSales) {
      try {
        await salesApi.create(sale.payload)
        await removePendingSale(sale.id)
        successCount++
      } catch (error: any) {
        if (error.response?.status === 401) {
          this.isSyncing = false
          window.location.href = '/login'
          return false
        }
        sale.retries = (sale.retries || 0) + 1
        sale.lastError = error instanceof Error ? error.message : 'Unknown error'
        await updatePendingSale(sale)
      }
    }

    // 2. Flush Hospitality Resources
    for (const item of pendingRes) {
      try {
        if (item.action === 'CREATE') {
          await resourcesApi.createResource(item.payload)
        } else if (item.action === 'UPDATE' && item.targetId) {
          await resourcesApi.updateResource(item.targetId, item.payload)
        } else if (item.action === 'DELETE' && item.targetId) {
          await resourcesApi.deleteResource(item.targetId)
        }
        await removePendingResource(item.id)
        successCount++
      } catch (err: any) {
        console.error('[SyncEngine] Failed resource sync:', err)
      }
    }

    // 3. Flush Hospitality Events (Bookings)
    for (const item of pendingEvt) {
      try {
        if (item.action === 'CREATE') {
          await eventsApi.createEvent(item.payload)
        } else if (item.action === 'UPDATE' && item.targetId) {
          await eventsApi.updateStatus(item.targetId, item.payload.status)
        } else if (item.action === 'RECORD_PAYMENT' && item.targetId) {
          await eventsApi.recordPayment(item.targetId, item.payload)
        }
        await removePendingEvent(item.id)
        successCount++
      } catch (err: any) {
        console.error('[SyncEngine] Failed event sync:', err)
      }
    }

    // 4. Flush Hospitality Tasks (Operations)
    for (const item of pendingOps) {
      try {
        if (item.action === 'CREATE') {
          await operationsApi.createOperation(item.payload)
        } else if (item.action === 'UPDATE' && item.targetId) {
          await operationsApi.updateOperation(item.targetId, item.payload)
        }
        await removePendingOperation(item.id)
        successCount++
      } catch (err: any) {
        console.error('[SyncEngine] Failed operation sync:', err)
      }
    }

    this.isSyncing = false
    const remainingSales = await countPendingSales()
    const remainingRes = (await getPendingResources()).length
    const remainingEvt = (await getPendingEvents()).length
    const remainingOps = (await getPendingOperations()).length
    const remainingTotal = remainingSales + remainingRes + remainingEvt + remainingOps

    if (remainingTotal === 0) {
      toast.success('All offline records synced successfully!')
    } else if (successCount > 0) {
      toast.warning(`${successCount} synced, ${remainingTotal} pending sync.`)
    }
    return remainingTotal === 0
  }
}

export const syncEngine = new SyncEngine()

