import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { ContactButton } from '@/components/ui/ContactButton'
import styles from '@/components/ui/ContactDialog.module.css'
import { contactNeeds } from '@/data/contactNeeds'
import { useContactForm } from '@/hooks/useContactForm'
import type { Dictionary } from '@/i18n/types'
import type { ValidatedField } from '@/lib/contactForm'
import type { SendContactMessage } from '@/lib/sendContactMessage'

/** Signos que no son texto traducible: separador de la marca y la línea de código. */
const SEPARATOR = ' · '
const STATUS_LINE = 'status: 200'

interface ContactDialogProps {
  open: boolean
  /** Se llama cuando el diálogo se cierra, por cualquier vía. */
  onClose: () => void
  text: Dictionary['contact']['form']
  /** Textos de «Copiar correo» y WhatsApp, los mismos de la escena. */
  direct: {
    copyEmail: string
    emailCopied: string
    copyFailed: string
    whatsapp: string
    /** Nombre accesible de WhatsApp: avisa de la pestaña nueva. */
    whatsappName: string
  }
  /** Cómo se envía el mensaje; el formulario no lo sabe. */
  send: SendContactMessage
}

/**
 * Formulario de contacto en un diálogo modal (spec §5). Es un <dialog>
 * nativo abierto con showModal(): el navegador deja inerte el resto de la
 * página, atrapa el foco y lo cierra con Esc. Además se cierra con la X y
 * con un clic fuera de la hoja. Al abrir, el foco va al primer campo; al
 * cerrar, quien lo abrió lo devuelve a su botón.
 *
 * Estados: escribiendo; con errores, cada uno asociado a su campo y con el
 * foco en el primero; enviando, con el botón deshabilitado y un giro;
 * recibido; y error, que conserva lo escrito y ofrece «Copiar correo».
 * «¿Prefieres directo?» está siempre a la vista mientras hay formulario.
 *
 * En escritorio es una hoja centrada; en teléfono, una hoja inferior a toda
 * la pantalla, con su asa.
 */
