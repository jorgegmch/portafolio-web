import { type CSSProperties, useId, useRef } from 'react'
import styles from '@/components/sections/Projects.module.css'
import { CrossedRibbons } from '@/components/ui/CrossedRibbons'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { Reveal } from '@/components/ui/Reveal'
import { sections } from '@/config/routes'
import { codeFragments } from '@/data/codeRibbon'
import { allProjectsUrl, featuredProjects, projectUrl } from '@/data/projects'
import { useCardStack } from '@/hooks/useCardStack'
import { useLang } from '@/hooks/useLang'
import { sceneNumber } from '@/lib/sceneNumber'
import { twoDigits } from '@/lib/twoDigits'

/** Posición de la escena en la página (base 0): Proyectos es la tercera. */
const SCENE_INDEX = 2
/** Raya entre el número y el nombre de la escena: signo, no texto traducible. */
const LABEL_DASH = ' — '
/** Paréntesis de la cuenta junto al título: signos, no texto traducible. */
const COUNT_OPEN = '('
const COUNT_CLOSE = ')'

/**
 * Escena Proyectos (spec §3.4), en el panel Deep. Arriba, el rótulo y «Ver
 * todos en GitHub ↗»; luego el título con la cuenta de destacados, que sale
 * de data/ («(05)»). Debajo, una tarjeta por proyecto destacado, en el orden
 * de data/projects.ts: el primero es el protagonista y lleva su etiqueta y
 * tres capturas; los demás, una.
 *
 * En escritorio las tarjetas se apilan: cada una se fija un poco más abajo
 * que la anterior y la siguiente sube encima, mientras la de debajo se
 * encoge y se atenúa (CSS, con la misma mejora progresiva que la cortina).
 * La franja de arriba de cada tarjeta, con su enlace, sigue a la vista
 * cuando la siguiente sube encima, también al salir la pila, aunque las
 * tarjetas no midan lo mismo (useCardStack).
 *
 * En su borde superior van las cintas cruzadas, que suben por encima del
 * pie de Servicios: este panel se pinta sobre el anterior, así que lo que
 * cuelga de aquí queda encima del borde entre los dos.
 */
export function Projects() {
  const { t } = useLang()
  const { projects: text, services, common } = t
  const labelId = useId()
  const stackRef = useRef<HTMLDivElement>(null)
  useCardStack(stackRef)
  // Valor dinámico: el CSS de la pila necesita saber cuántas tarjetas hay.
  const stackSize: CSSProperties & Record<'--card-count', number> = {
    '--card-count': featuredProjects.length,
  }

  return (
    <section id={sections.projects} className={styles.projects} aria-labelledby={labelId}>
      <CrossedRibbons
        className={styles.ribbons}
        code={codeFragments}
        codeLabel={services.ribbons.codeLabel}
        verbs={services.ribbons.verbs}
        verbsLabel={services.ribbons.verbsLabel}
      />

      <div className={styles.labels}>
        <p id={labelId} className={styles.label}>
          <span aria-hidden="true">
            {sceneNumber(SCENE_INDEX)}
            {LABEL_DASH}
          </span>
          {text.label}
        </p>
        <a
          className={styles.viewAll}
          href={allProjectsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${text.viewAll} (${common.opensInNewTab})`}
        >
          {text.viewAll}
          <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </a>
      </div>

      <Reveal revealKey="projects-title" order={0}>
        <h2 className={styles.title}>
          {text.label}
          <span className={styles.count}>
            {COUNT_OPEN}
            {twoDigits(featuredProjects.length)}
            {COUNT_CLOSE}
          </span>
        </h2>
      </Reveal>

      <div ref={stackRef} className={styles.stack} style={stackSize}>
        {featuredProjects.map(({ id, title, stack }, index) => (
          <ProjectCard
            key={id}
            number={sceneNumber(index)}
            index={index}
            title={title}
            description={text.items[id].description}
            stack={stack}
            stackLabel={text.stackLabel}
            href={projectUrl(id)}
            viewCode={text.viewCode}
            opensInNewTab={common.opensInNewTab}
            mainLabel={index === 0 ? text.mainProject : undefined}
            shots={index === 0 ? 3 : 1}
            shotPending={text.screenshotPending}
          />
        ))}
      </div>
    </section>
  )
}
