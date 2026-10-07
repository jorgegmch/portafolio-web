import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '@/components/layout/Navbar.module.css'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import { mediaQueries } from '@/config/media'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { useLang } from '@/hooks/useLang'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrolled } from '@/hooks/useScrolled'
import { LANG_NAMES, LANGS } from '@/i18n/types'

// Secciones de la home enlazadas desde la barra, en su orden en la página.
const SECTION_LINKS = [
  sections.about,
  sections.technologies,
  sections.projects,
  sections.contact,
] as const

const LANG_OPTIONS = LANGS.map((lang) => ({ lang, name: LANG_NAMES[lang] }))

// Trazos del icono del botón de menú: tres barras o una equis.
const ICON_OPEN = 'M4 7h16M4 12h16M4 17h16'
const ICON_CLOSE = 'M6 6l12 12M18 6L6 18'

/**
 * Barra de navegación fija: nombre del sitio, anclas a las secciones de la
 * home, enlace a certificaciones y selector de idioma. Al desplazar la página
 * gana un fondo para separarse del contenido. En pantallas estrechas los
 * enlaces se pliegan en un menú que abre un botón.
 */
export function Navbar() {
  const { lang, t, setLang } = useLang()
  const scrolled = useScrolled()
  const compact = useMediaQuery(mediaQueries.compactNav)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const menuId = useId()

  // Si la pantalla se ensancha con el menú abierto, al volver debe estar cerrado.
  if (!compact && menuOpen) setMenuOpen(false)

  // Los listeners solo existen mientras el menú está abierto.
  useEffect(() => {
    if (!menuOpen) return

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node &&
      !menuRef.current?.contains(target) &&
      !menuToggleRef.current?.contains(target)

    const closeIfOutside = (event: Event) => {
      if (isOutside(event.target)) setMenuOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      menuToggleRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={styles.header} data-scrolled={scrolled}>
      <nav className={styles.nav} aria-label={t.nav.main}>
        <Link
          className={styles.brand}
          to={routes.home}
          aria-label={`${site.shortName}: ${t.nav.home}`}
        >
          {site.shortName}
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
            <svg className={styles.menuIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d={menuOpen ? ICON_CLOSE : ICON_OPEN} />
            </svg>
          </button>
        )}
        <ul ref={menuRef} id={menuId} className={styles.links} hidden={compact && !menuOpen}>
          {SECTION_LINKS.map((id) => (
            <li key={id}>
              <Link
                className={styles.link}
                to={{ pathname: routes.home, hash: `#${id}` }}
                onClick={closeMenu}
              >
                {t.nav[id]}
              </Link>
            </li>
          ))}
          <li>
            <Link className={styles.link} to={routes.certifications} onClick={closeMenu}>
              {t.nav.certifications}
            </Link>
          </li>
        </ul>
        <LangSwitcher
          label={t.nav.language}
          current={lang}
          options={LANG_OPTIONS}
          onSelect={setLang}
        />
      </nav>
    </header>
  )
}
