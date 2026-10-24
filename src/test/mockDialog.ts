/**
 * jsdom no implementa showModal() ni close() de <dialog>. Este sustituto
 * hace lo mínimo que hace el navegador con un diálogo modal: abrir (el
 * atributo open), cerrar (quita open y avisa con el evento close) y cerrar
 * con Esc (evento cancel, que se puede cancelar). No atrapa el foco ni deja
 * inerte el resto de la página: eso se comprueba en el navegador.
 *
 * Devuelve la función que deja los prototipos como estaban.
 */
export function mockDialog(): () => void {
  const proto = HTMLDialogElement.prototype
  const original = { showModal: proto.showModal, close: proto.close }

  const closeOnEscape = (event: KeyboardEvent) => {
    const dialog = event.currentTarget
    if (event.key !== 'Escape' || !(dialog instanceof HTMLDialogElement)) return
    const cancel = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(cancel)
    if (!cancel.defaultPrevented) dialog.close()
  }

  proto.showModal = function showModal(this: HTMLDialogElement) {
    if (this.hasAttribute('open')) return
    this.setAttribute('open', '')
    this.addEventListener('keydown', closeOnEscape)
  }

  proto.close = function close(this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return
    this.removeAttribute('open')
    this.removeEventListener('keydown', closeOnEscape)
    this.dispatchEvent(new Event('close'))
  }

  return () => {
    proto.showModal = original.showModal
    proto.close = original.close
  }
}
