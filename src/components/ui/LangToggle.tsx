import styles from '@/components/ui/LangToggle.module.css'
import type { Lang } from '@/i18n/types'

interface LangToggleProps {
  /** Qué hace el botón, ya traducido: «cambiar el idioma a inglés». */
  label: string
  current: Lang
  /** Los dos idiomas, en el orden en que se muestran. */
  langs: readonly [Lang, Lang]
  onSelect: (lang: Lang) => void
}

/** Separa los dos códigos de idioma; no es texto traducible. */
const SEPARATOR = ' / '

/**
 * Botón de idioma: muestra «ES / EN» con el activo resaltado y, al pulsarlo,
 * pasa al otro. Su nombre accesible empieza por el texto visible y sigue con
 * lo que hace, para que coincida con lo que se ve (WCAG 2.5.3).
 */
export function LangToggle({ label, current, langs, onSelect }: LangToggleProps) {
  const [first, second] = langs
  const next = current === first ? second : first
  const visible = langs.map((lang) => lang.toUpperCase()).join(SEPARATOR)

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={`${visible}: ${label}`}
      onClick={() => onSelect(next)}
    >
      {/* Un solo hijo: dentro del botón flex, cada hijo perdería sus espacios. */}
      <span>
        {langs.map((lang, index) => (
          <span key={lang}>
            {index > 0 && SEPARATOR}
            <span className={lang === current ? styles.current : styles.other}>
              {lang.toUpperCase()}
            </span>
          </span>
        ))}
      </span>
    </button>
  )
}
