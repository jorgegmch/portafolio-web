# Rediseño v2 — «Bilingüe: negocio ⇄ código»

Especificación de traspaso del rediseño completo del portafolio. Es la **fuente de verdad** visual y de comportamiento. Si este documento y un tablero discrepan, manda este documento; si los dos callan, se pregunta al autor.

## 0. Cómo leer los tableros (`artboards/`)

Los `.dc.html` son tableros de una herramienta de diseño: HTML con estilos en línea y un runtime propio. **No se copian al proyecto ni se ejecutan.** Son referencia de valores exactos (colores, tamaños, radios, espaciados, textos, estructura).

- `{{nombre}}` es un valor que calcula el bloque `<script type="text/x-dc">` del final del archivo: búscalo en `renderVals()`.
- `<sc-for list="{{x}}" as="y">` es un bucle y `<sc-if value="{{x}}">` un condicional.
- `{{accent}}` vale `#FF5B24` (token `--color-signal`).
- `<helmet>` contiene el `<style>` del tablero (keyframes y media queries).
- El enlace a Google Fonts del tablero **no se replica**: las fuentes se alojan en el repo (§2).

| Tablero | Qué muestra |
|---|---|
| `desktop-page.dc.html` | Página completa de escritorio, todas las escenas en orden |
| `mobile-home.dc.html` | Teléfono (390 px): Hero, cinta, Perfil, Servicios, Contacto |
| `design-system.dc.html` | Paleta con contrastes medidos, tipografías, radios y tokens de movimiento |
| `motion-script.dc.html` | Las 6 piezas de movimiento con su regla |
| `contact-form-desktop.dc.html` | Modal del formulario con validación y estados (enviando, recibido, error) |
| `contact-form-mobile.dc.html` | El formulario como hoja inferior a pantalla completa |

## 1. Concepto

Jorge traduce lo que pide el negocio a código y luego lo explica en palabras claras. El sitio lo muestra con **dos voces tipográficas**:

- **Voz humana:** Anton para títulos gigantes y Manrope para el texto corrido.
- **Voz de código:** JetBrains Mono en rótulos, numeración y «traducciones» bajo los títulos.

Lo cinematográfico está en la ejecución, no en un tema de película: paneles independientes con radios grandes, cortina entre escenas, cintas cruzadas, grano de película, intro y botón magnético.

## 2. Tokens (sustituyen la paleta actual en `src/styles/tokens.css`)

### Color

| Token | Valor | Uso | Contraste medido |
|---|---|---|---|
| `--color-void` | `#060607` | Fondo de página, entre paneles | — |
| `--color-ink` | `#111113` | Hero, pie, modal | Bone 16,3:1 |
| `--color-graphite` | `#19171A` | Panel Perfil | Muted 6,7:1 |
| `--color-deep` | `#0F0F11` | Panel Proyectos | — |
| `--color-tile` | `#222024` | Tarjetas de cifras | Texto `#BDB8AF` 8,2:1 |
| `--color-card` | `#1A1A1D` / `#1E1E22` | Tarjetas de proyecto, campos del formulario | — |
| `--color-paper` | `#ECE7DD` | Panel Servicios | Tinta 16,1:1 · `#5B5750` 5,8:1 |
| `--color-signal` | `#FF5B24` | Acento: CTA, cintas, panel Contacto | 6,1:1 sobre Ink · tinta encima 6,4:1 |
| `--color-signal-deep` | `#C2410C` | Acento sobre Paper, **solo texto ≥ 24 px** | 4,2:1 |
| `--color-bone` | `#F2EEE6` | Texto principal sobre oscuro | — |
| `--color-bone-soft` | `#D9D4CB` | Párrafos sobre oscuro | 12,1:1 sobre Graphite |
| `--color-muted` | `#A29E97` | Rótulos y secundarios sobre oscuro | 7,1:1 sobre Ink |
| `--color-ink-text` | `#0A0A0B` | Texto sobre Paper y sobre Signal | — |
| `--color-error` | `#FF8A6B` | Errores del formulario sobre Ink | — |

Bordes translúcidos: `rgba(242,238,230,0.08 | 0.10 | 0.12 | 0.18)` sobre oscuro y `rgba(10,10,11,0.16 | 0.28 | 0.30)` sobre Paper. Defínelos como tokens (`--line-*`), sin valores sueltos.

