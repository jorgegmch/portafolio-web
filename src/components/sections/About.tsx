import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from '@/components/sections/About.module.css'
import { Reveal, type RevealOrder } from '@/components/ui/Reveal'
import { StatIcon } from '@/components/ui/StatIcon'
import { TerminalPanel } from '@/components/ui/TerminalPanel'
import { TypedText } from '@/components/ui/TypedText'
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

/** Escalonado de las tarjetas, que suelen entrar en pantalla a la vez. */
const STAT_ORDERS: readonly RevealOrder[] = [0, 1, 2]

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
 * Al entrar en pantalla aparecen, escalonados, el título, la frase, la
 * terminal, el enlace, el mapa y las tarjetas, cada uno una sola vez por
 * carga de la página. La descripción no aparece con ellos: se escribe
 * palabra por palabra, con su propio aviso, y termina con un cursor; el
 * texto completo está siempre en el DOM. Lo que escala bajo el puntero (la
 * terminal y la caja de cada tarjeta) va dentro de lo que aparece, nunca es
 * lo mismo: en las tarjetas, el <li> aparece y la caja va dentro.
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
      <Reveal revealKey="about-heading" order={0}>
        <h2 id={headingId} className={styles.heading}>
          {t.about.heading}
        </h2>
      </Reveal>
      <Reveal revealKey="about-phrase" order={1}>
        <p className={styles.phrase}>
          {lead}
          <span className={HIGHLIGHT_PHRASE ? styles.highlight : undefined}>{highlight}</span>
        </p>
      </Reveal>
      <div className={styles.columns}>
        <div className={styles.text}>
          <TypedText revealKey="about-bio" paragraphs={t.about.bio} className={styles.bio} />
          <Reveal revealKey="about-cta" order={2}>
            <Link className={styles.cta} to={routes.certifications}>
              {t.about.viewCertifications}
            </Link>
          </Reveal>
        </div>
        <div className={styles.terminal}>
          <Reveal revealKey="about-terminal" order={2}>
            <TerminalPanel
              className={styles.panel}
              label={t.about.terminalLabel}
              command={developer.command}
              lines={terminalLines}
            />
          </Reveal>
          <Reveal revealKey="about-map" order={3}>
            <WorldMap className={styles.map} />
          </Reveal>
        </div>
      </div>
      <ul className={styles.stats}>
        {stats.map(({ id, icon, count, label }, index) => (
          <Reveal
            key={id}
            as="li"
            revealKey={`about-stat-${id}`}
            order={STAT_ORDERS[index]}
            className={styles.statItem}
          >
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {formatCount(count, t.about.stats.plusPosition)}
              </span>
              <StatIcon name={icon} className={styles.statIcon} />
              <span className={styles.statLabel}>{label(count.value)}</span>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
