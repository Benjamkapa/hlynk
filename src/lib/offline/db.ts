/**
 * hlynk Offline DB — IndexedDB wrapper
 * Stores: pendingSales | inventoryCache | customerCache
 */

const DB_NAME = 'hlynk-offline'
const DB_VERSION = 1

export interface PendingSale {
  id: string          // client-generated UUID
  createdAt: number   // Date.now()
  payload: {
    items: { productId: string; name: string; quantity: number; price: number }[]
    paymentMethod: string
    totalAmount: number
    customerId: string | null
    customerName: string | null
    customerPhone?: string
    status: number
  }
  retries: number
  lastError?: string
}

export interface CachedProduct {
  id: string
  name: string
  price: number | string
  stockLevel: number
  category: string
  type: string
  imageUrl?: string
}

export interface CachedCustomer {
  id: string
  name: string
  phone?: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains('pendingSales')) {
        const store = db.createObjectStore('pendingSales', { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }
      if (!db.objectStoreNames.contains('inventoryCache')) {
        db.createObjectStore('inventoryCache', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('customerCache')) {
        db.createObjectStore('customerCache', { keyPath: 'id' })
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Pending Sales ──────────────────────────────────────────────────────────────

export async function enqueueSale(sale: PendingSale): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSales', 'readwrite')
    tx.objectStore('pendingSales').put(sale)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getPendingSales(): Promise<PendingSale[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSales', 'readonly')
    const req = tx.objectStore('pendingSales').index('createdAt').getAll()
    req.onsuccess = () => resolve(req.result as PendingSale[])
    req.onerror = () => reject(req.error)
  })
}

export async function removePendingSale(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSales', 'readwrite')
    tx.objectStore('pendingSales').delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function updatePendingSale(sale: PendingSale): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSales', 'readwrite')
    tx.objectStore('pendingSales').put(sale)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function countPendingSales(): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingSales', 'readonly')
    const req = tx.objectStore('pendingSales').count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// ── Inventory Cache ────────────────────────────────────────────────────────────

export async function cacheInventory(products: CachedProduct[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventoryCache', 'readwrite')
    const store = tx.objectStore('inventoryCache')
    store.clear()
    products.forEach(p => store.put(p))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedInventory(): Promise<CachedProduct[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('inventoryCache', 'readonly')
    const req = tx.objectStore('inventoryCache').getAll()
    req.onsuccess = () => resolve(req.result as CachedProduct[])
    req.onerror = () => reject(req.error)
  })
}

// ── Customer Cache ─────────────────────────────────────────────────────────────

export async function cacheCustomers(customers: CachedCustomer[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customerCache', 'readwrite')
    const store = tx.objectStore('customerCache')
    store.clear()
    customers.forEach(c => store.put(c))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getCachedCustomers(): Promise<CachedCustomer[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customerCache', 'readonly')
    const req = tx.objectStore('customerCache').getAll()
    req.onsuccess = () => resolve(req.result as CachedCustomer[])
    req.onerror = () => reject(req.error)
  })
}
