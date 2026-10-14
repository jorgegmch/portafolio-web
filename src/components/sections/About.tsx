import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '@/components/sections/About.module.css'
import { StatIcon } from '@/components/ui/StatIcon'
import { TerminalPanel } from '@/components/ui/TerminalPanel'
import { WorldMap } from '@/components/ui/WorldMap'
import { HIGHLIGHT_PHRASE } from '@/config/about'
import { developer } from '@/config/developer'
import { routes, sections } from '@/config/routes'
import { site } from '@/config/site'
import { builtProjects } from '@/data/projects'
import { technologies } from '@/data/technologies'
import { useAge } from '@/hooks/useAge'
import { useLang } from '@/hooks/useLang'
import { toDateParts } from '@/lib/calculateAge'
import { codingTime } from '@/lib/codingTime'
import { formatCount } from '@/lib/formatCount'
import { roundedCount } from '@/lib/roundedCount'

/**
 * Sección «Sobre mí»: título, una frase grande, la descripción en cuatro
 * párrafos con el enlace a las certificaciones debajo, la terminal del
 * desarrollador con el mapa debajo y tres tarjetas con cifras.
 * La frase es un párrafo, no un título; su tramo final va en un span que
 * config/about puede resaltar. Desde 1024 px la descripción y el enlace
 * ocupan la columna izquierda, y la terminal y el mapa la derecha; por
 * debajo, todo va apilado. Las tarjetas van después, a todo el ancho. El
 * mapa es decorativo: no añade nada al texto de la sección.
 *
 * La terminal muestra los campos de config/developer. La edad es en vivo: al
 * DOM solo llega el número, nunca la fecha de nacimiento.
 *
 * Las cifras de las tarjetas salen de config y de data/, nunca escritas a
 * mano, y aparecen ya con su valor final, sin conteo. El tiempo programando
 * se calcula con la fecha del día en que se monta la sección: solo cambia al
 * empezar un mes, así que no lleva temporizador. Una cifra aproximada lleva
 * un «+» dentro de su propio span, del lado que pide el idioma; la de
 * tecnologías es siempre exacta. El icono de cada tarjeta es decorativo.
 */
export function About() {
  const { t } = useLang()
  const headingId = useId()
  const { lead, highlight } = t.about.phrase
  const age = useAge()
  const terminalLines = developer.fields.map((field) => ({
    name: developer.labels[field],
    value: field === 'age' ? String(age) : developer.values[field],
  }))
  const [today] = useState(() => toDateParts(new Date()))
  const time = codingTime(site.codingSince, today)
  const stats = [
    {
      id: 'codingTime',
      icon: 'clock',
      count: time,
      label: t.about.stats.codingTime[time.unit],
    },
    {
      id: 'projects',
      icon: 'folder',
      count: roundedCount(builtProjects.length),
      label: t.about.stats.projects,
    },
    {
      id: 'technologies',
      icon: 'layers',
      count: { value: technologies.length, approximate: false },
      label: t.about.stats.technologies,
    },
  ] as const

  return (
    <section id={sections.about} className={styles.about} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t.about.heading}
      </h2>
      <p className={styles.phrase}>
        {lead}
        <span className={HIGHLIGHT_PHRASE ? styles.highlight : undefined}>{highlight}</span>
      </p>
      <div className={styles.columns}>
        <div className={styles.text}>
          <div className={styles.bio}>
            {t.about.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <Link className={styles.cta} to={routes.certifications}>
            {t.about.viewCertifications}
          </Link>
        </div>
        <div className={styles.terminal}>
          <TerminalPanel
            className={styles.panel}
            label={t.about.terminalLabel}
            command={developer.command}
            lines={terminalLines}
          />
          <WorldMap className={styles.map} />
        </div>
      </div>
      <ul className={styles.stats}>
        {stats.map(({ id, icon, count, label }) => (
          <li key={id} className={styles.stat}>
            <span className={styles.statValue}>
              {formatCount(count, t.about.stats.plusPosition)}
            </span>
            <StatIcon name={icon} className={styles.statIcon} />
            <span className={styles.statLabel}>{label(count.value)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