Regla vigente: los componentes solo usan colores de `tokens.css`. El acento verde actual se retira.

### Tipografía

Se alojan en el repo (`public/fonts/` o `src/assets/fonts/`), en woff2, con `font-display: swap` y precarga de Anton y Manrope. Cero peticiones a Google Fonts en ejecución.

- **Anton 400:** títulos de escena, nombre, cifras. Siempre en mayúsculas, interlineado 0,84–0,92.
  - **Excepción:** la frase de Perfil («Del negocio al código.») va a 1,125 (`--leading-phrase`). Medido en Anton, la tilde de «Ó» sube 1,109 em sobre la línea base y las letras de la línea de arriba bajan 0,016 em: con menos de 1,125 la tilde de «CÓDIGO» pisa «NEGOCIO». Aprobado por el autor.
- **Manrope 400/500/700/800:** cuerpo de 17–20 px con interlineado 1,55–1,6; títulos secundarios en 800 con `letter-spacing: -0.02em`.
- **JetBrains Mono 400/600:** rótulos de 12–13 px en mayúsculas con `letter-spacing: 0.08em`, y código.

Las tres son de Google Fonts. **Verifica y conserva su licencia** (OFL esperada) junto a los archivos antes del commit. Si alguna no es OFL, para y avisa.

Escala de títulos, con `clamp` como en el tablero:

| Elemento | Tamaño |
|---|---|
| Nombre del Hero | `clamp(120px, 21.5vw, 330px)` |
| Título de escena | `clamp(72px, 12vw, 190px)` |
| Frase de Perfil | `clamp(56px, 8vw, 128px)` |
| Contacto | `clamp(80px, 12.5vw, 220px)` |

### Radios y superficies

| Token | Valor |
|---|---|
| Panel | `--radius-panel: 40px` (28 px en ≤ 900 px) |
| Tarjeta | `--radius-card: 32px` |
| Bloque | `--radius-block: 24px` (campos 18 px) |
| Píldora | `999px` |

Los paneles están separados 12 px entre sí y del borde (8 px en teléfono). El Void visible entre ellos es lo que hace que cada sección se lea como pieza propia.

Relleno interno de los paneles: 104 px arriba y 64 px a los lados en escritorio, y 48 px / 20–24 px en teléfono. En pantallas anchas el contenido se limita a 1600 px: `padding-inline: max(64px, calc((100% - 1600px) / 2))`.

### Movimiento

| Token | Valor |
|---|---|
| `--ease-cine` | `cubic-bezier(.2,.7,.2,1)` |
| `--dur-reveal` | `700ms`, escalonado de 80 ms por línea |
| `--dur-marquee-a` / `--dur-marquee-b` | `42s` / `54s`, en sentidos opuestos |
| `--dur-intro` | ≤ 2,2 s en total |

## 3. Estructura y escenas

El orden es único y Certificaciones se elimina (§6). Cada escena es un `<section>` con su panel. La navegación numera 01–04.

### 3.0 Navegación (dentro del Hero)

- **Izquierda:** `jorgegmch_`, en mono 600, con el guion bajo en Signal. Se traduce a «Jorge Gómez_» (§4.2).
- **Centro:** píldora translúcida con los enlaces `01 Perfil`, `02 Servicios`, `03 Proyectos` y `04 Contacto` (número en mono `--color-muted`). En ≤ 900 px se oculta y aparece un botón de menú circular de 48 px.
- **Derecha:** botón de idioma `ES / EN` (píldora con borde) y CTA «Hablemos» (píldora Signal) que lleva a Contacto.
- Se mantiene el i18n actual. **Todo texto nuevo lleva su versión en inglés** en `en.ts`.

### 3.1 Hero (Ink)

