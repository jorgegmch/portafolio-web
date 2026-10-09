import { useId } from 'react'
import { portrait } from '@/assets/hero/portrait'
import styles from '@/components/sections/Hero.module.css'
import { sections } from '@/config/routes'
import { heroBadgeIconUrl, heroBadges, technologyName } from '@/data/technologies'
import { useLang } from '@/hooks/useLang'
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

/**
 * Primera sección de la home: saludo, nombre en dos colores y presentación
 * breve, con el retrato al lado. Lleva el único h1 de la página; el nombre
 * sale de hero.heading y se parte al renderizar, sin guardarlo dos veces.
 * El retrato es estático y sale entero de assets/hero/portrait.
 * A su alrededor flotan las pastillas de data/heroBadges, con el nombre que
 * cada tecnología tiene en el catálogo: son decorativas, porque la sección de
 * tecnologías ya las nombra.
 */
export function Hero() {
  const { t } = useLang()
  const headingId = useId()
  const { first, last } = splitName(t.hero.heading)

  return (
    <section id={sections.hero} className={styles.hero} aria-labelledby={headingId}>
      <div className={styles.text}>
        <p className={styles.greeting}>{t.hero.greeting}</p>
        <h1 id={headingId} className={styles.name}>
          {first} <span className={styles.lastName}>{last}</span>
        </h1>
        <p className={styles.intro}>{t.hero.intro}</p>
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
