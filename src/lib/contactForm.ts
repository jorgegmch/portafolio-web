import type { ContactNeedId } from '@/data/contactNeeds'

/** Lo que escribe el visitante en el formulario de contacto. */
export interface ContactFormValues {
  name: string
  email: string
  /** Opcional. */
  company: string
  needs: readonly ContactNeedId[]
  message: string
}

/** Campos que pueden tener error, en el orden en que aparecen. */
export const VALIDATED_FIELDS = ['name', 'email', 'message'] as const

export type ValidatedField = (typeof VALIDATED_FIELDS)[number]

/** Campos con error; un campo sin entrada está bien. */
export type ContactFormErrors = Partial<Record<ValidatedField, true>>

/** Mínimo de caracteres del mensaje, sin contar los espacios de los extremos. */
export const MESSAGE_MIN_LENGTH = 10

/**
 * Forma mínima de un correo: algo, una arroba, algo, un punto y algo, sin
 * espacios. No comprueba que exista; eso lo sabrá el servidor.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const EMPTY_CONTACT_FORM: ContactFormValues = {
  name: '',
  email: '',
  company: '',
  needs: [],
  message: '',
}

/**
 * Valida el formulario en el navegador (spec §5): nombre y correo
 * obligatorios, el correo con forma de correo, y un mensaje de al menos
 * MESSAGE_MIN_LENGTH caracteres. Empresa y «¿Qué necesitas?» son opcionales.
 * Los espacios de los extremos no cuentan. El servidor tendrá que validar
 * lo mismo: esto solo ayuda a quien escribe.
 */
export const validateContactForm = (values: ContactFormValues): ContactFormErrors => {
  const errors: ContactFormErrors = {}
  if (values.name.trim() === '') errors.name = true
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = true
  if (values.message.trim().length < MESSAGE_MIN_LENGTH) errors.message = true
  return errors
}

/** El primer campo con error, en el orden del formulario; null si no hay. */
export const firstInvalidField = (errors: ContactFormErrors): ValidatedField | null =>
  VALIDATED_FIELDS.find((field) => errors[field]) ?? null