- **Metadatos:** a la izquierda «● Disponible para proyectos freelance» (punto Signal con pulso); a la derecha «Piedecuesta, CO · HH:MM GMT-5», con reloj en vivo de `America/Bogota` que se actualiza cada 30 s.
- **Nombre:** «JORGE» en Bone y «GÓMEZ» en Signal, centrado y **detrás** de la foto.
- **Foto:** la actual recortada, centrada y anclada al borde inferior, **delante** del nombre. Tratamiento: escala de grises con contraste alto y un borde de luz Signal (`drop-shadow` estático en el `<img>`; no se anima). Detrás lleva una luz radial Signal al 38 % y un anillo de 1 px.
- **Bloque inferior izquierdo:** «Full-Stack Developer» (Manrope 800, 28 px) y la línea mono `// Java · Spring Boot · Agentes de IA`.
- **Bloque inferior derecho:** «Traduzco lo que tu negocio necesita en software que funciona, y te lo explico sin tecnicismos.», el CTA principal «Ver proyectos →» (píldora Signal de 56 px) y el secundario «Descargar CV ↓» (enlace subrayado).
- **Cinta de stack:** banda Signal girada -1,6°, con las 15 tecnologías del catálogo en Anton 40 px separadas por «✦», en movimiento continuo.
- **Se elimina:** partículas, pastillas flotantes, rejilla de tecnologías e iconos sociales del Hero (GitHub y LinkedIn pasan al pie y a Contacto, WhatsApp a Contacto).
- **Teléfono:** el nombre en dos líneas de 112 px, la foto más pequeña y los textos y CTA en una tarjeta translúcida al pie del panel (ver tablero).

### 3.2 Perfil (Graphite)

- **Rótulos:** «01 — Perfil» en Signal a la izquierda y `del_negocio_al_codigo()` a la derecha.
- **Frase:** «Del negocio al código.» rellena, y debajo «Y del código a palabras claras.» solo en contorno (`-webkit-text-stroke: 1.5px`).
- **Texto:** UNA sola línea de bio: «Desarrollador Full-Stack con base en Java y Spring Boot. Vengo de la Comunicación Social: escucho antes de programar y explico lo que construyo.»
- **Cifras:** 3 tarjetas con +1 año programando, 14 proyectos y 15 tecnologías. **Se mantienen los cálculos y fuentes actuales**, que son veraces; solo cambia la presentación.
- **Formación:** dos filas, «Técnico en Programación de Software · Campuslands» y «Comunicación Social y Periodismo · U. Sergio Arboleda».
- **Traductor (momento de firma):** pestañas Inventario / Permisos / Noticias (`aria-pressed`) que rotan cada 4,2 s. Con movimiento reducido no rotan y quedan solo las pestañas.
  - Contenido de cada pestaña: «Lo que dice el negocio» (frase), una flecha, y «Lo que escribo» (bloque de código con resaltado mínimo: palabras clave en Signal, comentarios `#8C8880`), el proyecto de origen y el enlace «Ver el repo ↗».
- **Se elimina:** el mapa, la descripción larga con escritura animada, el bloque `Developer.java`, la edad y **todo código relacionado con la fecha de nacimiento**.

### 3.3 Servicios (Paper; escena clara)

- **Rótulos:** «02 — Servicios» y `what_i_build()` en `#5B5750`.
- **Título:** «LO QUE / CONSTRUYO».
- **Lista 01–06** (los 6 servicios actuales con sus textos y enlaces de `services.ts`):
  - Cada fila es un acordeón: número en Anton 64 px, `<h3><button aria-expanded>` con el título y un círculo «+/−» de 52 px.
  - Abierta, el número pasa a tinta; si no, va al 28 %. Por defecto está abierta la 01.
- **Fila abierta:** la descripción, «Ver proyecto relacionado ↗» (píldora con borde; Comunicación no lleva enlace) y un bloque Ink de 200 px con el icono grande en Signal.
- **Iconos:** dibujo propio de trazo en `viewBox 0 0 64 64` (los del tablero), con «luces» que pulsan solo en `opacity`.
- **Cintas cruzadas:** dos bandas al pie, que montan sobre el borde con el panel de Proyectos.
  - Una tinta girada +3°, con fragmentos de código en mono 18 px.
  - Una Signal girada -2,5°, con los verbos Escucho, Planifico, Programo, Documento, Explico y Entrego.
  - Van en sentidos opuestos.
- **Se elimina:** las tarjetas que giran, con su componente y sus tests, y el commit B pendiente de iconos (no se aplica).

### 3.4 Proyectos (Deep)

- **Rótulos:** «03 — Proyectos» y «Ver todos en GitHub ↗».
- **Título:** «PROYECTOS» con «(05)» en mono Signal.
- **Pila de tarjetas:** cada tarjeta es `position: sticky` con desplazamiento creciente, y la siguiente sube encima. La anterior baja a `scale(.965)` y `opacity .6` (§4.3).
  - **Contenido de cada tarjeta:** número en Anton Signal, nombre, etiqueta «Proyecto principal» (solo LogiTrack IQ), «Ver código ↗», descripción, etiquetas de stack y capturas en mosaico (1 grande y 2 pequeñas para la principal; 1 para las demás).