export function ContactDialog({ open, onClose, text, direct, send }: ContactDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const sentRef = useRef<HTMLParagraphElement>(null)
  const id = useId()
  const { values, errors, status, setField, toggleNeed, submit, reset } = useContactForm(send)
  // Un objeto nuevo en cada intento fallido, para volver a llevar el foco.
  const [focusRequest, setFocusRequest] = useState<{ field: ValidatedField } | null>(null)
  const sent = status === 'sent'
  const sending = status === 'sending'

  const ids = {
    title: `${id}-title`,
    name: `${id}-name`,
    email: `${id}-email`,
    company: `${id}-company`,
    message: `${id}-message`,
  }
  const errorId = (field: ValidatedField) => `${id}-${field}-error`

  // Abre y cierra el <dialog> nativo según la prop.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      // showModal enfoca el primer control, la X: la spec pide el primer
      // campo (o el aviso de recibido, si es lo que se ve).
      const first = nameRef.current ?? sentRef.current
      first?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Tras un intento con errores, el foco va al primero, ya marcado.
  useEffect(() => {
    if (!focusRequest) return
    const target = { name: nameRef, email: emailRef, message: messageRef }[focusRequest.field]
    target.current?.focus()
  }, [focusRequest])

  // Al llegar el mensaje, el foco va al aviso de recibido.
  useEffect(() => {
    if (sent) sentRef.current?.focus()
  }, [sent])

  // Clic fuera de la hoja: llega al propio <dialog>, que es el fondo. Es un
  // atajo del puntero; con teclado se cierra con Esc o con la X. Cuenta solo
  // si el clic empezó también en el fondo: quien selecciona texto en un
  // campo y suelta fuera no lo cierra.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    let pressedOnBackdrop = false
    const press = (event: PointerEvent) => {
      pressedOnBackdrop = event.target === dialog
    }
    const closeOnBackdrop = (event: MouseEvent) => {
      if (pressedOnBackdrop && event.target === dialog) dialog.close()
    }
    dialog.addEventListener('pointerdown', press)
    dialog.addEventListener('click', closeOnBackdrop)
    return () => {
      dialog.removeEventListener('pointerdown', press)
      dialog.removeEventListener('click', closeOnBackdrop)
    }
  }, [])

  const close = () => dialogRef.current?.close()

  // Todo cierre (Esc, X, clic fuera, «Volver al portafolio») pasa por aquí.
  const handleClosed = () => {
    if (sent) reset()
    onClose()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = await submit()
    if (invalid) setFocusRequest({ field: invalid })
  }

  /** Atributos de un campo validado: inválido y descrito por su error, si lo tiene. */
  const validation = (field: ValidatedField) =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': errorId(field) }
      : { 'aria-invalid': false as const }

  const marker = (hint: string) => (
    <span className={styles.hint}>
      {SEPARATOR}
      {hint}
    </span>
  )

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={ids.title}
      aria-modal="true"
      onClose={handleClosed}
    >
      <div className={styles.sheet}>
        <span className={styles.handle} aria-hidden="true" />
        <div className={styles.header}>
          <div className={styles.heading}>
            <p className={styles.tag}>{text.tag}</p>
            <h2 id={ids.title} className={styles.title}>
              {text.title}
            </h2>
          </div>
          <button type="button" className={styles.close} aria-label={text.close} onClick={close}>
            <svg className={styles.closeIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {sent ? (
          <div className={styles.sent} role="status">
            <span className={styles.check} aria-hidden="true">
              <svg className={styles.checkIcon} viewBox="0 0 24 24" focusable="false">
                <path d="M5 12.5 10 17 19 7" />
              </svg>
            </span>
            <p ref={sentRef} className={styles.sentTitle} tabIndex={-1}>
              {text.sent.title}
            </p>
            <p className={styles.sentLine}>
              {STATUS_LINE}
              {SEPARATOR}
              {text.sent.reply} {values.email.trim()}
            </p>
            <div className={styles.sentActions}>
              <button type="button" className={styles.primaryLight} onClick={close}>
                {text.sent.back}
              </button>
              <button type="button" className={styles.secondary} onClick={reset}>
                {text.sent.again}
              </button>
            </div>
          </div>
        ) : (
          <form className={styles.form} noValidate onSubmit={handleSubmit}>
            <div className={styles.pair}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={ids.name}>
                  {text.name.label}
                  {marker(text.required)}
                </label>
                <input
                  ref={nameRef}
                  id={ids.name}
                  className={styles.input}
                  type="text"
                  autoComplete="name"
                  required
                  placeholder={text.name.placeholder}
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  {...validation('name')}
                />
                {errors.name && (
                  <p id={errorId('name')} className={styles.error}>
                    {text.name.error}
                  </p>
                )}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={ids.email}>
                  {text.email.label}
                  {marker(text.required)}
                </label>
                <input
                  ref={emailRef}
                  id={ids.email}
                  className={styles.input}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={text.email.placeholder}
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  {...validation('email')}
                />
                {errors.email && (
                  <p id={errorId('email')} className={styles.error}>
                    {text.email.error}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={ids.company}>
                {text.company.label}
                {marker(text.optional)}
              </label>
              <input
                id={ids.company}
                className={styles.input}
                type="text"
                autoComplete="organization"
                placeholder={text.company.placeholder}
                value={values.company}
                onChange={(event) => setField('company', event.target.value)}
              />
            </div>

            <fieldset className={styles.needs}>
              <legend className={styles.label}>
                {text.needs.legend}
                {marker(text.pickSeveral)}
              </legend>
              <div className={styles.chips}>
                {contactNeeds.map((need) => (
                  <button
                    key={need}
                    type="button"
                    className={styles.chip}
                    aria-pressed={values.needs.includes(need)}
                    onClick={() => toggleNeed(need)}
                  >
                    {text.needs.options[need]}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className={styles.field}>
              <label className={styles.label} htmlFor={ids.message}>
                {text.message.label}
                {marker(text.required)}
              </label>
              <textarea
                ref={messageRef}
                id={ids.message}
                className={`${styles.input} ${styles.textarea}`}
                rows={5}
                autoComplete="off"
                required
                placeholder={text.message.placeholder}
                value={values.message}
                onChange={(event) => setField('message', event.target.value)}
                {...validation('message')}
              />
              {errors.message && (
                <p id={errorId('message')} className={styles.error}>
                  {text.message.error}
                </p>
              )}
            </div>

            {status === 'error' && (
              <p className={styles.alert} role="alert">
                {text.failed}
              </p>
            )}

            <div className={styles.footer}>
              <div className={styles.direct}>
                <span>{text.direct}</span>
                <ContactButton
                  kind="copy-email"
                  label={direct.copyEmail}
                  className={styles.secondary}
                  copiedMessage={direct.emailCopied}
                  copyFailedMessage={direct.copyFailed}
                  statusClassName={styles.copied}
                />
                <ContactButton
                  kind="whatsapp"
                  label={direct.whatsapp}
                  accessibleLabel={direct.whatsappName}
                  className={styles.secondary}
                  trailing={
                    <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  }
                />
              </div>
              {/* aria-disabled y no disabled: un botón deshabilitado pierde el
                  foco, y el foco se quedaría sin sitio dentro del diálogo. */}
              <button type="submit" className={styles.submit} aria-disabled={sending}>
                {sending && (
                  <svg className={styles.spinner} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M12 3a9 9 0 1 0 9 9" />
                  </svg>
                )}
                {sending ? text.sending : text.submit}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
