import { useLang } from '@/hooks/useLang'
import styles from '@/pages/HomePage.module.css'

/**
 * Página de inicio. Por ahora solo lleva su título; las secciones llegan en
 * las fases siguientes. El <main> lo pone el layout, no la página.
 */
export function HomePage() {
  const { t } = useLang()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.hero.heading}</h1>
    </div>
  )
}
