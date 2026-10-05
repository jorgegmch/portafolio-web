export type StorageKind = 'local' | 'session'

// El simple acceso a window.localStorage puede lanzar (cookies bloqueadas,
// iframes restringidos), así que también va dentro del try.
const getStorage = (kind: StorageKind): Storage | null => {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

/**
 * Web Storage que nunca lanza: si el almacenamiento está bloqueado o lleno,
 * las lecturas devuelven null y las escrituras no hacen nada.
 */
export const safeStorage = {
  get(kind: StorageKind, key: string): string | null {
    try {
      return getStorage(kind)?.getItem(key) ?? null
    } catch {
      return null
    }
  },

  /** Devuelve true si el valor quedó guardado. */
  set(kind: StorageKind, key: string, value: string): boolean {
    try {
      const storage = getStorage(kind)
      if (!storage) return false
      storage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },

  remove(kind: StorageKind, key: string): void {
    try {
      getStorage(kind)?.removeItem(key)
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
  },
}
