import small from '@/assets/hero/portrait-420.webp'
import large from '@/assets/hero/portrait-840.webp'

/**
 * Retrato del Hero: único sitio que conoce sus archivos y sus medidas.
 * Para sustituir la imagen se cambian los dos WebP con el mismo nombre y, si
 * las medidas cambian, estos números; la proporción 4:5 se mantiene.
 */
export const portrait = {
  /** Proporción que el diseño reserva (ancho : alto). */
  aspectRatio: { width: 4, height: 5 },
  /** Del menor al mayor; el segundo es el de pantallas de alta densidad. */
  sources: [
    { src: small, width: 420, height: 525 },
    { src: large, width: 840, height: 1050 },
  ],
} as const
