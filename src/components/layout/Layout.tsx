import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import styles from '@/components/layout/Layout.module.css'
import { LoadingIntro } from '@/components/layout/LoadingIntro'
import { Navbar } from '@/components/layout/Navbar'
import { ParticleBackground } from '@/components/layout/ParticleBackground'
import { SkipLink } from '@/components/ui/SkipLink'
import { MAIN_CONTENT_ID } from '@/config/routes'
import { useIntroGate } from '@/hooks/useIntroGate'
import { useLang } from '@/hooks/useLang'
import { useScrollToHash } from '@/hooks/useScrollToHash'

/**
 * Armazón común a todas las páginas: animación de carga, skip link, fondo,
 * barra, contenido principal y pie. La página de cada ruta llega como children.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [introPlaying, finishIntro] = useIntroGate()
  useScrollToHash()

  return (
    <>
      {introPlaying && <LoadingIntro onDone={finishIntro} />}
      {/* inert: mientras la intro tapa la página, nada de debajo recibe foco ni clics. */}
      <div inert={introPlaying}>
        <SkipLink targetId={MAIN_CONTENT_ID} label={t.nav.skipToContent} />
        <ParticleBackground />
        <Navbar />
        {/* tabIndex -1: el skip link puede llevar el foco aquí sin que entre en el orden de tabulación. */}
        <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}
