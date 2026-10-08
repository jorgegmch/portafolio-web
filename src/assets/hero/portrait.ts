import small from '@/assets/hero/portrait-520.webp'
import large from '@/assets/hero/portrait-1040.webp'

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
    { src: small, width: 520, height: 650 },
    { src: large, width: 1040, height: 1300 },
  ],
} as const
