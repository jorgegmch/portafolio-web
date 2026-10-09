import small from '@/assets/hero/portrait-576.webp'
import phone from '@/assets/hero/portrait-800.webp'
import medium from '@/assets/hero/portrait-1152.webp'
import large from '@/assets/hero/portrait-1472.webp'

/**
 * Retrato del Hero: único sitio que conoce sus archivos y sus medidas.
 * Para sustituir la imagen se cambian los WebP con el mismo nombre y, si las
 * medidas cambian, estos números; la proporción 4:5 se mantiene.
 */
export const portrait = {
  /** Proporción que el diseño reserva (ancho : alto). */
  aspectRatio: { width: 4, height: 5 },
  /** Del menor al mayor; el navegador elige según el ancho en pantalla y la densidad. */
  sources: [
    { src: small, width: 576, height: 720 },
    { src: phone, width: 800, height: 1000 },
    { src: medium, width: 1152, height: 1440 },
    { src: large, width: 1472, height: 1840 },
  ],
} as const
