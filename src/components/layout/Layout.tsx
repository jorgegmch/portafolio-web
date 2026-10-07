import type { ReactNode } from 'react'
import { Footer } from '@/components/layout/Footer'
import styles from '@/components/layout/Layout.module.css'
import { Navbar } from '@/components/layout/Navbar'
import { ParticleBackground } from '@/components/layout/ParticleBackground'
import { SkipLink } from '@/components/ui/SkipLink'
import { MAIN_CONTENT_ID } from '@/config/routes'
import { useLang } from '@/hooks/useLang'
import { useScrollToHash } from '@/hooks/useScrollToHash'

/**
 * Armazón común a todas las páginas: skip link, fondo, barra, contenido
 * principal y pie. La página de cada ruta llega como children.
 */
export function Layout({ children }: { children: ReactNode }) {
  const { t } = useLang()
  useScrollToHash()

  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID} label={t.nav.skipToContent} />
      <ParticleBackground />
      <Navbar />
      {/* tabIndex -1: el skip link puede llevar el foco aquí sin que entre en el orden de tabulación. */}
      <main id={MAIN_CONTENT_ID} className={styles.main} tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
