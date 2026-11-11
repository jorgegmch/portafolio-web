import { type FormEvent, type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { ContactButton } from '@/components/ui/ContactButton'
import styles from '@/components/ui/ContactForm.module.css'
import { contactNeeds } from '@/data/contactNeeds'
import { useContactForm } from '@/hooks/useContactForm'
import type { Dictionary } from '@/i18n/types'
import type { ValidatedField } from '@/lib/contactForm'
import type { SendContactMessage } from '@/lib/sendContactMessage'

/** Signos que no son texto traducible: separador de la marca y la línea de código. */
const SEPARATOR = ' · '
const STATUS_LINE = 'status: 200'

/** Qué recibe el foco tras una acción: el primer campo con error o el nombre al empezar otro. */
type FocusTarget = ValidatedField

interface ContactFormProps {
  text: Dictionary['contact']['form']
  /** Textos de «Copiar correo», que se ofrece si el envío falla. */
  copy: {
    copyEmail: string
    emailCopied: string
    copyFailed: string
  }
  /** Cómo se envía el mensaje; el formulario no lo sabe. */
  send: SendContactMessage
}

/**
 * Formulario de contacto, siempre a la vista en el panel derecho de la
 * escena (spec v2.1 §3.5). Sin autofocus al cargar: ya se ve.
 *
 * Estados: escribiendo; con errores, cada uno asociado a su campo y con el
 * foco en el primero; enviando, con el botón deshabilitado y un giro;
 * recibido, que sustituye a los campos y se lleva el foco; y error, que
 * conserva lo escrito y ofrece «Copiar correo». «Enviar otro» vuelve al
 * formulario vacío con el foco en el nombre.
 *
 * Lo que pide la auditoría de Vercel (spec v2.1 §3.5): cada campo con su
 * name, el correo sin corrector ortográfico, placeholders de ejemplo
 * acabados en «…» y ⌘/Ctrl + Enter para enviar desde el mensaje.
 */
export function ContactForm({ text, copy, send }: ContactFormProps) {
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const sentRef = useRef<HTMLParagraphElement>(null)
  const id = useId()
  const { values, errors, status, setField, toggleNeed, submit, reset } = useContactForm(send)
  // Un objeto nuevo en cada petición, para volver a llevar el foco aunque
  // el campo sea el mismo.
  const [focusRequest, setFocusRequest] = useState<{ field: FocusTarget } | null>(null)
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

  useEffect(() => {
    if (!focusRequest) return
    const target = { name: nameRef, email: emailRef, message: messageRef }[focusRequest.field]
    target.current?.focus()
  }, [focusRequest])

  // Al llegar el mensaje, el foco va al aviso de recibido: los campos, que
  // lo tenían, desaparecen.
  useEffect(() => {
    if (sent) sentRef.current?.focus()
  }, [sent])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = await submit()
    if (invalid) setFocusRequest({ field: invalid })
  }

  // ⌘ o Ctrl + Enter envía desde el mensaje (auditoría de Vercel); Enter
  // solo sigue siendo un salto de línea. Pasa por el envío del formulario,
  // con su validación.
  const submitOnModifierEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) return
    event.preventDefault()
    event.currentTarget.form?.requestSubmit()
  }

  const sendAnother = () => {
    reset()
    setFocusRequest({ field: 'name' })
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
    <section className={styles.panel} aria-labelledby={ids.title}>
      <div className={styles.heading}>
        <p className={styles.tag}>{text.tag}</p>
        <h3 id={ids.title} className={styles.title}>
          {text.title}
        </h3>
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
          <button type="button" className={styles.secondary} onClick={sendAnother}>
            {text.sent.again}
          </button>
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
                name="name"
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
                name="email"
                className={styles.input}
                type="email"
                autoComplete="email"
                spellCheck={false}
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
              name="company"
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
              name="message"
              className={`${styles.input} ${styles.textarea}`}
              rows={5}
              autoComplete="off"
              required
              placeholder={text.message.placeholder}
              value={values.message}
              onChange={(event) => setField('message', event.target.value)}
              onKeyDown={submitOnModifierEnter}
              {...validation('message')}
            />
            {errors.message && (
              <p id={errorId('message')} className={styles.error}>
                {text.message.error}
              </p>
            )}
          </div>

          {status === 'error' && (
            <div className={styles.failure}>
              <p className={styles.alert} role="alert">
                {text.failed}
              </p>
              <ContactButton
                kind="copy-email"
                label={copy.copyEmail}
                className={styles.secondary}
                copiedMessage={copy.emailCopied}
                copyFailedMessage={copy.copyFailed}
                statusClassName={styles.copied}
              />
            </div>
          )}

          {/* aria-disabled y no disabled: un botón deshabilitado pierde el
              foco, y el foco se quedaría sin sitio. */}
          <button type="submit" className={styles.submit} aria-disabled={sending}>
            {sending && (
              <svg className={styles.spinner} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
            )}
            {sending ? text.sending : text.submit}
            {!sending && (
              <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </button>
        </form>
      )}
    </section>
  )
}
