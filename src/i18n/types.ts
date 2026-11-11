import type { ContactNeedId } from '@/data/contactNeeds'
import type { EducationId } from '@/data/education'
import type { ProjectId } from '@/data/projects'
import type { ServiceId } from '@/data/services'
import type { TechnologyId } from '@/data/technologies'
import type { TechnologyGroup } from '@/data/types'
import type { TranslatorExampleId } from '@/data/translator'
import type { CodingTime } from '@/lib/codingTime'

export const LANGS = ['es', 'en'] as const
export type Lang = (typeof LANGS)[number]
export const DEFAULT_LANG: Lang = 'es'

/** Lado de la cifra en el que cada idioma pone el «+»: «+20» o «20+». */
export type PlusPosition = 'prefix' | 'suffix'

/**
 * Forma única de los textos del sitio. Cada idioma debe cumplirla completa:
 * si falta una clave, un proyecto o un servicio, TypeScript falla.
 */
export interface Dictionary {
  meta: {
    title: string
    description: string
  }
  nav: {
    about: string
    services: string
    projects: string
    contact: string
    skipToContent: string
    /** Lo que hace el botón de idioma: pasar al otro. Va tras «ES / EN». */
    language: string
    /** Nombre fijo del botón de pausa global de animaciones. */
    pauseAnimations: string
    /** CTA de la navegación: lleva a Contacto. */
    cta: string
    /** Nombre accesible del landmark de navegación. */
    main: string
    /**
     * Destino del enlace del logo, al final de su nombre accesible, que va
     * tras el nombre corto y el alias: «Jorge Gómez (jorgegmch), inicio».
     */
    home: string
    openMenu: string
    closeMenu: string
  }
  intro: {
    /** Frases en lenguaje natural que se transforman en código. */
    phrases: readonly { natural: string; code: string }[]
    /** Nombre accesible de la capa de la intro, un diálogo modal. */
    label: string
    /** Descripción de la capa: cómo saltarla. Solo la oye el lector de pantalla. */
    hint: string
  }
  hero: {
    /** Título de la página de inicio: el nombre corto, que no se traduce. */
    heading: string
    /** Presentación breve, junto a los botones. */
    intro: string
    /** Línea en mono bajo el rol; el «//» lo pone el componente. */
    stackLine: string
    /**
     * Lema al pie de la foto, en dos frases: la primera en Bone y la segunda
     * en Signal. Las mayúsculas las pone el CSS.
     */
    motto: { first: string; second: string }
    /** Rótulo de las fichas del panel derecho; el «//» lo pone el componente. */
    mainStack: string
    /** Nombre accesible de la lista de tecnologías de la cinta. */
    stackLabel: string
    viewProjects: string
    /** Estado junto al punto de acento; las mayúsculas las pone el CSS. */
    availability: string
    /**
     * Versión corta del estado, para las pantallas donde `availability` no
     * cabe en una línea. Solo la define el idioma que la necesita.
     */
    availabilityShort?: string
    downloadCv: string
    cvInfographic: string
    cvAts: string
    photoAlt: string
  }
  about: {
    /** Nombre de la escena: su rótulo, tras el número, y el de la navegación. */
    label: string
    /** Rótulo en mono al otro lado, con forma de llamada a función. */
    tag: string
    /** Frase grande en dos líneas: la primera rellena y la segunda en contorno. */
    phrase: { filled: string; outline: string }
    /** Bio en dos párrafos. */
    bio: readonly [string, string]
    /** Bloque «Mi stack», al final de la escena (spec v2.1 §3.2). */
    stack: {
      /** Rótulo en mono, con forma de llamada a método. */
      tag: string
      /** Título; las mayúsculas las pone el CSS. */
      title: string
      /** Cuántas tecnologías hay; la cifra sale del catálogo. */
      count: (count: number) => string
      /** Nombre de cada columna. */
      groups: Record<TechnologyGroup, string>
    }
    /** Etiqueta de cada tarjeta según su cifra, que la tarjeta muestra aparte. */
    stats: {
      codingTime: Record<CodingTime['unit'], (count: number) => string>
      projects: (count: number) => string
      technologies: (count: number) => string
      /** Dónde va el «+» de una cifra aproximada; el carácter lo pone la tarjeta. */
      plusPosition: PlusPosition
    }
    educationLabel: string
    /**
     * Traducción entre paréntesis del título oficial de cada fila, que va en
     * su idioma original; `null` donde no hace falta.
     */
    educationTranslation: Record<EducationId, string | null>
    translator: {
      label: string
      /** Nombre accesible del grupo de pestañas. */
      examplesLabel: string
      saysLabel: string
      writesLabel: string
      viewRepo: string
      /** Por ejemplo: la pestaña y lo que pide el negocio. El código está en data/. */
      items: Record<TranslatorExampleId, { tab: string; say: string }>
    }
  }
  services: {
    /** Nombre de la escena, en su rótulo; las mayúsculas las pone el CSS. */
    label: string
    /** Rótulo en código del otro lado: no se traduce, pero vive con los textos. */
    tag: string
    /** Título grande, en sus dos líneas; las mayúsculas las pone el CSS. */
    title: readonly [string, string]
    /** Texto del enlace de cada fila al repo que la respalda. */
    relatedProject: string
    /** Cintas cruzadas al pie de la escena: el nombre de cada lista y los verbos. */
    ribbons: {
      codeLabel: string
      verbsLabel: string
      verbs: readonly string[]
    }
    items: Record<ServiceId, { title: string; description: string }>
  }
  projects: {
    /** Nombre de la escena, en su rótulo y en el título; las mayúsculas las pone el CSS. */
    label: string
    /** Enlace a todos los repos, junto al rótulo. */
    viewAll: string
    /** Enlace de cada tarjeta a su repo. */
    viewCode: string
    /** Etiqueta de la tarjeta del proyecto protagonista. */
    mainProject: string
    /** Nombre accesible de la lista de tecnologías de cada tarjeta. */
    stackLabel: string
    /** Marcador visible donde todavía no hay captura del proyecto. */
    screenshotPending: string
    items: Record<ProjectId, { description: string }>
  }
  contact: {
    /** Nombre de la escena, en su rótulo; las mayúsculas las pone el CSS. */
    label: string
    /** Título grande, en sus dos líneas; las mayúsculas las pone el CSS. */
    title: readonly [string, string]
    /** Frase junto al botón «Escríbeme». */
    pitch: string
    /** Botón circular que abre el formulario. */
    writeMe: string
    /** Píldora que copia el correo sin mostrarlo. */
    copyEmail: string
    /** Aviso tras copiar el correo; no lo muestra. */
    emailCopied: string
    /** Aviso si el navegador no deja copiar: se abre el programa de correo. */
    copyFailed: string
    whatsapp: string
    /** Nombre accesible de la fila de píldoras. */
    linksLabel: string
    /**
     * Botón del CV, en el idioma del sitio: el texto corto y el nombre
     * accesible, que empieza por él y dice qué abre.
     */
    cv: { short: string; name: string }
    /** Formulario del diálogo «Escríbeme» (spec §5). */
    form: {
      /** Rótulo en código sobre el título: no se traduce, pero vive con los textos. */
      tag: string
      title: string
      close: string
      /** Marcas tras la etiqueta de cada campo. */
      required: string
      optional: string
      /** Marca tras «¿Qué necesitas?». */
      pickSeveral: string
      name: { label: string; placeholder: string; error: string }
      email: { label: string; placeholder: string; error: string }
      company: { label: string; placeholder: string }
      needs: { legend: string; options: Record<ContactNeedId, string> }
      message: { label: string; placeholder: string; error: string }
      submit: string
      sending: string
      /** Aviso si el envío no sale; el mensaje se conserva. */
      failed: string
      /** Frase antes de «Copiar correo» y WhatsApp, siempre visible. */
      direct: string
      sent: {
        title: string
        /** Va tras «status: 200 · » y antes del correo de quien escribe. */
        reply: string
        back: string
        again: string
      }
    }
  }
  footer: {
    /** Rótulos de las cuatro columnas de «créditos finales». */
    credits: {
      design: string
      builtWith: string
      from: string
      online: string
    }
    /** Aviso de derechos; va tras el año y el nombre. */
    rights: string
    /** Nombre accesible de la lista de redes. */
    social: string
    backToTop: string
  }
  common: {
    /** Aviso para lectores de pantalla en enlaces con target="_blank". */
    opensInNewTab: string
  }
  /**
   * Nombres de tecnología que el idioma da aparte. Los demás son nombres
   * propios y salen del catálogo (data/technologies), sin traducir.
   */
  technologyNames: Partial<Record<TechnologyId, string>>
}
