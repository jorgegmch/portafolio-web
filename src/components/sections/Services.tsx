import { useId, useState } from 'react'
import styles from '@/components/sections/Services.module.css'
import { Reveal } from '@/components/ui/Reveal'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { sections } from '@/config/routes'
import { projectUrl } from '@/data/projects'
import { type ServiceId, services } from '@/data/services'
import { useLang } from '@/hooks/useLang'
import { sceneNumber } from '@/lib/sceneNumber'

/** Posición de la escena en la página (base 0): Servicios es la segunda. */
const SCENE_INDEX = 1
/** Raya entre el número y el nombre de la escena: signo, no texto traducible. */
const LABEL_DASH = ' — '
/** Fila abierta al cargar: la primera. */
const INITIAL_OPEN: ServiceId | null = services[0]?.id ?? null

/**
 * Escena Servicios (spec §3.3), en el panel Paper. Arriba, los rótulos y el
 * título «Lo que construyo». Debajo, los seis servicios de data/ como un
 * acordeón numerado 01–06: cada título es un <h3> con un botón que abre su
 * fila (aria-expanded y aria-controls). Abierta, la fila enseña la
 * descripción, el enlace al repo que respalda el servicio (en una pestaña
 * nueva; comunicación no enlaza, la respalda un certificado) y un bloque Ink
 * con el icono grande. Hay como mucho una abierta, y al cargar es la 01.
 *
 * El número de cada fila y el signo +/− son adorno: el estado lo dice
 * aria-expanded. El nombre accesible de cada enlace es su título, «Ver
 * proyecto relacionado» y el aviso de pestaña nueva.
 */
export function Services() {
  const { t } = useLang()
  const { services: text } = t
  const labelId = useId()
  const rowId = useId()
  const [openId, setOpenId] = useState<ServiceId | null>(INITIAL_OPEN)

  const toggle = (id: ServiceId) => setOpenId((current) => (current === id ? null : id))

  return (
    <section id={sections.services} className={styles.services} aria-labelledby={labelId}>
      <div className={styles.labels}>
        <p id={labelId} className={styles.label}>
          <span aria-hidden="true">
            {sceneNumber(SCENE_INDEX)}
            {LABEL_DASH}
          </span>
          {text.label}
        </p>
        <p className={styles.tag}>{text.tag}</p>
      </div>

      <Reveal revealKey="services-title" order={0}>
        <h2 className={styles.title}>
          <span className={styles.titleLine}>{text.title[0]}</span>{' '}
          <span className={styles.titleLine}>{text.title[1]}</span>
        </h2>
      </Reveal>

      <ul className={styles.list}>
        {services.map(({ id, icon, project }, index) => {
          const { title, description } = text.items[id]
          const open = openId === id
          const buttonId = `${rowId}-${id}-button`
          const panelId = `${rowId}-${id}-panel`

          return (
            <li key={id} className={open ? `${styles.row} ${styles.open}` : styles.row}>
              <div className={styles.head}>
                <span className={styles.number} aria-hidden="true">
                  {sceneNumber(index)}
                </span>
                <h3 className={styles.rowTitle}>
                  <button
                    id={buttonId}
                    type="button"
                    className={styles.toggle}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(id)}
                  >
                    <span>{title}</span>
                    <span className={styles.sign} aria-hidden="true" />
                  </button>
                </h3>
              </div>

              <div
                id={panelId}
                className={styles.panel}
                role="region"
                aria-labelledby={buttonId}
                hidden={!open}
              >
                <div className={styles.body}>
                  <p className={styles.description}>{description}</p>
                  {project && (
                    <a
                      className={styles.related}
                      href={projectUrl(project)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${title}: ${text.relatedProject} (${t.common.opensInNewTab})`}
                    >
                      {text.relatedProject}
                      <svg
                        className={styles.arrow}
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M7 17 17 7M9 7h8v8" />
                      </svg>
                    </a>
                  )}
                </div>
                <div className={styles.iconBlock}>
                  <ServiceIcon name={icon} className={styles.icon} />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
