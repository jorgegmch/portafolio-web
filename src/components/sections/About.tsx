import { useId, useState } from 'react'
import styles from '@/components/sections/About.module.css'
import { Reveal, type RevealOrder } from '@/components/ui/Reveal'
import { Translator, type TranslatorItem } from '@/components/ui/Translator'
import { sections } from '@/config/routes'
import { site } from '@/config/site'
import { certifications } from '@/data/certifications'
import { education } from '@/data/education'
import { builtProjects, type ProjectId, projects, projectUrl } from '@/data/projects'
import { technologies } from '@/data/technologies'
import { translatorExamples } from '@/data/translator'
import { useLang } from '@/hooks/useLang'
import { codingTime } from '@/lib/codingTime'
import { toDateParts } from '@/lib/dateParts'
import { formatCount } from '@/lib/formatCount'
import { roundedCount } from '@/lib/roundedCount'
import { sceneNumber } from '@/lib/sceneNumber'

/** Escalonado de las tarjetas, que suelen entrar en pantalla a la vez. */
const STAT_ORDERS: readonly RevealOrder[] = [0, 1, 2]

/** Posición de la escena en la página: la numeración del rótulo. */
const SCENE_INDEX = 0

/** Signos que no son texto traducible. */
const LABEL_DASH = ' — '
const DATA_SEPARATOR = ' · '

/** Título del proyecto de un ejemplo del Traductor. */
const projectTitle = (id: ProjectId) => projects.find((project) => project.id === id)?.title ?? id

/**
 * Escena Perfil, en el panel Graphite (spec §3.2). Arriba, su rótulo
 * numerado y una etiqueta en mono; luego la frase grande, rellena en su
 * primera línea y en contorno en la segunda (el h2). Debajo, a la izquierda,
 * la bio en dos párrafos, tres tarjetas con cifras y la formación; a la
 * derecha, el Traductor.
 *
 * Las cifras salen de config y de data/, nunca escritas a mano, y aparecen ya
 * con su valor final. El tiempo programando se calcula con la fecha del día
 * en que se monta la sección: solo cambia al empezar un mes, así que no lleva
 * temporizador. Una cifra aproximada lleva un «+» del lado que pide el
 * idioma; la de tecnologías es siempre exacta.
 *
 * La formación sale del registro de certificaciones: título oficial, en su
 * idioma original (con la traducción entre paréntesis donde hace falta), y
 * entidad. Los ejemplos del Traductor juntan lo que pide el negocio, de
 * i18n, con el código real de data/translator.
 */
export function About() {
  const { t } = useLang()
  const labelId = useId()
  const { phrase, translator } = t.about
  const [today] = useState(() => toDateParts(new Date()))
  const time = codingTime(site.codingSince, today)
  const stats = [
    { id: 'codingTime', count: time, label: t.about.stats.codingTime[time.unit] },
    { id: 'projects', count: roundedCount(builtProjects.length), label: t.about.stats.projects },
    {
      id: 'technologies',
      count: { value: technologies.length, approximate: false },
      label: t.about.stats.technologies,
    },
  ] as const
  const rows = education.map((id) => {
    const record = certifications.find((certification) => certification.id === id)
    const translation = t.about.educationTranslation[id]
    return {
      id,
      title: translation ? `${record?.title ?? ''} (${translation})` : (record?.title ?? ''),
      entity: record?.entity ?? '',
    }
  })
  const examples: TranslatorItem[] = translatorExamples.map((example) => ({
    id: example.id,
    tab: translator.items[example.id].tab,
    say: translator.items[example.id].say,
    where: `${projectTitle(example.project)}${DATA_SEPARATOR}${example.file}`,
    href: projectUrl(example.project),
    code: example.code,
  }))

  return (
    <section id={sections.about} className={styles.about} aria-labelledby={labelId}>
      <div className={styles.labels}>
        <p id={labelId} className={styles.label}>
          <span aria-hidden="true">
            {sceneNumber(SCENE_INDEX)}
            {LABEL_DASH}
          </span>
          {t.about.label}
        </p>
        <p className={styles.tag}>{t.about.tag}</p>
      </div>

      <Reveal revealKey="about-phrase" order={0}>
        <h2 className={styles.phrase}>
          <span className={styles.filled}>{phrase.filled}</span>{' '}
          <span className={styles.outline}>{phrase.outline}</span>
        </h2>
      </Reveal>

      <div className={styles.columns}>
        <div className={styles.main}>
          <div className={styles.bio}>
            {t.about.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <ul className={styles.stats}>
            {stats.map(({ id, count, label }, index) => (
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
                  <span className={styles.statLabel}>{label(count.value)}</span>
                </div>
              </Reveal>
            ))}
          </ul>

          <div className={styles.education}>
            <h3 className={styles.educationLabel}>{t.about.educationLabel}</h3>
            <ul className={styles.educationList}>
              {rows.map(({ id, title, entity }) => (
                <li key={id} className={styles.educationRow}>
                  <span className={styles.educationTitle}>{title}</span>
                  <span className={styles.educationEntity}>{entity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Translator
          label={translator.label}
          examplesLabel={translator.examplesLabel}
          saysLabel={translator.saysLabel}
          writesLabel={translator.writesLabel}
          viewRepo={translator.viewRepo}
          opensInNewTab={t.common.opensInNewTab}
          items={examples}
        />
      </div>
    </section>
  )
}
