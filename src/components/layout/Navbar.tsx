import { useId } from 'react'
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

/**
 * Navegación del sitio, arriba del panel del Hero (no es fija). A la
 * izquierda, el alias; en el centro, una píldora con las escenas numeradas;
 * a la derecha, la pausa de animaciones, el idioma y el CTA «Hablemos», que
 * lleva a Contacto. En pantallas estrechas la píldora y los controles se
 * pliegan en un menú que abre un botón circular.
 */
export function Navbar() {
  const { lang, t, setLang } = useLang()
  const { paused, togglePaused } = useMotionPause()
  const compact = useMediaQuery(mediaQueries.compactNav)
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
      <Link className={styles.brand} to={routes.home} aria-label={`${site.handle}: ${t.nav.home}`}>
        {site.handle}
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
