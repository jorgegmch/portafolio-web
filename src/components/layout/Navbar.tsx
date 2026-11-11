import { type PointerEvent, useId, useRef } from 'react'
import { Link } from 'react-router-dom'
import styles from '@/components/layout/Navbar.module.css'
import { LangToggle } from '@/components/ui/LangToggle'
import { PauseToggle } from '@/components/ui/PauseToggle'
import { mediaQueries } from '@/config/media'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { useDismissibleMenu } from '@/hooks/useDismissibleMenu'
import { useLang } from '@/hooks/useLang'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMotionPause } from '@/hooks/useMotionPause'
import { useTextScramble } from '@/hooks/useTextScramble'
import { LANGS } from '@/i18n/types'
import { sceneNumber } from '@/lib/sceneNumber'

// Escenas de la home enlazadas desde la navegación, en su orden en la página:
// la numeración 01–04 sale de esta posición.
const SECTION_LINKS = [
  sections.about,
  sections.services,
  sections.projects,
  sections.contact,
] as const

// Trazos del icono del botón de menú: dos barras o una equis.
const ICON_OPEN = 'M4 9h16M4 15h16'
const ICON_CLOSE = 'M6 6l12 12M18 6L6 18'

/** Guion bajo del logo, en la voz de código: signo, no texto traducible. */
const LOGO_CURSOR = '_'

/** El más largo de los dos textos del logo, para reservarle el sitio. */
const LOGO_LONGEST = [site.handle, site.shortName].reduce((a, b) =>
  Array.from(b).length > Array.from(a).length ? b : a,
)

/**
 * Navegación del sitio, arriba del panel del Hero (no es fija). A la
 * izquierda, el alias; en el centro, una píldora con las escenas numeradas;
 * a la derecha, la pausa de animaciones, el idioma y el CTA «Hablemos», que
 * lleva a Contacto. En pantallas estrechas la píldora y los controles se
 * pliegan en un menú que abre un botón circular.
 *
 * El logo se traduce (spec §4.2): en reposo «jorgegmch_»; con un puntero
 * fino encima o con el foco del teclado, «Jorge Gómez_», y al irse, vuelve.
 * Lo que se ve va con aria-hidden; el nombre accesible no cambia y lleva las
 * dos formas. Debajo hay una copia invisible del texto más largo, que le
 * reserva el ancho para que la barra no se mueva.
 */
export function Navbar() {
  const { lang, t, setLang } = useLang()
  const { paused, togglePaused } = useMotionPause()
  const compact = useMediaQuery(mediaQueries.compactNav)
  const finePointer = useMediaQuery(mediaQueries.finePointer)
  const logo = useTextScramble(site.handle, site.shortName)
  // Por qué está traducido el logo: el puntero encima, el foco del teclado o
  // los dos. `pressed` marca que el foco llega de pulsarlo con el puntero.
  const logoReasons = useRef({ pointer: false, focus: false, pressed: false })
  const setLogoReason = (reason: 'pointer' | 'focus', on: boolean) => {
    logoReasons.current[reason] = on
    logo.setAlternate(logoReasons.current.pointer || logoReasons.current.focus)
  }
  const usesFinePointer = (event: PointerEvent<HTMLAnchorElement>) =>
    finePointer && event.pointerType !== 'touch'
  const onLogoPointerEnter = (event: PointerEvent<HTMLAnchorElement>) => {
    if (usesFinePointer(event)) setLogoReason('pointer', true)
  }
  const onLogoPointerLeave = (event: PointerEvent<HTMLAnchorElement>) => {
    if (usesFinePointer(event)) setLogoReason('pointer', false)
  }
  // Solo el foco del teclado: el que llega de pulsarlo con el puntero no
  // traduce el logo (de eso ya se encarga el puntero encima).
  const onLogoFocus = () => {
    setLogoReason('focus', !logoReasons.current.pressed)
    logoReasons.current.pressed = false
  }
  const {
    open: menuOpen,
    setOpen: setMenuOpen,
    toggleRef: menuToggleRef,
    areaRef: menuRef,
  } = useDismissibleMenu<HTMLDivElement>()
  const menuId = useId()

  // Si la pantalla se ensancha con el menú abierto, al volver debe estar cerrado.
  if (!compact && menuOpen) setMenuOpen(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={styles.header}>
      <Link
        className={styles.brand}
        to={routes.home}
        aria-label={`${site.shortName} (${site.handle}), ${t.nav.home}`}
        onPointerEnter={onLogoPointerEnter}
        onPointerLeave={onLogoPointerLeave}
        onPointerDown={() => {
          logoReasons.current.pressed = true
        }}
        onFocus={onLogoFocus}
        onBlur={() => setLogoReason('focus', false)}
      >
        <span className={styles.logo} aria-hidden="true">
          <span className={styles.logoSizer} data-logo-sizer="">
            {LOGO_LONGEST}
            <span className={styles.cursor}>{LOGO_CURSOR}</span>
          </span>
          <span data-logo-text="">
            {logo.text}
            <span className={styles.cursor}>{LOGO_CURSOR}</span>
          </span>
        </span>
      </Link>
      {compact && (
        <button
          ref={menuToggleRef}
          type="button"
          className={styles.menuToggle}
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((wasOpen) => !wasOpen)}
        >
          <svg className={styles.menuIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d={menuOpen ? ICON_CLOSE : ICON_OPEN} />
          </svg>
        </button>
      )}
      <div ref={menuRef} id={menuId} className={styles.menu} hidden={compact && !menuOpen}>
        <nav className={styles.nav} aria-label={t.nav.main}>
          <ul className={styles.links}>
            {SECTION_LINKS.map((id, index) => (
              <li key={id}>
                <Link
                  className={styles.link}
                  to={{ pathname: routes.home, hash: `#${id}` }}
                  onClick={closeMenu}
                >
                  <span className={styles.number} aria-hidden="true">
                    {sceneNumber(index)}
                  </span>
                  {t.nav[id]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <PauseToggle label={t.nav.pauseAnimations} pressed={paused} onToggle={togglePaused} />
          <LangToggle label={t.nav.language} current={lang} langs={LANGS} onSelect={setLang} />
          <Link
            className={styles.cta}
            to={{ pathname: routes.home, hash: `#${sections.contact}` }}
            onClick={closeMenu}
          >
            {t.nav.cta}
          </Link>
        </div>
      </div>
    </header>
  )
}
