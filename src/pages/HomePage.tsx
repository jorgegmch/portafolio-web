import { About } from '@/components/sections/About'
import { Hero } from '@/components/sections/Hero'
import { Services } from '@/components/sections/Services'

/**
 * Página de inicio. Por ahora lleva el Hero, «Sobre mí» y «Servicios»; las
 * demás secciones llegan en las fases siguientes. El <main> lo pone el
 * layout, no la página.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
    </>
  )
}
