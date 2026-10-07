import { useEffect, useId, useRef, useState } from 'react'
import styles from '@/components/ui/LangSwitcher.module.css'
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
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  // Los listeners solo existen mientras el menú está abierto.
  useEffect(() => {
    if (!open) return

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && !rootRef.current?.contains(target)

    const closeIfOutside = (event: Event) => {
      if (isOutside(event.target)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }

    document.addEventListener('pointerdown', closeIfOutside)
    document.addEventListener('focusin', closeIfOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeIfOutside)
      document.removeEventListener('focusin', closeIfOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const select = (lang: Lang) => {
    onSelect(lang)
    setOpen(false)
    toggleRef.current?.focus()
  }

  const currentName = options.find((option) => option.lang === current)?.name ?? current

  return (
    <div ref={rootRef} className={styles.root}>
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
