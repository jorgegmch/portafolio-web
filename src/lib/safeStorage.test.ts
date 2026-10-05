import { afterEach, describe, expect, it, vi } from 'vitest'
import { safeStorage } from '@/lib/safeStorage'

const fail = () => {
  throw new DOMException('bloqueado', 'SecurityError')
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('safeStorage', () => {
  it.each(['local', 'session'] as const)('lee, escribe y borra en %s', (kind) => {
    expect(safeStorage.get(kind, 'clave')).toBeNull()
    expect(safeStorage.set(kind, 'clave', 'valor')).toBe(true)
    expect(safeStorage.get(kind, 'clave')).toBe('valor')
    safeStorage.remove(kind, 'clave')
    expect(safeStorage.get(kind, 'clave')).toBeNull()
  })

  it('local y session no comparten valores', () => {
    safeStorage.set('local', 'clave', 'valor')
    expect(safeStorage.get('session', 'clave')).toBeNull()
  })

  it('devuelve null si la lectura lanza un error', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(fail)
    expect(safeStorage.get('local', 'clave')).toBeNull()
  })

  it('devuelve false sin lanzar si la escritura falla (cuota llena)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(fail)
    expect(safeStorage.set('local', 'clave', 'valor')).toBe(false)
  })

  it('no lanza si el borrado falla', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(fail)
    expect(() => safeStorage.remove('local', 'clave')).not.toThrow()
  })

  it('no lanza si el acceso mismo al almacenamiento está bloqueado', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(fail)
    expect(safeStorage.get('local', 'clave')).toBeNull()
    expect(safeStorage.set('local', 'clave', 'valor')).toBe(false)
    expect(() => safeStorage.remove('local', 'clave')).not.toThrow()
  })
})
