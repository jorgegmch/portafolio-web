import { useState } from 'react'
import { getEmail, getEmailUrl, getWhatsappUrl } from '@/lib/assembleContact'

interface ContactButtonProps {
  kind: 'email' | 'whatsapp'
  /** Texto visible del botón; lo aporta quien lo usa, ya traducido. */
  label: string
}

/**
 * Botón de contacto que arma el dato al hacer clic. Antes de la interacción
 * ni el correo ni el número existen en el DOM. El de email además muestra el
 * correo como texto, para quien no tenga cliente de correo y quiera copiarlo;
 * el de WhatsApp solo abre el enlace.
 */
export function ContactButton({ kind, label }: ContactButtonProps) {
  const [revealedEmail, setRevealedEmail] = useState<string | null>(null)

  const handleClick = () => {
    if (kind === 'email') {
      setRevealedEmail(getEmail())
      window.open(getEmailUrl(), '_self')
    } else {
      window.open(getWhatsappUrl(), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick}>
        {label}
      </button>
      {kind === 'email' && <span role="status">{revealedEmail}</span>}
    </>
  )
}