- **Teléfono:** pila sin sticky, tarjetas en columna.
- **Proyectos y orden:** los 5 destacados de `projects.ts` (`featured`).
- **Textos:** solo los respaldados por los repos. El stack de rebelwear-ui **no está confirmado**: verifícalo en su repo y, si no puedes, déjalo marcado y repórtalo.

### 3.5 Contacto (Signal; escena de acento)

- **Rótulos:** «04 — Contacto» y «Piedecuesta, Colombia · HH:MM GMT-5».
- **Título:** «¿CONSTRUIMOS / ALGO?» a todo el ancho.
- **Debajo, en fila:** la frase «Cuéntame qué necesita tu negocio. Yo lo traduzco a código.» (24 px) y el botón circular «Escríbeme ↗» (200 px, Ink, magnético §4.6), que **abre el modal** (§5).
- **Fila de píldoras:**
  - Copiar correo: se mantiene el ensamblado actual del dato, y el correo no aparece en el HTML.
  - WhatsApp, con el mecanismo actual.
  - LinkedIn y GitHub.
  - CV ES y CV EN.

### 3.6 Pie: «créditos finales» (Ink)

- **Cuatro columnas:** Diseño y código — Jorge Gómez · Construido con — React · TypeScript · Vite · Desde — Piedecuesta, Colombia · En la red — GitHub, LinkedIn.
- **Marca:** «jorgegmch» gigante en contorno (decorativa, `aria-hidden`).
- **Línea final:** «© 2026 Jorge Gómez. Todos los derechos reservados.» y «Volver arriba ↑».

### 3.7 Elementos globales

- **Grano de película:** SVG `feTurbulence` fijo, opacidad 0,07 y `mix-blend-mode: overlay`, `pointer-events: none`. No se anima.
- **Control de pausa global:** un botón «Pausar animaciones» (nombre fijo y `aria-pressed`) en la navegación o junto a la primera cinta.
  - Detiene las cintas, los pulsos, el Traductor y los iconos (WCAG 2.2.2).
  - Con movimiento reducido, todo ya está quieto y el botón se oculta.

## 4. Movimiento

Regla dura: **solo se animan `transform` y `opacity`**, sin librerías y con `prefers-reduced-motion` respetado. El grano y el `drop-shadow` de la foto son estáticos.

1. **Intro.** Una frase de negocio («optimizar procesos») se reescribe como `optimize_workflow()` y dos barras de cine se abren (`translateY`).
   - Una vez por sesión, ≤ 2,2 s, con botón «Saltar».
   - Con movimiento reducido no se muestra.
   - Si ya existe una pantalla de carga, se reemplaza por esta.
2. **El logo se traduce** (antes era el nombre del Hero, que ahora es estático). En reposo, `jorgegmch_`; con un puntero fino encima (`(hover: hover) and (pointer: fine)`) o con el foco del teclado, las letras se codifican hasta leer «Jorge Gómez_», y al salir vuelven. No cambia solo.
   - Es cambio de texto, no de propiedades CSS. El guion bajo, en Signal, no cambia.
   - Reserva el ancho del texto más largo: la barra no se desplaza.
   - Con movimiento reducido o con la pausa global, el texto cambia de golpe, sin efecto.
   - El nombre accesible no cambia y contiene las dos formas: «Jorge Gómez (jorgegmch), inicio». Lo que se ve va con `aria-hidden`.
3. **Cortina entre escenas.** Cada panel queda sticky y el siguiente sube encima. El que sale va a `scale(.94)` y se atenúa.
   - Se hace con `animation-timeline: view()` dentro de `@supports (animation-timeline: view())`.
   - Soporte según caniuse: Chrome/Edge 115+, Safari 26+, Firefox solo 161. Sin soporte, los paneles quedan apilados y sin efecto (mejora progresiva).
   - En movimiento reducido, sin cortina.
   - **Ojo:** sticky más contenido más alto que el viewport no debe tapar contenido. Mide que nada quede inaccesible en 1440, 1024, 768 y 390.
