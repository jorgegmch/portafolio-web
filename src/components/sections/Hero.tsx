import { useId } from 'react'
import { Link } from 'react-router-dom'
import { portrait } from '@/assets/hero/portrait'
import styles from '@/components/sections/Hero.module.css'
import { ContactButton } from '@/components/ui/ContactButton'
import { CvDownload } from '@/components/ui/CvDownload'
import { AVAILABLE_FOR_FREELANCE } from '@/config/availability'
import { ROLE_ROTATION } from '@/config/heroRoles'
import { routes, sections } from '@/config/routes'
import { cvFilesFor, cvUrl, type CvVersion } from '@/data/cv'
import { heroSocial, heroSocialIconUrl, heroSocialUrl } from '@/data/social'
import { heroBadgeIconUrl, heroBadges, technologyName } from '@/data/technologies'
import { useIntroPlaying } from '@/hooks/useIntroPlaying'
import { useLang } from '@/hooks/useLang'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRotatingIndex } from '@/hooks/useRotatingIndex'
import type { Dictionary } from '@/i18n/types'
import { splitName } from '@/lib/splitName'

const [small] = portrait.sources

/** Cada archivo con su ancho: el navegador elige según `sizes` y la densidad. */
const PORTRAIT_SRC_SET = portrait.sources.map(({ src, width }) => `${src} ${width}w`).join(', ')

/**
 * Ancho del retrato en pantalla, en cada diseño. `sizes` no admite variables
 * de CSS, así que repite las medidas del diseño: apilado (hasta 1023 px), el
 * ancho de la página menos sus márgenes, que cambian en 768 px, 36rem, o lo
 * que deja el alto de la ventana (el 95 % por la proporción 4:5); en dos
 * columnas, lo que pide el alto de la
 * ventana (menos la barra y el aire sobre el pelo, por la proporción 4:5 de la
 * caja y el 12,5 % transparente de arriba), con tope por ancho.
 */
const PORTRAIT_SIZES = [
  '(max-width: 768px) min(88vw, 36rem, 76vh)',
  '(max-width: 1023px) min(84vw, 36rem, 76vh)',
  '(max-width: 1280px) min(41vw, 46rem, calc((100vh - 6.5rem) * 0.9143))',
  'min(calc(132vw - 72.8rem), 46rem, calc((100vh - 6.5rem) * 0.9143))',
].join(', ')

/** Adorno junto al rol; es un signo, no texto traducible. */
const ROLE_CURSOR = '|'

/** Une los textos del rol en la frase que oye un lector de pantalla. */
const ROLE_SEPARATOR = ', '

/** Cada texto del rol dura lo que se ve más lo que tarda en entrar el siguiente. */
const ROLE_INTERVAL_MS = ROLE_ROTATION.visibleMs + ROLE_ROTATION.transitionMs

/** Clave del diccionario con el nombre de cada versión del CV. */
const CV_LABEL_KEYS = {
  infographic: 'cvInfographic',
  ats: 'cvAts',
} as const satisfies Record<CvVersion, keyof Dictionary['hero']>

/**
 * Primera sección de la home: saludo, nombre en dos colores, rol que rota
 * entre los textos de hero.roles, presentación breve, un botón que lleva a los proyectos,
 * la descarga del CV en el idioma activo si data/cv tiene sus archivos,
 * si config/availability lo activa, el estado de disponibilidad, y la fila de
 * redes de data/social, con el retrato al lado. En la fila, los perfiles son
 * enlaces y el correo y WhatsApp salen por ContactButton, que arma el dato al
 * hacer clic. Lleva el
 * único h1 de la página; el nombre sale de hero.heading y se parte al
 * renderizar, sin guardarlo dos veces.
 * El retrato es estático y sale entero de assets/hero/portrait.
 * A su alrededor flotan las pastillas de data/heroBadges, con el nombre que
 * cada tecnología tiene en el catálogo: son decorativas, porque la sección de
 * tecnologías ya las nombra.
 *
 * El rol muestra un texto cada vez, con su cursor decorativo. No empieza a
 * rotar hasta que termina la animación de carga y, con movimiento reducido,
 * se queda en el primero. Un lector de pantalla no oye los cambios: recibe
 * los textos una sola vez, en una frase fija.
 */
