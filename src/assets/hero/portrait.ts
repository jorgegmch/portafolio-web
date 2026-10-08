import small from '@/assets/hero/portrait-576.webp'
import large from '@/assets/hero/portrait-1152.webp'

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
    { src: small, width: 576, height: 720 },
    { src: large, width: 1152, height: 1440 },
  ],
} as const
