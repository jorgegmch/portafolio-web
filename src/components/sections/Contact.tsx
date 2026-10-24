import { useId, useRef } from 'react'
import styles from '@/components/sections/Contact.module.css'
import { ContactButton } from '@/components/ui/ContactButton'
import { Reveal } from '@/components/ui/Reveal'
import { sections } from '@/config/routes'
import { site, socialLinks } from '@/config/site'
import { cvFilesFor, cvUrl } from '@/data/cv'
import { useClock } from '@/hooks/useClock'
import { useLang } from '@/hooks/useLang'
import { useMagnetic } from '@/hooks/useMagnetic'
import { LANGS } from '@/i18n/types'
import { sceneNumber } from '@/lib/sceneNumber'

/** Posición de la escena en la página (base 0): Contacto es la cuarta. */
const SCENE_INDEX = 3
/** Raya entre el número y el nombre de la escena: signo, no texto traducible. */
const LABEL_DASH = ' — '
/** Separador de la ciudad y la hora: signo, no texto traducible. */
const SEPARATOR = ' · '

/** Trazo de la flecha «↗» de lo que se abre fuera y de la «↓» de las descargas. */
const ARROW_OUT = 'M7 17 17 7M9 7h8v8'
const ARROW_DOWN = 'M12 5v14M6 13l6 6 6-6'

/**
 * Escena Contacto (spec §3.5), en el panel Signal. Arriba, el rótulo y la
 * ciudad con su hora, que avanza sola. Debajo, el título a todo el ancho y,
 * en fila, la frase y el botón circular «Escríbeme», que se acerca al
 * puntero (useMagnetic). Al pie, las píldoras: copiar el correo, WhatsApp,
 * LinkedIn, GitHub y el CV en los dos idiomas.
 *
 * El correo y el número no están en la página: los arma ContactButton
 * dentro del clic, y «Copiar correo» lo lleva al portapapeles sin
 * escribirlo.
 */
export function Contact() {
  const { t } = useLang()
  const { contact: text, common } = t
  const labelId = useId()
  const clock = useClock(site.timeZone)
  const magnetRef = useRef<HTMLDivElement>(null)
  useMagnetic(magnetRef)
  // Un PDF por idioma: el primero de su lista, en el orden de CV_VERSIONS.
  const cvLinks = LANGS.flatMap((lang) => {
    const [file] = cvFilesFor(lang)
    return file ? [{ lang, href: cvUrl(file), ...text.cv[lang] }] : []
  })

  return (
    <section id={sections.contact} className={styles.contact} aria-labelledby={labelId}>
      <div className={styles.labels}>
        <p id={labelId}>
          <span aria-hidden="true">
            {sceneNumber(SCENE_INDEX)}
            {LABEL_DASH}
          </span>
          {text.label}
        </p>
        <p>
          {site.locationCredits}
          {SEPARATOR}
          <time>{clock}</time> {site.utcOffsetLabel}
        </p>
      </div>

      <Reveal revealKey="contact-title" order={0}>
        <h2 className={styles.title}>
          <span className={styles.line}>{text.title[0]}</span>{' '}
          <span className={styles.line}>{text.title[1]}</span>
        </h2>
      </Reveal>

      <div className={styles.pitchRow}>
        <p className={styles.pitch}>{text.pitch}</p>
        <div ref={magnetRef} className={styles.magnet}>
          <ContactButton
            kind="email"
            reveal={false}
            label={text.writeMe}
            className={styles.writeMe}
            trailing={
              <svg className={styles.writeArrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={ARROW_OUT} />
              </svg>
            }
          />
        </div>
      </div>

      <ul className={styles.links} aria-label={text.linksLabel}>
        <li className={styles.copyItem}>
          <ContactButton
            kind="copy-email"
            label={text.copyEmail}
            className={styles.pill}
            copiedMessage={text.emailCopied}
            copyFailedMessage={text.copyFailed}
            statusClassName={styles.status}
          />
        </li>
        <li>
          <ContactButton
            kind="whatsapp"
            label={text.whatsapp}
            accessibleLabel={`${text.whatsapp} (${common.opensInNewTab})`}
            className={styles.pill}
            trailing={
              <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={ARROW_OUT} />
              </svg>
            }
          />
        </li>
        {socialLinks.map(({ id, label, url }) => (
          <li key={id}>
            <a
              className={styles.pill}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} (${common.opensInNewTab})`}
            >
              {label}
              <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={ARROW_OUT} />
              </svg>
            </a>
          </li>
        ))}
        {cvLinks.map(({ lang, href, short, name }) => (
          <li key={lang}>
            <a
              className={`${styles.pill} ${styles.filled}`}
              href={href}
              download
              aria-label={`${short}: ${name}`}
            >
              {short}
              <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d={ARROW_DOWN} />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
