import styles from '@/components/layout/Footer.module.css'
import { site, socialLinks } from '@/config/site'
import { useLang } from '@/hooks/useLang'

/**
 * Pie de página: crédito del autor con el año en curso y enlaces a sus redes.
 * No lleva datos de contacto; esos solo salen por ContactButton.
 */
export function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <p>
        {t.footer.builtBy} <span className={styles.name}>{site.shortName}</span>{' '}
        <span className={styles.year}>{year}</span>
      </p>
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
    </footer>
  )
}
