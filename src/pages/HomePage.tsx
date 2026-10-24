import { About } from '@/components/sections/About'
import { Hero } from '@/components/sections/Hero'
import { Projects } from '@/components/sections/Projects'
import { Services } from '@/components/sections/Services'

/**
 * Página de inicio. Por ahora lleva el Hero, Perfil, Servicios y Proyectos;
 * Contacto llega en la fase siguiente. El <main> lo pone el layout, no la
 * página.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
    </>
  )
}
