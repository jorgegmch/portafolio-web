import { site } from '@/config/site'

/** Red con perfil público: su URL vive en config/site. */
type SocialLinkId = keyof typeof site.social

/**
 * Entrada de la fila de redes del Hero. `kind` dice cómo se abre: un enlace
 * al perfil, o el correo o WhatsApp, que solo salen por ContactButton. Aquí no
 * va ninguna URL ni dato de contacto: siguen en config/.
 */
type HeroSocial =
  | { id: SocialLinkId; kind: 'link'; icon: string; brand: boolean }
  | { id: 'email'; kind: 'email'; icon: string; brand: boolean }
  | { id: 'whatsapp'; kind: 'whatsapp'; icon: string; brand: boolean }

/** Tope de la fila: con más, los círculos de 44 px no caben en un teléfono estrecho. */
export const HERO_SOCIAL_LIMIT = 5

/**
 * Fila de redes del Hero, en orden. `brand` distingue el logo oficial de una
 * marca (public/social), que va sin alterar, del icono propio (public/icons).
 * El nombre accesible de cada una sale de hero.social en los diccionarios.
 */
export const heroSocial = [
  { id: 'github', kind: 'link', icon: 'github.svg', brand: true },
  { id: 'linkedin', kind: 'link', icon: 'linkedin.png', brand: true },
  { id: 'email', kind: 'email', icon: 'envelope.svg', brand: false },
  { id: 'whatsapp', kind: 'whatsapp', icon: 'whatsapp.svg', brand: true },
] as const satisfies readonly HeroSocial[]

export type HeroSocialId = (typeof heroSocial)[number]['id']

/** URL del perfil de una red con enlace: la de config/site, la misma del pie. */
export const heroSocialUrl = (id: SocialLinkId): string => site.social[id]

/** URL pública del icono: public/social si es de marca, public/icons si no. */
export const heroSocialIconUrl = ({ icon, brand }: Pick<HeroSocial, 'icon' | 'brand'>) =>
  `${import.meta.env.BASE_URL}${brand ? 'social' : 'icons'}/${icon}`
