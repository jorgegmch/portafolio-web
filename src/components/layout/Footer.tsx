import styles from '@/components/layout/Footer.module.css'
import { site, socialLinks } from '@/config/site'
import { useLang } from '@/hooks/useLang'

/** Signos de la frase de derechos; no son texto traducible. */
const COPYRIGHT_SYMBOL = '©'
const SENTENCE_END = '.'

/**
 * Pie de página: aviso de derechos con el año de publicación y el nombre del
 * autor, y enlaces a sus redes.
 * No lleva datos de contacto; esos solo salen por ContactButton.
 */
export function Footer() {
  const { t } = useLang()

  return (
    <footer className={styles.footer}>
      <p>
        {COPYRIGHT_SYMBOL} {site.publishedYear}{' '}
        <span className={styles.name}>{site.shortName}</span>
        {SENTENCE_END} {t.footer.rights}
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
