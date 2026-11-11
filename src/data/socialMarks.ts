/**
 * Logos de las redes y de WhatsApp: los oficiales de public/social, sin
 * modificar (registrados en docs/LOGOS.md), con su tamaño natural para
 * reservar el sitio. Los blancos van sobre los paneles oscuros: el pie, «Ver
 * todos en GitHub» y los canales de Contacto con la escena apilada.
 */
export const socialMarks = {
  github: { src: `${import.meta.env.BASE_URL}social/github.svg`, width: 98, height: 96 },
  linkedin: { src: `${import.meta.env.BASE_URL}social/linkedin.png`, width: 840, height: 779 },
  whatsapp: { src: `${import.meta.env.BASE_URL}social/whatsapp.svg`, width: 720, height: 720 },
} as const

/**
 * Variantes negras oficiales de un solo color, para las píldoras de canales
 * sobre el panel Signal de Contacto (spec v2.1 §3.5). Cada una tiene el mismo
 * lienzo que su versión blanca.
 */
export const socialMarksBlack = {
  github: { src: `${import.meta.env.BASE_URL}social/github-black.svg`, width: 98, height: 96 },
  linkedin: { src: `${import.meta.env.BASE_URL}social/linkedin-black.png`, width: 840, height: 779 },
  whatsapp: { src: `${import.meta.env.BASE_URL}social/whatsapp-black.svg`, width: 720, height: 720 },
} as const
