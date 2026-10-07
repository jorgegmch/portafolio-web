import { useId } from 'react'
import styles from '@/components/sections/Hero.module.css'
import { sections } from '@/config/routes'
import { useLang } from '@/hooks/useLang'
import { splitName } from '@/lib/splitName'

/**
 * Primera sección de la home: saludo, nombre en dos colores y presentación
 * breve. Lleva el único h1 de la página; el nombre sale de hero.heading y se
 * parte al renderizar, sin guardarlo dos veces.
 */
export function Hero() {
  const { t } = useLang()
  const headingId = useId()
  const { first, last } = splitName(t.hero.heading)

  return (
    <section id={sections.hero} className={styles.hero} aria-labelledby={headingId}>
      <p className={styles.greeting}>{t.hero.greeting}</p>
      <h1 id={headingId} className={styles.name}>
        {first} <span className={styles.lastName}>{last}</span>
      </h1>
      <p className={styles.intro}>{t.hero.intro}</p>
    </section>
  )
}
