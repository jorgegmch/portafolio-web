import { describe, expect, it } from 'vitest'
import { ROLE_ROTATION } from '@/config/heroRoles'
import { cssMedia, cssToken, readCss } from '@/test/cssRules'

const tokensCss = readCss('src/styles/tokens.css')

describe('tiempos del rol que rota', () => {
  it('cada texto se ve cuatro segundos', () => {
    expect(ROLE_ROTATION.visibleMs).toBe(4000)
  })

  it('el cambio de un texto al siguiente dura medio segundo', () => {
    expect(ROLE_ROTATION.transitionMs).toBe(500)
  })

  // La transición la hace el CSS y el temporizador la cuenta en JS: el mismo
  // tiempo está escrito en los dos sitios y no puede desviarse.
  it('la duración del cambio es la misma que la del token del CSS', () => {
    expect(cssToken(tokensCss, '--duration-role-swap')).toBe(`${ROLE_ROTATION.transitionMs}ms`)
  })

  it('el cambio es más corto que lo que se ve cada texto', () => {
    expect(ROLE_ROTATION.transitionMs).toBeLessThan(ROLE_ROTATION.visibleMs)
  })

  it('con movimiento reducido el token del cambio se anula, como las demás duraciones', () => {
    const reduced = cssMedia(tokensCss, '(prefers-reduced-motion: reduce)')

    expect(cssToken(reduced, '--duration-role-swap')).toBe(cssToken(reduced, '--duration-fast'))
    expect(cssToken(reduced, '--duration-role-swap')).toBe('0.01ms')
  })
})
