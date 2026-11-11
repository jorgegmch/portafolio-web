import { useState, type ReactNode } from 'react'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

interface ContactButtonProps {
  /**
   * whatsapp: abre el chat en una pestaña nueva; copy-email: copia el correo
   * al portapapeles sin mostrarlo.
   */
  kind: 'whatsapp' | 'copy-email'
  /**
   * Nombre del botón, ya traducido; lo aporta quien lo usa. Es su texto
   * visible o, si lleva icono, su nombre accesible.
   */
  label: string
  /** Icono que sustituye al texto visible. Debe ser decorativo. */
  icon?: ReactNode
  /** Icono o logo decorativo delante del texto visible, que no cambia el nombre. */
  leading?: ReactNode
  /** Icono decorativo tras el texto visible (por ejemplo, una flecha). */
  trailing?: ReactNode
  /**
   * Nombre accesible cuando debe decir más que el texto visible (por
   * ejemplo, que se abre en una pestaña nueva). Empieza por ese texto.
   */
  accessibleLabel?: string
  /** Clase del botón: el aspecto lo decide quien lo usa. */
  className?: string
  /** Solo para copy-email: avisos tras copiar o si el navegador no deja. */
  copiedMessage?: string
  copyFailedMessage?: string
  /** Clase de la zona de aviso de copy-email. */
  statusClassName?: string
}

/**
 * Botón de contacto que arma el dato al hacer clic. Antes de la interacción
 * ni el correo ni el número existen en el DOM. El de WhatsApp abre el chat.
 *
 * El de copiar lleva el correo al portapapeles y avisa de que lo hizo, sin
 * escribirlo en la página. Si el navegador no deja copiar (sin permiso o
 * fuera de HTTPS), abre el programa de correo.
 */
export function ContactButton({
  kind,
  label,
  icon,
  leading,
  trailing,
  accessibleLabel,
  className,
  copiedMessage,
  copyFailedMessage,
  statusClassName,
}: ContactButtonProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(getEmail())
      setCopyStatus(copiedMessage ?? null)
    } catch {
      window.open(getEmailUrl(), '_self')
      setCopyStatus(copyFailedMessage ?? null)
    }
  }

  const handleClick = () => {
    if (kind === 'copy-email') {
      void copyEmail()
    } else {
      window.open(getWhatsappUrl(), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={accessibleLabel ?? (icon ? label : undefined)}
        onClick={handleClick}
      >
        {!icon && leading}
        {icon ?? label}
        {!icon && trailing}
      </button>
      {/* La zona de aviso existe desde el render, vacía: así el lector de
          pantalla anuncia el cambio. */}
      {kind === 'copy-email' && (
        <span role="status" className={statusClassName}>
          {copyStatus}
        </span>
      )}
    </>
  )
}
