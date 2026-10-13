import { About } from '@/components/sections/About'
import { Hero } from '@/components/sections/Hero'

/**
 * Página de inicio. Por ahora lleva el Hero y «Sobre mí»; las demás secciones
 * llegan en las fases siguientes. El <main> lo pone el layout, no la página.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <About />
    </>
  )
}