export function Hero() {
  const { lang, t } = useLang()
  const headingId = useId()
  const { roles } = t.hero
  const reducedMotion = useReducedMotion()
  const introPlaying = useIntroPlaying()
  const rotatingRole = useRotatingIndex(roles.length, {
    intervalMs: ROLE_INTERVAL_MS,
    paused: introPlaying || reducedMotion,
  })
  // Con movimiento reducido el texto es el primero, aunque ya hubiera rotado.
  const currentRole = reducedMotion ? 0 : rotatingRole
  const leavingRole = (currentRole + roles.length - 1) % roles.length
  const roleClass = (index: number) => {
    if (index === currentRole) return `${styles.roleItem} ${styles.roleCurrent}`
    if (index === leavingRole) return `${styles.roleItem} ${styles.roleLeaving}`
    return styles.roleItem
  }
  const { first, last } = splitName(t.hero.heading)
  const cvOptions = cvFilesFor(lang).map((entry) => ({
    label: t.hero[CV_LABEL_KEYS[entry.version]],
    href: cvUrl(entry),
  }))

  return (
    <section id={sections.hero} className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.text}>
        <p className={styles.greeting}>{t.hero.greeting}</p>
        <h1 id={headingId} className={styles.name}>
          {first} <span className={styles.lastName}>{last}</span>
        </h1>
        <p className={styles.role}>
          <span className={styles.visuallyHidden}>{roles.join(ROLE_SEPARATOR)}</span>
          {/* Los textos van apilados en la misma celda: mide lo que el mayor
              y la línea no cambia de alto al rotar. */}
          <span className={styles.roleStack} aria-hidden="true">
            {roles.map((role, index) => (
              <span key={role} className={roleClass(index)}>
                {role}
                <span className={styles.cursor}>{ROLE_CURSOR}</span>
              </span>
            ))}
          </span>
        </p>
        <p className={styles.intro}>{t.hero.intro}</p>
        <div className={styles.actions}>
          <Link
            className={styles.primary}
            to={{ pathname: routes.home, hash: `#${sections.projects}` }}
          >
            {t.hero.viewProjects}
          </Link>
          <CvDownload
            label={t.hero.downloadCv}
            shortLabel={t.hero.downloadCvShort}
            options={cvOptions}
          />
        </div>
        {AVAILABLE_FOR_FREELANCE && (
          <p className={styles.status}>
            <span className={styles.statusDot} aria-hidden="true" />
            {/* Con texto corto van los dos y el CSS deja ver uno según el ancho. */}
            {t.hero.availabilityShort ? (
              <>
                <span className={styles.statusLong}>{t.hero.availability}</span>
                <span className={styles.statusShort}>{t.hero.availabilityShort}</span>
              </>
            ) : (
              t.hero.availability
            )}
          </p>
        )}
        <ul className={styles.social} aria-label={t.hero.socialLabel}>
          {heroSocial.map((entry) => {
            // Decorativo: el nombre lo lleva el enlace o el botón.
            const icon = (
              <img
                className={styles.socialIcon}
                src={heroSocialIconUrl(entry)}
                alt=""
                decoding="async"
              />
            )
            return (
              <li key={entry.id}>
                {entry.kind === 'link' ? (
                  <a
                    className={styles.socialControl}
                    href={heroSocialUrl(entry.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t.hero.social[entry.id]} (${t.common.opensInNewTab})`}
                  >
                    {icon}
                  </a>
                ) : (
                  <ContactButton
                    kind={entry.kind}
                    label={
                      entry.kind === 'whatsapp'
                        ? `${t.hero.social[entry.id]} (${t.common.opensInNewTab})`
                        : t.hero.social[entry.id]
                    }
                    icon={icon}
                    className={styles.socialControl}
                    reveal={false}
                  />
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <div className={styles.portrait}>
        {/* El halo va en el envoltorio y la máscara en la imagen: juntos, la
            máscara cortaría el halo en línea recta en el borde del cuadro. */}
        <div className={styles.glow}>
          <img
            className={styles.photo}
            src={small.src}
            srcSet={PORTRAIT_SRC_SET}
            sizes={PORTRAIT_SIZES}
            width={small.width}
            height={small.height}
            alt={t.hero.photoAlt}
            decoding="async"
          />
        </div>
        <div className={styles.badges} aria-hidden="true">
          {heroBadges.map((badge) => (
            // El envoltorio flota y la pastilla escala: en un solo elemento,
            // una transformación pisaría a la otra.
            <div key={badge.technology} className={styles.float}>
              <div className={styles.badge}>
                <span className={styles.plate}>
                  <img
                    className={styles.badgeIcon}
                    src={heroBadgeIconUrl(badge)}
                    alt=""
                    decoding="async"
                  />
                </span>
                <span>{technologyName(badge.technology)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