4. **Cintas.** `translateX` en bucle, con el contenido duplicado `aria-hidden` y la lista real accesible una vez.
5. **Proyectos apilados.** Como §3.4, con `animation-timeline` para el escalado y la misma mejora progresiva.
6. **Botón magnético.** Con `pointer: fine`, el botón «Escríbeme» se desplaza hasta 18 px hacia el puntero con `translate` y `requestAnimationFrame`. Vuelve al salir. Quieto en táctil y con movimiento reducido.

**Revelado de títulos:** líneas que suben desde una máscara (`overflow: hidden` + `translateY(100%) → 0`), 700 ms, escalonadas 80 ms. Reutiliza `Reveal` y `useRevealOnScroll`.

## 5. Formulario de contacto (modal)

- **Diálogo:** `<dialog>` nativo con `showModal()` o equivalente que cumpla: `aria-modal`, foco atrapado, foco al primer campo al abrir, vuelta del foco a «Escríbeme» al cerrar, y cierre con Esc, con el botón X y con clic fuera.
- **Apariencia:** Ink, radio 40 y 920 px de ancho en escritorio. En teléfono, hoja inferior a pantalla completa con radio 32 arriba y asa. Entra con `translateY(48px) + opacity` en 700 ms (`--ease-cine`). La escena de Contacto queda detrás, a `scale(.94)` y atenuada.
- **Campos:**
  - **Nombre** (obligatorio).
  - **Correo** (obligatorio, `type=email`).
  - **Empresa** (opcional).
  - **¿Qué necesitas?** (chips de selección múltiple con `aria-pressed`): Backend, Frontend, Full-Stack, Bases de datos, Automatización e IA, Otra cosa.
  - **Mensaje** (obligatorio, mínimo 10 caracteres).
  - Todos con `<label>`, `autocomplete` y error asociado con `aria-describedby` y `aria-invalid`.
- **Estados:** inicial, errores al enviar, enviando (botón deshabilitado con un giro), recibido («MENSAJE RECIBIDO», «Volver al portafolio» y «Enviar otro») y error (`role="alert"`: el mensaje se conserva y se ofrece «Copiar correo»).
- **Siempre visible:** «¿Prefieres directo? Copiar correo · WhatsApp».
- **Envío: PENDIENTE de decisión del autor** (función propia en su hosting frente a un servicio externo).
  - Por ahora, implementa la UI completa contra una interfaz `sendContactMessage(payload): Promise<Result>`, con un adaptador que **no envía nada**: devuelve error controlado y el modal ofrece «Copiar correo».
  - Ninguna petición de red y ninguna clave en el código.
- **Requisitos de seguridad ya fijados para cuando exista el backend** (déjalos documentados, no implementados):
  - Validación también en el servidor.
  - Campo trampa invisible (honeypot).
  - Límite de envíos.
  - Nada de secretos en el cliente.
  - El correo de destino solo en variables de entorno del servidor.

## 6. Se retira

- La página y la ruta de **Certificaciones**, con su enlace en la navegación. Si `data/certifications.ts` respalda un texto (el diploma que respalda «Comunicación estratégica»), conserva el dato y retira solo la vista.
- La edad, `Developer.java`, el mapa, las partículas, las pastillas flotantes y la rejilla del stack.
- Las tarjetas giratorias de Servicios.
- La paleta verde.
- Los tests que solo prueban lo retirado se **borran** junto con su código (no se saltan con `skip`).

## 7. Reglas que siguen vigentes

- Sin push. **Nunca imprimas el teléfono ni el correo.**
- La fecha de nacimiento nunca en ningún archivo ni en el DOM.
- `git add` con rutas explícitas, sin `--no-verify`.
- Conventional Commits en inglés, sin atribución de IA. Un commit por causa.
- Solo colores de `tokens.css`, solo `transform` y `opacity`, `prefers-reduced-motion` y ninguna petición a terceros en ejecución.
- Contenido veraz: ninguna cifra ni texto sin respaldo en un repo.
- Docs en español.
- **Fragmentos del Traductor:** en el tablero son ilustrativos. Sustitúyelos por fragmentos **reales** (o recortes fieles) del código de LogiTrack IQ, LogiTrack API y n8n-daily-news-agent, citando archivo y línea en el reporte. Si no tienes acceso al código, para y pregunta.
