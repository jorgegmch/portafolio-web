import { useId } from 'react'
import { portrait } from '@/assets/hero/portrait'
import styles from '@/components/sections/Hero.module.css'
import { sections } from '@/config/routes'
import { heroLogos, techLogoUrl } from '@/data/technologies'
import { useLang } from '@/hooks/useLang'
import { splitName } from '@/lib/splitName'

const [small, large] = portrait.sources

/** El tamaño pequeño para pantallas normales y el grande para las de alta densidad. */
const PORTRAIT_SRC_SET = `${small.src} 1x, ${large.src} 2x`

/**
 * Primera sección de la home: saludo, nombre en dos colores y presentación
 * breve, con el retrato al lado. Lleva el único h1 de la página; el nombre
 * sale de hero.heading y se parte al renderizar, sin guardarlo dos veces.
 * El retrato es estático y sale entero de assets/hero/portrait.
 * A su alrededor flotan los logos de data/heroLogos: son decorativos, porque
 * la sección de tecnologías ya las nombra.
 */
export function Hero() {
  const { t } = useLang()
  const headingId = useId()
  const { first, last } = splitName(t.hero.heading)

  return (
    <section id={sections.hero} className={styles.hero} aria-labelledby={headingId}>
      <div>
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
            width={small.width}
            height={small.height}
            alt={t.hero.photoAlt}
            decoding="async"
          />
        </div>
        <div className={styles.icons} aria-hidden="true">
          {heroLogos.map((logo) => (
            // El envoltorio flota y la imagen escala: en un solo elemento,
            // una transformación pisaría a la otra.
            <span key={logo} className={styles.float}>
              <img className={styles.icon} src={techLogoUrl(logo)} alt="" decoding="async" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
