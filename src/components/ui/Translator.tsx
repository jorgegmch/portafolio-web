import { useId, useState } from 'react'
import styles from '@/components/ui/Translator.module.css'
import type { CodeSegment } from '@/data/translator'
import { useIntroPlaying } from '@/hooks/useIntroPlaying'
import { useMotionPause } from '@/hooks/useMotionPause'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useRotatingIndex } from '@/hooks/useRotatingIndex'

/** Cada cuánto pasa sola a la pestaña siguiente (spec §3.2). */
export const TRANSLATOR_INTERVAL_MS = 4200

export interface TranslatorItem {
  id: string
  /** Texto de la pestaña. */
  tab: string
  /** Lo que pide el negocio, en palabras de cliente. */
  say: string
  /** De dónde sale el código: proyecto y archivo. */
  where: string
  /** Repo del proyecto. */
  href: string
  code: readonly (readonly CodeSegment[])[]
}

interface TranslatorProps {
  label: string
  examplesLabel: string
  saysLabel: string
  writesLabel: string
  viewRepo: string
  /** Aviso de pestaña nueva, para el nombre accesible del enlace. */
  opensInNewTab: string
  items: readonly TranslatorItem[]
}

/** Separa el texto del enlace de su origen en el nombre accesible. */
const NAME_SEPARATOR = ': '

/**
 * El momento de firma de Perfil: lo que pide el negocio, una flecha y el
 * código real que lo resuelve, con su origen y el enlace al repo. Las
 * pestañas (con aria-pressed) eligen el ejemplo.
 *
 * Pasa sola de un ejemplo al siguiente cada 4,2 s, salvo que el visitante
 * haya elegido uno, haya pausado las animaciones o pida movimiento reducido,
 * o que la animación de carga siga encima. El cambio no se anuncia: un
 * lector de pantalla oye el ejemplo al llegar a él.
 *
 * Al rotar, el bloque no cambia de alto: de lo que varía (la frase, el
 * código y su origen) van todos los ejemplos a la vez, apilados en la misma
 * celda de una rejilla, y solo el activo se ve. El alto es siempre el del
 * mayor, sin medir nada. Antes, cada rotación movía la página entera.
 */
export function Translator({
  label,
  examplesLabel,
  saysLabel,
  writesLabel,
  viewRepo,
  opensInNewTab,
  items,
}: TranslatorProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const reducedMotion = useReducedMotion()
  const introPlaying = useIntroPlaying()
  const { paused } = useMotionPause()
  const writesId = useId()
  const rotating = useRotatingIndex(items.length, {
    intervalMs: TRANSLATOR_INTERVAL_MS,
    paused: picked !== null || paused || reducedMotion || introPlaying,
  })
  const active = picked ?? rotating

  if (!items[active]) return null

  // Capa de un ejemplo en las pilas: la activa se ve y se lee; las demás
  // siguen ocupando su sitio, ocultas, fuera del árbol accesible y del foco.
  const layer = (index: number) =>
    index === active ? { 'data-active': '' } : { 'aria-hidden': true as const, inert: true }

  return (
    <div className={styles.translator}>
      <div className={styles.head}>
        <h3 className={styles.label}>{label}</h3>
        <div className={styles.tabs} role="group" aria-label={examplesLabel}>
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={styles.tab}
              aria-pressed={index === active}
              onClick={() => setPicked(index)}
            >
              {item.tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.block}>
        <p className={styles.caption}>{saysLabel}</p>
        <div className={styles.stack}>
          {items.map((item, index) => (
            <p key={item.id} className={styles.say} {...layer(index)}>
              <q>{item.say}</q>
            </p>
          ))}
        </div>
      </div>

      <div className={styles.flow} aria-hidden="true">
        <span className={styles.rule} />
        <svg className={styles.arrow} viewBox="0 0 24 24" focusable="false">
          <path d="M12 4v16M6 14l6 6 6-6" />
        </svg>
        <span className={styles.rule} />
      </div>

      <div className={styles.block}>
        <p id={writesId} className={styles.caption}>
          {writesLabel}
        </p>
        {/* Las líneas de código no se parten: en pantallas estrechas el bloque
            se desplaza en horizontal. Para que eso también se pueda hacer con
            el teclado, el bloque recibe el foco y se nombra con su rótulo
            (regla scrollable-region-focusable de axe). */}
        <div className={styles.stack}>
          {items.map((item, index) => (
            <pre
              key={item.id}
              className={styles.code}
              role="region"
              aria-labelledby={writesId}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
              {...layer(index)}
            >
              <code>
                {/* Las líneas son fijas por ejemplo: su posición es su identidad. */}
                {item.code.map((line, lineIndex) => (
                  <span key={lineIndex} className={styles.line}>
                    {line.map((segment, segmentIndex) => (
                      <span
                        key={segmentIndex}
                        className={segment.kind ? styles[segment.kind] : undefined}
                      >
                        {segment.text}
                      </span>
                    ))}
                  </span>
                ))}
              </code>
            </pre>
          ))}
        </div>
      </div>

      <div className={styles.stack}>
        {items.map((item, index) => (
          <div key={item.id} className={styles.source} {...layer(index)}>
            <span>{item.where}</span>
            <a
              className={styles.repo}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${viewRepo}${NAME_SEPARATOR}${item.where} (${opensInNewTab})`}
            >
              {viewRepo}
              <svg className={styles.external} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
