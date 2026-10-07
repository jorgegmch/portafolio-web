import { Link } from 'react-router-dom'
import styles from '@/components/layout/Navbar.module.css'
import { LangSwitcher } from '@/components/ui/LangSwitcher'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { useLang } from '@/hooks/useLang'
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

/**
 * Barra de navegación fija: nombre del sitio, anclas a las secciones de la
 * home, enlace a certificaciones y selector de idioma. Al desplazar la página
 * gana un fondo para separarse del contenido.
 */
export function Navbar() {
  const { lang, t, setLang } = useLang()
  const scrolled = useScrolled()

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
        <ul className={styles.links}>
          {SECTION_LINKS.map((id) => (
            <li key={id}>
              <Link className={styles.link} to={{ pathname: routes.home, hash: `#${id}` }}>
                {t.nav[id]}
              </Link>
            </li>
          ))}
          <li>
            <Link className={styles.link} to={routes.certifications}>
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
