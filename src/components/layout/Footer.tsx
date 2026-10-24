import type { MouseEvent } from 'react'
import styles from '@/components/layout/Footer.module.css'
import { PAGE_START_ID, sections } from '@/config/routes'
import { site, socialLinks } from '@/config/site'
import { useLang } from '@/hooks/useLang'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Signos de la frase de derechos y de las listas; no son texto traducible. */
const COPYRIGHT_SYMBOL = '©'
const SENTENCE_END = '.'
const SEPARATOR = ' · '

/**
 * Pie de «créditos finales», en su propio panel. Cuatro columnas (quién lo
 * diseñó y programó, con qué, desde dónde y en qué redes está), el alias
 * gigante solo en contorno, que es decorativo y queda fuera del árbol
 * accesible, y una línea final con el aviso de derechos y «Volver arriba».
 * No lleva datos de contacto; esos solo salen por ContactButton.
 *
 * «Volver arriba» sube al inicio de la página y lleva el foco a lo primero
 * de ella, el skip link, para que el teclado y el lector de pantalla sigan
 * desde arriba. No salta al ancla del Hero: con la cortina el Hero está fijo
 * y el navegador solo subía hasta donde estaba fijado (desde el pie quedaba
 * en Contacto). Sin JavaScript, el ancla sigue llevando al Hero.
 */
export function Footer() {
  const { t } = useLang()
  const { credits } = t.footer
  const reducedMotion = useReducedMotion()

  const backToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'instant' : 'smooth' })
    // Sin mover la página: el desplazamiento suave ya va hacia allí.
    document.getElementById(PAGE_START_ID)?.focus({ preventScroll: true })
  }

  return (
    <footer className={styles.footer}>
      <dl className={styles.credits}>
        <div className={styles.credit}>
          <dt className={styles.label}>{credits.design}</dt>
          <dd className={styles.value}>{site.shortName}</dd>
        </div>
        <div className={styles.credit}>
          <dt className={styles.label}>{credits.builtWith}</dt>
          <dd className={styles.value}>{site.builtWith.join(SEPARATOR)}</dd>
        </div>
        <div className={styles.credit}>
          <dt className={styles.label}>{credits.from}</dt>
          <dd className={styles.value}>{site.locationCredits}</dd>
        </div>
        <div className={styles.credit}>
          <dt className={styles.label}>{credits.online}</dt>
          <dd className={styles.value}>
            <ul className={styles.social} aria-label={t.footer.social}>
              {socialLinks.map(({ id, label, url }) => (
                <li key={id}>
                  <a
                    className={styles.link}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (${t.common.opensInNewTab})`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <div className={styles.brand} aria-hidden="true">
        {site.handle}
      </div>
      <div className={styles.bottom}>
        <p>
          {COPYRIGHT_SYMBOL} {site.publishedYear} {site.shortName}
          {SENTENCE_END} {t.footer.rights}
          {SENTENCE_END}
        </p>
        <a className={styles.top} href={`#${sections.hero}`} onClick={backToTop}>
          {t.footer.backToTop}
          <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </a>
      </div>
    </footer>
  )
}
