import { type MouseEvent, useId } from 'react'
import styles from '@/components/layout/Footer.module.css'
import { PAGE_START_ID, sections } from '@/config/routes'
import { site, socialLinks } from '@/config/site'
import { socialMarks } from '@/data/socialMarks'
import { useLang } from '@/hooks/useLang'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/** Signos de la frase de derechos y de las listas; no son texto traducible. */
const COPYRIGHT_SYMBOL = '©'
const SENTENCE_END = '.'
const SEPARATOR = ' · '

/** Trazo de la flecha «↗» de lo que se abre fuera. */
const ARROW_OUT = 'M7 17 17 7M9 7h8v8'

/**
 * Geometría de la marca (spec v2.1 §3.6): un lienzo de 1288 × 316 con la
 * palabra en Anton de 357, su línea base a 312 y estirada a los 1288 de
 * ancho. Son unidades del lienzo, no píxeles: el SVG escala con la rejilla.
 */
const BRAND_WIDTH = 1288
const BRAND_HEIGHT = 316
const BRAND_BASELINE = 312
const BRAND_FONT_SIZE = 357

/**
 * Pie de «créditos finales», en su propio panel (spec v2.1 §3.6). Arriba,
 * de borde a borde: quién lo diseñó y programó, con qué y desde dónde, y el
 * llamado «Sígueme en redes» con GitHub y LinkedIn, cada uno con su logo.
 * Debajo, el alias gigante solo en contorno, un SVG estirado al ancho de la
 * rejilla, decorativo y fuera del árbol accesible. Al final, el aviso de
 * derechos y «Volver arriba».
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
  const followId = useId()

  const backToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.scrollTo({ top: 0, left: 0, behavior: reducedMotion ? 'instant' : 'smooth' })
    // Sin mover la página: el desplazamiento suave ya va hacia allí.
    document.getElementById(PAGE_START_ID)?.focus({ preventScroll: true })
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.credits}>
        <dl className={styles.creditList}>
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
        </dl>
        <div className={styles.follow}>
          <p id={followId} className={styles.followLabel}>
            {t.footer.follow}
          </p>
          <ul className={styles.social} aria-labelledby={followId}>
            {socialLinks.map(({ id, label, url }) => (
              <li key={id}>
                <a
                  className={styles.link}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (${t.common.opensInNewTab})`}
                >
                  {/* Decorativo: el texto ya nombra la red. */}
                  <img
                    className={styles.mark}
                    src={socialMarks[id].src}
                    width={socialMarks[id].width}
                    height={socialMarks[id].height}
                    alt=""
                  />
                  {label}
                  <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d={ARROW_OUT} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* La palabra se estira (textLength) hasta el ancho exacto de la rejilla. */}
      <svg
        className={styles.brand}
        viewBox={`0 0 ${BRAND_WIDTH} ${BRAND_HEIGHT}`}
        aria-hidden="true"
        focusable="false"
        data-footer-brand=""
      >
        <text
          className={styles.brandText}
          x="0"
          y={BRAND_BASELINE}
          textLength={BRAND_WIDTH}
          lengthAdjust="spacingAndGlyphs"
          fontSize={BRAND_FONT_SIZE}
        >
          {site.handle}
        </text>
      </svg>
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
