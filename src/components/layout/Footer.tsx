import { Link } from 'react-router-dom'
import styles from '@/components/layout/Footer.module.css'
import { routes, sections } from '@/config/routes'
import { site, socialLinks } from '@/config/site'
import { useLang } from '@/hooks/useLang'

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
 */
export function Footer() {
  const { t } = useLang()
  const { credits } = t.footer

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
        <Link className={styles.top} to={{ pathname: routes.home, hash: `#${sections.hero}` }}>
          {t.footer.backToTop}
          <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </Link>
      </div>
    </footer>
  )
}
