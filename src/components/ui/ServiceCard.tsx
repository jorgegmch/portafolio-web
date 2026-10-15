import { useEffect, useId, useRef, useState } from 'react'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import styles from '@/components/ui/ServiceCard.module.css'
import type { ServiceIconName } from '@/data/types'

export interface ServiceCardLink {
  href: string
  /** Texto visible del enlace. */
  text: string
  /** Nombre accesible completo, con el aviso de pestaña nueva. */
  label: string
}

interface ServiceCardProps {
  icon: ServiceIconName
  title: string
  description: string
  /** Enlace del dorso; sin él, el dorso solo lleva la descripción. */
  link?: ServiceCardLink
}

/**
 * Tarjeta de un servicio que gira. Frente: el icono y el título. Dorso: la
 * descripción y, si lo hay, el enlace al repo que la respalda. Gira con un
 * clic, un toque, Enter o Espacio, y vuelve igual; cada tarjeta por su cuenta
 * y sin guardar el estado.
 *
 * Accesible como un desplegable: el título es un <h3> con un botón dentro
 * (aria-expanded y aria-controls apuntan al dorso), y el dorso es un grupo
 * con el nombre del título. La cara que no se ve es inerte: no recibe foco ni
 * clics. Como el botón que se pulsa queda en esa cara, el foco pasa al botón
 * de la otra al girar. Sin girar, la descripción llega como descripción
 * accesible del botón del frente, desde una copia oculta con `hidden`.
 *
 * Las dos caras van en la misma celda de rejilla: la tarjeta mide lo que la
 * más alta. Con movimiento reducido no gira: la cara cambia con un fundido.
 */
export function ServiceCard({ icon, title, description, link }: ServiceCardProps) {
  const id = useId()
  const titleId = `${id}-title`
  const backId = `${id}-back`
  const descriptionId = `${id}-description`
  const [flipped, setFlipped] = useState(false)
  const frontButton = useRef<HTMLButtonElement>(null)
  const backButton = useRef<HTMLButtonElement>(null)
  // Solo se mueve el foco tras girar, no al montar.
  const moveFocus = useRef(false)

  useEffect(() => {
    if (!moveFocus.current) return
    moveFocus.current = false
    ;(flipped ? backButton : frontButton).current?.focus()
  }, [flipped])

  const toggle = () => {
    moveFocus.current = true
    setFlipped((value) => !value)
  }

  return (
    <div className={flipped ? `${styles.card} ${styles.flipped}` : styles.card}>
      <div className={styles.inner}>
        <div className={styles.front} inert={flipped}>
          <ServiceIcon name={icon} className={styles.icon} />
          <h3 id={titleId} className={styles.title}>
            <button
              ref={frontButton}
              type="button"
              className={styles.flip}
              aria-expanded={flipped}
              aria-controls={backId}
              aria-describedby={descriptionId}
              onClick={toggle}
            >
              {title}
            </button>
          </h3>
          {/* Copia de la descripción para el botón: Chromium no calcula una
              descripción desde contenido inerte, y el dorso lo es mientras
              no se ve. Con `hidden` no se lee al recorrer la página ni ocupa
              sitio: solo sirve de descripción. */}
          <p id={descriptionId} hidden>
            {description}
          </p>
        </div>
        <div
          id={backId}
          className={styles.back}
          role="group"
          aria-labelledby={titleId}
          inert={!flipped}
        >
          <p className={styles.text}>{description}</p>
          {link && (
            <a
              className={styles.link}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
            >
              {link.text}
              <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          )}
          <button
            ref={backButton}
            type="button"
            className={styles.flipBack}
            aria-expanded={flipped}
            aria-controls={backId}
            aria-label={title}
            onClick={toggle}
          />
        </div>
      </div>
    </div>
  )
}
