import { useLang } from '@/hooks/useLang'
import styles from '@/pages/CertificationsPage.module.css'

/**
 * Página de certificaciones. Por ahora solo lleva su título; el listado llega
 * en una fase posterior. El <main> lo pone el layout, no la página.
 */
export function CertificationsPage() {
  const { t } = useLang()

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.certifications.heading}</h1>
    </div>
  )
}
