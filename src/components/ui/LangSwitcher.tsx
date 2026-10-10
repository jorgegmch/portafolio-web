import { useId } from 'react'
import styles from '@/components/ui/LangSwitcher.module.css'
import { useDismissibleMenu } from '@/hooks/useDismissibleMenu'
import type { Lang } from '@/i18n/types'

interface LangSwitcherProps {
  /** Nombre del control, ya traducido (por ejemplo, "Idioma"). */
  label: string
  current: Lang
  /** Idiomas disponibles, con su nombre tal como se muestra. */
  options: readonly { lang: Lang; name: string }[]
  onSelect: (lang: Lang) => void
}

/**
 * Selector de idioma: un botón que despliega la lista de idiomas. Se abre con
 * Enter o Espacio (es un botón nativo) y se cierra con Escape, al elegir, al
 * hacer clic fuera o al salir con Tab.
 */
export function LangSwitcher({ label, current, options, onSelect }: LangSwitcherProps) {
  const { open, setOpen, toggleRef, areaRef } = useDismissibleMenu<HTMLDivElement>()
  const listId = useId()

  const select = (lang: Lang) => {
    onSelect(lang)
    setOpen(false)
    toggleRef.current?.focus()
  }

  const currentName = options.find((option) => option.lang === current)?.name ?? current

  return (
    <div ref={areaRef} className={styles.root}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-label={`${label}: ${currentName}`}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {currentName}
      </button>
      <ul id={listId} className={styles.list} hidden={!open}>
        {options.map(({ lang, name }) => (
          <li key={lang}>
            <button
              type="button"
              className={styles.option}
              lang={lang}
              aria-current={lang === current ? 'true' : undefined}
              onClick={() => select(lang)}
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
