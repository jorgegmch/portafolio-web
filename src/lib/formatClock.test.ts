import { describe, expect, it } from 'vitest'
import { site } from '@/config/site'
import { formatClock } from '@/lib/formatClock'

// El reloj de la ciudad (spec §3.1 y §3.5): hora de America/Bogota, sea cual
// sea la zona del visitante. Colombia está en UTC-5 todo el año.
const BOGOTA = 'America/Bogota'

describe('formatClock', () => {
  it('la zona de la ciudad es America/Bogota, y se muestra como GMT-5', () => {
    expect(site.timeZone).toBe(BOGOTA)
    expect(site.utcOffsetLabel).toBe('GMT-5')
  })

  it('da la hora de Bogotá: cinco horas menos que UTC', () => {
    expect(formatClock(new Date('2026-10-24T17:05:00Z'), BOGOTA)).toBe('12:05')
  })

  it('cruza la medianoche hacia el día anterior', () => {
    expect(formatClock(new Date('2026-01-01T04:59:00Z'), BOGOTA)).toBe('23:59')
    expect(formatClock(new Date('2026-01-01T05:00:00Z'), BOGOTA)).toBe('00:00')
  })

  it('no cambia de hora en el año: mismo desfase en enero y en julio', () => {
    expect(formatClock(new Date('2026-01-15T15:00:00Z'), BOGOTA)).toBe('10:00')
    expect(formatClock(new Date('2026-07-15T15:00:00Z'), BOGOTA)).toBe('10:00')
  })

  it('va en 24 horas, con dos cifras', () => {
    expect(formatClock(new Date('2026-10-24T22:07:00Z'), BOGOTA)).toBe('17:07')
    expect(formatClock(new Date('2026-10-24T14:03:00Z'), BOGOTA)).toBe('09:03')
  })

  // La zona manda, no la del entorno: otra zona da otra hora.
  it('depende de la zona que recibe, no de la del visitante', () => {
    const instant = new Date('2026-10-24T17:05:00Z')

    expect(formatClock(instant, 'Asia/Tokyo')).toBe('02:05')
    expect(formatClock(instant, 'UTC')).toBe('17:05')
    expect(formatClock(instant, BOGOTA)).toBe('12:05')
  })

  it('con una zona que no existe, «--:--» en vez de una hora equivocada', () => {
    expect(formatClock(new Date('2026-10-24T17:05:00Z'), 'America/Nowhere')).toBe('--:--')
  })
})
