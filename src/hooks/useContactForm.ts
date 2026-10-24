import { useState } from 'react'
import type { ContactNeedId } from '@/data/contactNeeds'
import {
  type ContactFormErrors,
  type ContactFormValues,
  EMPTY_CONTACT_FORM,
  firstInvalidField,
  type ValidatedField,
  validateContactForm,
} from '@/lib/contactForm'
import type { SendContactMessage } from '@/lib/sendContactMessage'

/** idle: escribiendo; sending: esperando al envío; sent: llegó; error: no salió. */
export type ContactFormStatus = 'idle' | 'sending' | 'sent' | 'error'

/** Campos de texto del formulario. */
export type ContactTextField = Exclude<keyof ContactFormValues, 'needs'>

const NO_ERRORS: ContactFormErrors = {}

/**
 * Estado del formulario de contacto: lo escrito, los errores y en qué punto
 * va el envío. Los errores se muestran desde el primer intento de enviar, y
 * desde ahí se recalculan al escribir. Lo escrito se conserva si el envío
 * falla.
 */
export function useContactForm(send: SendContactMessage) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_CONTACT_FORM)
  const [tried, setTried] = useState(false)
  const [status, setStatus] = useState<ContactFormStatus>('idle')
  const errors = tried ? validateContactForm(values) : NO_ERRORS

  const setField = (field: ContactTextField, value: string) =>
    setValues((current) => ({ ...current, [field]: value }))

  const toggleNeed = (id: ContactNeedId) =>
    setValues((current) => ({
      ...current,
      needs: current.needs.includes(id)
        ? current.needs.filter((need) => need !== id)
        : [...current.needs, id],
    }))

  /**
   * Intenta enviar. Si falta algo, no envía y devuelve el primer campo con
   * error, para llevar ahí el foco; si no, devuelve null.
   */
  const submit = async (): Promise<ValidatedField | null> => {
    if (status === 'sending') return null
    setTried(true)
    const invalid = firstInvalidField(validateContactForm(values))
    if (invalid) return invalid

    setStatus('sending')
    const result = await send({
      name: values.name.trim(),
      email: values.email.trim(),
      company: values.company.trim(),
      needs: values.needs,
      message: values.message.trim(),
    })
    setStatus(result.ok ? 'sent' : 'error')
    return null
  }

  /** Vuelve al formulario vacío, para enviar otro. */
  const reset = () => {
    setValues(EMPTY_CONTACT_FORM)
    setTried(false)
    setStatus('idle')
  }

  return { values, errors, status, setField, toggleNeed, submit, reset }
}
