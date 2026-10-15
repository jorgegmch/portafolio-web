import { useId } from 'react'
import styles from '@/components/sections/Services.module.css'
import { Reveal, type RevealOrder } from '@/components/ui/Reveal'
import { ServiceCard } from '@/components/ui/ServiceCard'
import { sections } from '@/config/routes'
import { projectUrl } from '@/data/projects'
import { services } from '@/data/services'
import { stackIconUrl, technologies, technologyName } from '@/data/technologies'
import { useLang } from '@/hooks/useLang'

/** Escalonado de las tarjetas: en escritorio, las de cada fila de tres entran una tras otra. */
const CARD_ORDERS: readonly RevealOrder[] = [0, 1, 2, 0, 1, 2]

/** Escalonado de las fichas, en tandas de cuatro. */
const techOrder = (index: number): RevealOrder => {
  const order = index % 4
  return order === 1 || order === 2 || order === 3 ? order : 0
}

/**
 * Lado de la caja del logo, en px: el del token --stack-logo-size, para que
 * el <img> reserve su sitio antes de cargar. Un test ata los dos valores.
 */
const LOGO_SIZE = 48

/**
 * Sección «Servicios», en dos bloques. Arriba, la etiqueta (el h2), una frase
 * grande y seis tarjetas de servicios: las cinco primeras enlazan al repo
 * que respalda cada servicio, en una pestaña nueva; la de comunicación no
 * enlaza, porque la respalda un certificado. Abajo, «Mi stack tecnológico»:
 * su etiqueta, su frase y una ficha por tecnología del catálogo, con el logo
 * y el nombre, sin enlaces, niveles ni porcentajes.
 *
 * Todo aparece al entrar en pantalla, una vez por carga de la página. Cada
 * tarjeta gira (ServiceCard): el frente lleva el icono y el título, y el
 * dorso la descripción y el enlace. Lo que gira, y lo que escala en las
 * fichas, va dentro del <li> que aparece, nunca es el <li>.
 *
 * El nombre accesible de cada enlace es su título, «Ver proyecto relacionado»
 * y el aviso de pestaña nueva. El logo de cada ficha lleva alt vacío: el
 * nombre ya va escrito al lado.
 */
export function Services() {
  const { t } = useLang()
  const headingId = useId()
  const { services: text } = t

  return (
    <section id={sections.services} className={styles.services} aria-labelledby={headingId}>
      <Reveal revealKey="services-heading" order={0}>
        <h2 id={headingId} className={styles.heading}>
          {text.kicker}
        </h2>
      </Reveal>
      <Reveal revealKey="services-phrase" order={1}>
        <p className={styles.phrase}>{text.heading}</p>
      </Reveal>
      <ul className={styles.cards}>
        {services.map(({ id, icon, project }, index) => {
          const { title, description } = text.items[id]
          return (
            <Reveal
              key={id}
              as="li"
              revealKey={`services-card-${id}`}
              order={CARD_ORDERS[index]}
              className={styles.cardItem}
            >
              <ServiceCard
                icon={icon}
                title={title}
                description={description}
                link={
                  project
                    ? {
                        href: projectUrl(project),
                        text: text.relatedProject,
                        label: `${title}: ${text.relatedProject} (${t.common.opensInNewTab})`,
                      }
                    : undefined
                }
              />
            </Reveal>
          )
        })}
      </ul>

      <div className={styles.stack}>
        <Reveal revealKey="services-stack-heading" order={0}>
          <h3 className={styles.stackHeading}>{text.stackKicker}</h3>
        </Reveal>
        <Reveal revealKey="services-stack-phrase" order={1}>
          <p className={styles.stackPhrase}>{text.stackHeading}</p>
        </Reveal>
        <ul className={styles.techList}>
          {technologies.map((technology, index) => (
            <Reveal
              key={technology.id}
              as="li"
              revealKey={`services-tech-${technology.id}`}
              order={techOrder(index)}
              className={styles.techItem}
            >
              <div className={styles.chip}>
                <img
                  className={styles.chipLogo}
                  src={stackIconUrl(technology)}
                  alt=""
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                  loading="lazy"
                  decoding="async"
                />
                <span className={styles.chipName}>{technologyName(technology.id)}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
