# Formulario de contacto: estado y requisitos del backend

El formulario de la escena Contacto, siempre a la vista en su panel derecho (spec v2.1 §3.5), tiene la interfaz completa, pero **todavía no envía nada**. Cómo se enviará está **pendiente de decisión del autor**, junto con el hosting: la propuesta en estudio es una función propia en `api/` del mismo repo (Vercel Functions) y un servicio de correo transaccional, pero antes hay que resolver si el plan gratuito de Vercel admite este sitio, porque sus reglas limitan el plan Hobby a uso personal no comercial (spec §5).

## Cómo está montado hoy

- `src/components/ui/ContactForm.tsx` es el formulario; sustituyó al diálogo «Escríbeme» del rediseño v2, que se retiró con su efecto magnético. No tiene autofocus: ya está a la vista.

- `src/lib/sendContactMessage.ts` define la interfaz del envío: `sendContactMessage(payload: ContactMessage): Promise<SendResult>`.
  - `ContactMessage`: `name`, `email`, `company` (puede ir vacío), `needs` (ids de `src/data/contactNeeds.ts`) y `message`, todos sin espacios en los extremos.
  - `SendResult`: `{ ok: true }` o `{ ok: false, reason: 'not-configured' | 'failed' }`.
- El adaptador actual **no hace ninguna petición de red ni lleva claves**: devuelve `{ ok: false, reason: 'not-configured' }`. El formulario muestra entonces el aviso de error (`role="alert"`), conserva lo escrito y ofrece «Copiar correo».
- El estado «Mensaje recibido» existe en la interfaz y está probado con un adaptador simulado, pero con el adaptador actual no se alcanza.
- La validación del navegador (`src/lib/contactForm.ts`) solo ayuda a quien escribe: nombre obligatorio, correo con forma de correo y mensaje de al menos 10 caracteres.
- Lo que pidió la auditoría de Vercel y ya está: cada campo con su `name`, el correo sin corrector ortográfico, placeholders de ejemplo acabados en «…» y ⌘/Ctrl + Enter para enviar desde el mensaje. Mientras envía, el botón lleva `aria-disabled` (no `disabled`, para no perder el foco) y una guarda contra el doble envío; falta una clave de idempotencia, que es cosa del backend.

## Requisitos de seguridad del futuro backend

Fijados en la spec (§5). Ninguno está implementado todavía.

1. **Validación también en el servidor.** Las mismas reglas que en el navegador (nombre, correo, mensaje de al menos 10 caracteres), más un límite de longitud por campo y una lista cerrada para `needs`. Nunca se confía en la validación del cliente.
2. **Campo trampa (honeypot).** Un campo invisible para las personas que el servidor exige vacío. Si llega con contenido, el envío se descarta sin avisar de por qué.
3. **Límite de envíos.** Por IP y por ventana de tiempo, para frenar el abuso automatizado.
4. **Nada de secretos en el cliente.** Ninguna clave, token ni URL privada en el código del navegador ni en variables `VITE_*`, que son públicas.
5. **El correo de destino, solo en variables de entorno del servidor.** No se escribe en el repositorio ni viaja al navegador.

## Al conectar el backend

- Sustituir el adaptador de `src/lib/sendContactMessage.ts` sin cambiar su interfaz: el formulario no sabe cómo ni a dónde se envía.
- Si el envío va a un tercero, es una petición a terceros en ejecución: se pregunta antes al autor (`AGENTS.md`, «Límites»).
- Repetir la verificación de `.claude/rules/contacto.md`: el correo de destino no puede aparecer en `dist/`.
- Revisar el texto «status: 200 · te respondo a …» del estado recibido: debe seguir siendo cierto con la respuesta real.
