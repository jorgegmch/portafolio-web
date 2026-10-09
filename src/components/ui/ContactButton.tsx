import { useState, type ReactNode } from 'react'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

interface ContactButtonProps {
  kind: 'email' | 'whatsapp'
  /**
   * Nombre del botón, ya traducido; lo aporta quien lo usa. Es su texto
   * visible o, si lleva icono, su nombre accesible.
   */
  label: string
  /** Icono que sustituye al texto visible. Debe ser decorativo. */
  icon?: ReactNode
  /** Clase del botón: el aspecto lo decide quien lo usa. */
  className?: string
  /**
   * Solo para el de email: con `false` abre el cliente de correo sin mostrar
   * el correo como texto, para donde ese texto no tiene sitio.
   */
  reveal?: boolean
}

/**
 * Botón de contacto que arma el dato al hacer clic. Antes de la interacción
 * ni el correo ni el número existen en el DOM. El de email además muestra el
 * correo como texto, para quien no tenga cliente de correo y quiera copiarlo,
 * salvo que se pida no revelarlo; el de WhatsApp solo abre el enlace.
 */
export function ContactButton({ kind, label, icon, className, reveal = true }: ContactButtonProps) {
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null)
  const revealsEmail = kind === 'email' && reveal

  const handleClick = () => {
    if (kind === 'email') {
      if (revealsEmail) setRevealedEmail(getEmail())
      window.open(getEmailUrl(), '_self')
    } else {
      window.open(getWhatsappUrl(), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={icon ? label : undefined}
        onClick={handleClick}
      >
        {icon ?? label}
      </button>
      {revealsEmail && <span role="status">{revealedEmail}</span>}
    </>
  )
}
