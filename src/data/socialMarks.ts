/**
 * Logos de las redes y de WhatsApp: los oficiales de public/social, sin
 * modificar (registrados en docs/LOGOS.md), con su tamaño natural para
 * reservar el sitio. Son blancos; el autor pasará las variantes negras para
 * los botones sobre Signal (decisión del 2026-11-11).
 */
export const socialMarks = {
  github: { src: `${import.meta.env.BASE_URL}social/github.svg`, width: 98, height: 96 },
  linkedin: { src: `${import.meta.env.BASE_URL}social/linkedin.png`, width: 840, height: 779 },
  whatsapp: { src: `${import.meta.env.BASE_URL}social/whatsapp.svg`, width: 720, height: 720 },
} as const
