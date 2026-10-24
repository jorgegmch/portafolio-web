import { About } from '@/components/sections/About'
import { Contact } from '@/components/sections/Contact'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { Services } from '@/components/sections/Services'

/**
 * Página de inicio: las cinco escenas, en el orden de la spec (Hero, Perfil,
 * Servicios, Proyectos y Contacto). El <main> lo pone el layout, no la
 * página.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <Contact />
    </>
  )
}
