import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { FilmGrain } from '@/components/layout/FilmGrain'
import { Footer } from '@/components/layout/Footer'
import styles from '@/components/layout/Layout.module.css'
import { LoadingIntro } from '@/components/layout/LoadingIntro'
import { Navbar } from '@/components/layout/Navbar'
import { ParticleBackground } from '@/components/layout/ParticleBackground'
import { SkipLink } from '@/components/ui/SkipLink'
import { MAIN_CONTENT_ID } from '@/config/routes'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { MotionPauseContext } from '@/hooks/MotionPauseContext'
import { useIntroGate } from '@/hooks/useIntroGate'
import { useLang } from '@/hooks/useLang'
import { useScrollToHash } from '@/hooks/useScrollToHash'

/**
 * Armazón común a todas las páginas: animación de carga, skip link, fondo,
 * grano, navegación, contenido principal y pie. Cada escena y el pie son
 * paneles separados por el Void; la navegación va sobre el primero, el del
 * Hero. La página de cada ruta llega como children.
 *
 * Publica dos estados: si la animación de carga sigue encima, para que la
 * página no empiece debajo de ella lo que todavía no se ve, y si el
 * visitante pausó las animaciones. La pausa vive en memoria, sin storage; el
 * atributo data-motion deja que el CSS la aplique a toda la página.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const [introPlaying, finishIntro] = useIntroGate()
  const [motionPaused, setMotionPaused] = useState(false)
  const togglePaused = useCallback(() => setMotionPaused((paused) => !paused), [])
  const motionPause = useMemo(
    () => ({ paused: motionPaused, togglePaused }),
    [motionPaused, togglePaused],
  )
  useScrollToHash()

  return (
    <IntroPlayingContext value={introPlaying}>
      <MotionPauseContext value={motionPause}>
        {introPlaying && <LoadingIntro onDone={finishIntro} />}
        {/* inert: mientras la intro tapa la página, nada de debajo recibe foco ni clics. */}
        <div
          className={styles.frame}
          inert={introPlaying}
          data-motion={motionPaused ? 'paused' : 'running'}
        >
          <SkipLink targetId={MAIN_CONTENT_ID} label={t.nav.skipToContent} />
          <ParticleBackground />
          <FilmGrain />
          <Navbar />
          {/* tabIndex -1: el skip link puede llevar el foco aquí sin que entre en el orden de tabulación. */}
          <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </MotionPauseContext>
    </IntroPlayingContext>
  )
}
