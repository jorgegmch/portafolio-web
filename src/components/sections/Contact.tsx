import { useId } from 'react'
import styles from '@/components/sections/Contact.module.css'
import { ContactButton } from '@/components/ui/ContactButton'
import { ContactForm } from '@/components/ui/ContactForm'
import { CvDownload } from '@/components/ui/CvDownload'
import { Reveal } from '@/components/ui/Reveal'
import { sections } from '@/config/routes'
import { site, socialLinks } from '@/config/site'
import { useClock } from '@/hooks/useClock'
import { useCvOptions } from '@/hooks/useCvOptions'
import { useLang } from '@/hooks/useLang'
import { sceneNumber } from '@/lib/sceneNumber'
import { sendContactMessage } from '@/lib/sendContactMessage'

/** Posición de la escena en la página (base 0): Contacto es la cuarta. */
const SCENE_INDEX = 3
/** Raya entre el número y el nombre de la escena: signo, no texto traducible. */
const LABEL_DASH = ' — '
/** Separador de la ciudad y la hora: signo, no texto traducible. */
const SEPARATOR = ' · '

/** Trazo de la flecha «↗» de lo que se abre fuera. */
const ARROW_OUT = 'M7 17 17 7M9 7h8v8'

/**
 * Escena Contacto (spec v2.1 §3.5), en dos paneles. A la izquierda, en
 * Signal: el rótulo y la ciudad con su hora, que avanza sola; el título y
 * la frase; y al pie, los canales: copiar el correo, WhatsApp, GitHub,
 * LinkedIn y un botón de CV en el idioma activo, que abre sus versiones como
 * «Descargar CV» del Hero. A la derecha, en Ink, el formulario, siempre a la
 * vista. En tablet y teléfono se apilan: mensaje, formulario y canales; ese
 * es también su orden en el documento.
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
  const whatsappName = `${text.whatsapp} (${common.opensInNewTab})`
  // El CV del idioma activo del sitio, con sus versiones, como en el Hero.
  const { cv } = text
  const cvOptions = useCvOptions()

  return (
    <section id={sections.contact} className={styles.contact} aria-labelledby={labelId}>
      <div className={styles.message}>
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
          <h2 className={styles.title}>{text.title}</h2>
        </Reveal>

        <div className={styles.pitch}>
          <p className={styles.pitchLead}>{text.pitch.lead}</p>
          <p className={styles.pitchBody}>{text.pitch.body}</p>
        </div>
      </div>

      <div className={styles.formPanel}>
        <ContactForm
          text={text.form}
          copy={{ copyEmail: text.copyEmail, emailCopied: text.emailCopied, copyFailed: text.copyFailed }}
          send={sendContactMessage}
        />
      </div>

      <div className={styles.channels}>
        <p className={styles.channelsLabel}>{text.channelsLabel}</p>
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
              accessibleLabel={whatsappName}
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
          <li>
            <CvDownload
              label={cv.short}
              accessibleLabel={`${cv.short}: ${cv.name}`}
              options={cvOptions}
              toggleClassName={`${styles.pill} ${styles.filled}`}
            />
          </li>
        </ul>
      </div>
    </section>
  )
}
