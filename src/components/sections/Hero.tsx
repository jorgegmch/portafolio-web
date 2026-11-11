import { useId } from 'react'
import { Link } from 'react-router-dom'
import { portrait } from '@/assets/hero/portrait'
import styles from '@/components/sections/Hero.module.css'
import { CvDownload } from '@/components/ui/CvDownload'
import { Ribbon } from '@/components/ui/Ribbon'
import { AVAILABLE_FOR_FREELANCE } from '@/config/availability'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { technologies, technologyName } from '@/data/technologies'
import { useClock } from '@/hooks/useClock'
import { useCvOptions } from '@/hooks/useCvOptions'
import { useLang } from '@/hooks/useLang'
import { splitName } from '@/lib/splitName'

const [small] = portrait.sources

/** Cada archivo con su ancho: el navegador elige según `sizes` y la densidad. */
const PORTRAIT_SRC_SET = portrait.sources.map(({ src, width }) => `${src} ${width}w`).join(', ')

/**
 * Ancho del retrato en pantalla. `sizes` no admite variables de CSS, así que
 * repite el token --hero-photo-width; un test los compara.
 */
const PORTRAIT_SIZES = 'clamp(17rem, 36vw, 29.375rem)'

/** Signos que no son texto traducible: separador de datos y prefijo de comentario. */
const SEPARATOR = ' · '
const COMMENT_PREFIX = '// '

/** Las tecnologías del catálogo, en su orden, para la cinta. */
const STACK_NAMES = technologies.map(({ id }) => technologyName(id))

/**
 * Primera escena, en el panel Ink (spec §3.1). Arriba, el estado de
 * disponibilidad (si config/availability lo activa) y la ciudad con su hora,
 * que avanza sola. En el centro, el nombre gigante, detrás de la foto, que
 * va anclada abajo en blanco y negro con un borde de luz. Abajo, el rol con
 * su línea de stack y, al otro lado, la presentación con «Ver proyectos» y la
 * descarga del CV. Cierra la cinta con las tecnologías del catálogo.
 *
 * Lleva el único h1 de la página: el nombre sale de hero.heading y se parte al
 * renderizar, sin guardarlo dos veces. Es estático: el efecto de traducirse
 * lo lleva el logo de la barra. La luz y el anillo tras la foto son
 * decorativos. La cinta es una lista que el lector de pantalla oye una vez.
 */
export function Hero() {
  const { t } = useLang()
  const headingId = useId()
  const clock = useClock(site.timeZone)
  const { first, last } = splitName(t.hero.heading)
  const cvOptions = useCvOptions()

  return (
    <section id={sections.hero} className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.meta}>
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
        <p className={styles.clock}>
          {site.locationShort}
          {SEPARATOR}
          <time>{clock}</time> {site.utcOffsetLabel}
        </p>
      </div>

      <div className={styles.stage}>
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.ring} aria-hidden="true" />
        <h1 id={headingId} className={styles.name}>
          <span className={styles.first}>{first}</span>{' '}
          <span className={styles.last}>{last}</span>
        </h1>
        <div className={styles.portrait}>
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
        <div className={styles.blocks}>
          <div className={styles.identity}>
            <p className={styles.role}>{site.role}</p>
            <p className={styles.stackLine}>
              <span className={styles.comment}>{COMMENT_PREFIX}</span>
              {t.hero.stackLine}
            </p>
          </div>
          <div className={styles.pitch}>
            <p className={styles.intro}>{t.hero.intro}</p>
            <div className={styles.actions}>
              <Link
                className={styles.primary}
                to={{ pathname: routes.home, hash: `#${sections.projects}` }}
              >
                {t.hero.viewProjects}
                <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <CvDownload className={styles.cv} label={t.hero.downloadCv} options={cvOptions} />
            </div>
          </div>
        </div>
      </div>

      <Ribbon className={styles.ribbon} items={STACK_NAMES} label={t.hero.stackLabel} />
    </section>
  )
}
