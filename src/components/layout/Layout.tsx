import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { FilmGrain } from '@/components/layout/FilmGrain'
import { Footer } from '@/components/layout/Footer'
import styles from '@/components/layout/Layout.module.css'
import { LoadingIntro } from '@/components/layout/LoadingIntro'
import { Navbar } from '@/components/layout/Navbar'
import { SkipLink } from '@/components/ui/SkipLink'
import { MAIN_CONTENT_ID } from '@/config/routes'
import { IntroPlayingContext } from '@/hooks/IntroPlayingContext'
import { MotionPauseContext } from '@/hooks/MotionPauseContext'
import { useCurtain } from '@/hooks/useCurtain'
import { useIntroGate } from '@/hooks/useIntroGate'
import { useLang } from '@/hooks/useLang'
import { useScrollToHash } from '@/hooks/useScrollToHash'

/**
 * Armazón común a todas las páginas: animación de carga, skip link, grano,
 * navegación, contenido principal y pie. Cada escena y el pie son
 * paneles separados por el Void; la navegación va sobre el primero, el del
 * Hero. La página de cada ruta llega como children.
 *
 * Publica dos estados: si la animación de carga sigue encima, para que la
 * página no empiece debajo de ella lo que todavía no se ve, y si el
 * visitante pausó las animaciones. La pausa vive en memoria, sin storage; el
 * atributo data-motion deja que el CSS la aplique a toda la página.
 *
 * Entre escena y escena hay una cortina: cada panel se queda fijo y el
 * siguiente sube encima (CSS, solo donde el navegador lo admite y sin
 * movimiento reducido). useCurtain le da a cada panel su punto de fijado y
 * destapa el foco si cae bajo el panel siguiente.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useLang()
  const mainRef = useRef<HTMLElement>(null)
  const [introPlaying, finishIntro] = useIntroGate()
  const [motionPaused, setMotionPaused] = useState(false)
  const togglePaused = useCallback(() => setMotionPaused((paused) => !paused), [])
  const motionPause = useMemo(
    () => ({ paused: motionPaused, togglePaused }),
    [motionPaused, togglePaused],
  )
  useScrollToHash()
  useCurtain(mainRef)

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
          <FilmGrain />
          <Navbar />
          {/* tabIndex -1: el skip link puede llevar el foco aquí sin que entre en el orden de tabulación. */}
          <main ref={mainRef} id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </MotionPauseContext>
    </IntroPlayingContext>
  )
}
