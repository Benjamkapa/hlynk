type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'>

const memoryStore = new Map<string, string>()

const memoryStorage: StorageLike = {
  getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key)! : null
  },
  setItem(key, value) {
    memoryStore.set(key, value)
  },
  removeItem(key) {
    memoryStore.delete(key)
  },
  clear() {
    memoryStore.clear()
  },
}

function canUseLocalStorage() {
  if (typeof window === 'undefined') return false

  try {
    const probe = '__hl_storage_probe__'
    window.localStorage.setItem(probe, probe)
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export const storage: StorageLike = canUseLocalStorage() ? window.localStorage : memoryStorage
