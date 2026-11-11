# Rediseño v2.1 — «Bilingüe: negocio ⇄ código»

Especificación de traspaso del rediseño del portafolio. Es la **fuente de verdad** visual y de comportamiento. Si este documento y un tablero discrepan, manda este documento; si los dos callan, se pregunta al autor.

**v2.1** sustituye a la v2. Parte de lo que ya está implementado en la rama `redesign/v2` y añade: voz de código con color propio, señales visuales de programador, Contacto con el formulario a la vista, barra de navegación que acompaña al scroll, pie con llamado a redes y los textos definitivos de Hero, Perfil y Contacto. Las correcciones que el agente ya aplicó (intro sin «Saltar», logo que se traduce, menú del CV, rotación del Traductor sin saltos, etc.) quedan recogidas aquí como vigentes.

**Logos de tecnología:** solo en «Mi stack» (§3.2) y en las fichas del Hero (§3.1). Ni en la cinta ni en los chips de Proyectos. Los logos de GitHub, LinkedIn y WhatsApp no son de tecnología y van en sus botones.

**Regla de alcance:** no se elimina ni se mueve ninguna sección existente. Todo lo nuevo se **añade** a la sección que se indica, y solo cambian los textos que este documento cita.

## 0. Cómo leer los tableros (`artboards/`)

Los `.dc.html` son tableros de una herramienta de diseño: HTML con estilos en línea y un runtime propio. **No se copian al proyecto ni se ejecutan.** Son referencia de valores exactos (colores, tamaños, radios, espaciados, textos, estructura).

- `{{nombre}}` es un valor que calcula el bloque `<script type="text/x-dc">` del final del archivo: búscalo en `renderVals()`. `{{code}}` vale `#45D9C8` (token `--color-code`).
- `<sc-for list="{{x}}" as="y">` es un bucle y `<sc-if value="{{x}}">` un condicional.
- `<helmet>` contiene el `<style>` del tablero (keyframes y media queries).
- El enlace a Google Fonts del tablero **no se replica**: las fuentes ya están alojadas en el repo.
- Los cuadros punteados que dicen «logo» son **marcadores**: van los logos oficiales según `docs/LOGOS.md` (fuente, licencia y hash), nunca dibujos propios.

| Tablero | Qué muestra |
|---|---|
| `desktop-page.dc.html` | Página completa de escritorio (1440 px), todas las escenas en orden, con los textos v2.1 |
| `mobile-home.dc.html` | Página completa de teléfono (390 px) |
| `design-system.dc.html` | Paleta con la voz de código, contrastes medidos, tipografías, radios y tokens de movimiento |
| `color-voices.dc.html` | Estudio «Dos voces, dos colores»: antes/después, alternativas descartadas y dónde va cada color |
| `motion-script.dc.html` | Las 6 piezas de movimiento vigentes |
| `navbar-states.dc.html` | Barra arriba del todo, barra fija al bajar y su versión compacta en teléfono |

Se retiran `contact-form-desktop.dc.html` y `contact-form-mobile.dc.html` (el formulario deja de ser un modal; §3.5).

## 1. Concepto

Jorge traduce lo que pide el negocio a código y luego lo explica en palabras claras. El sitio lo muestra con **dos voces**, cada una con su tipografía y su color:

- **Voz de negocio (humana):** Anton y Manrope, con **Signal** (naranja) como único color de acción.
- **Voz de código:** JetBrains Mono, con **Code** (teal) para la sintaxis y los detalles de programador.

El naranja se queda: es la marca y la voz de quien comunica. El teal aparece poco (≈ 2 % de la página) y dice «sé programar» sin competir con los botones.

## 2. Tokens (`src/styles/tokens.css`)

### Color

| Token | Valor | Uso | Contraste medido |
|---|---|---|---|
| `--color-void` | `#060607` | Fondo de página, entre paneles | — |
| `--color-ink` | `#111113` | Hero, pie, panel del formulario | Bone 16,3:1 |
| `--color-graphite` | `#19171A` | Panel Perfil | Muted 6,7:1 |
| `--color-deep` | `#0F0F11` | Panel Proyectos | — |
| `--color-tile` | `#222024` | Tarjetas de cifras, fichas de logo | Texto `#BDB8AF` 8,2:1 |
| `--color-card` | `#1A1A1D` / `#1E1E22` | Tarjetas de proyecto, campos del formulario | — |
| `--color-paper` | `#ECE7DD` | Panel Servicios | Tinta 16,1:1 · `#5B5750` 5,8:1 |
| `--color-signal` | `#FF5B24` | **Voz de negocio:** CTA, apellido, cifras, numeración, cintas, panel del mensaje de Contacto | 6,1:1 sobre Ink · tinta encima 6,4:1 |
| `--color-signal-deep` | `#C2410C` | Signal sobre Paper, **solo texto ≥ 24 px** | 4,2:1 |
| `--color-code` | `#45D9C8` | **Voz de código:** sintaxis, cursores, rótulos tipo `funcion()`, guion bajo del logo, punto de «Disponible» | 10,8:1 sobre Ink · tinta encima 11,3:1 |
| `--color-code-deep` | `#0A5F54` | Voz de código sobre Paper | 6,1:1 |
| `--color-bone` | `#F2EEE6` | Texto principal sobre oscuro | — |
| `--color-bone-soft` | `#D9D4CB` | Párrafos sobre oscuro | 12,1:1 sobre Graphite |
| `--color-muted` | `#A29E97` | Rótulos y secundarios sobre oscuro | 7,1:1 sobre Ink |
| `--color-ink-text` | `#0A0A0B` | Texto sobre Paper y sobre Signal | — |
| `--color-error` | `#FF8A6B` | Errores del formulario sobre Ink | — |

Regla de las dos voces:

- **Code nunca** va en botones, fondos, bordes de acción ni títulos. Si dudas, es Signal.
- En el Traductor y en cualquier bloque de código: palabras clave y métodos en Code, cadenas `#E8C9A0`, comentarios `#8C8880`.
- Bordes de campos del formulario: `rgba(242,238,230,0.45)` (4,05:1 sobre Ink, cumple 3:1 de componentes).

Bordes translúcidos: `rgba(242,238,230,0.08 | 0.10 | 0.12 | 0.18 | 0.24 | 0.45)` sobre oscuro y `rgba(10,10,11,0.16 | 0.28 | 0.30 | 0.60)` sobre claro. Como tokens `--line-*`, sin valores sueltos.

### Tipografía

Sin cambios de familias ni de pesos (Anton 400, Manrope 400/500/700/800, JetBrains Mono 400/600, alojadas en el repo).

| Elemento | Tamaño |
|---|---|
| Nombre del Hero | `clamp(120px, 17.5vw, 252px)` (baja desde 330 px para dejar sitio a los paneles laterales) |
| Lema del Hero | 46 px escritorio · 34 px teléfono, interlineado 1 |
| Título de escena | `clamp(72px, 12vw, 190px)` |
| Frase de Perfil | `clamp(56px, 8vw, 128px)` · teléfono 52 px |
| «Mi stack» | 64 px escritorio · 44 px teléfono |
| Título de Contacto | `clamp(56px, 6.4vw, 92px)` · teléfono 46 px, con `text-wrap: balance` |
| «Cuéntame tu idea» | 56 px escritorio · 40 px teléfono |

### Radios y superficies

Sin cambios: panel 40 px (28 en ≤ 900 px), tarjeta 32, bloque 24 (campos 18, 16 en teléfono), píldora 999. Paneles separados 12 px (8 en teléfono). Contenido limitado a 1600 px.

### Movimiento

| Token | Valor |
|---|---|
| `--ease-cine` | `cubic-bezier(.2,.7,.2,1)` |
| `--dur-reveal` | `700ms`, escalonado de 80 ms por línea |
| `--dur-marquee-a` / `--dur-marquee-b` | `42s` / `54s`, en sentidos opuestos |
| `--dur-intro` | ≤ 5 s en total (implementado: 4535–4700 ms) |
| `--lift-scale` | `1.04` (tarjetas de cifras al pasar el puntero) |

## 3. Estructura y escenas

Orden único: Hero · 01 Perfil · 02 Servicios · 03 Proyectos · 04 Contacto · pie.

**i18n:** todo texto nuevo lleva su versión en inglés en `en.ts`. Las versiones en inglés de §3.1, §3.2 y §3.5 son las definitivas: úsalas tal cual.

### 3.0 Navegación (`navbar-states.dc.html`)

- **Estado inicial (dentro del Hero):** logo `jorgegmch_` (guion bajo en Code), píldora con `01 Perfil · 02 Servicios · 03 Proyectos · 04 Contacto`, botón de pausa, `ES / EN` y CTA «Hablemos» (Signal).
- **Logo:** con `(hover: hover) and (pointer: fine)` se traduce `jorgegmch_` ↔ `Jorge Gómez_` (ya implementado; nombre accesible «Jorge Gómez (jorgegmch), inicio»).
- **Al salir del Hero:** la barra pasa a **píldora fija** centrada arriba (`position: fixed`, fondo Ink al 90 %, borde `--line-14`, sombra de dos capas). Lleva logo, enlaces, pausa e idioma; **sin «Hablemos»**, porque Contacto ya está en la barra.
  - Entra con `translateY(-16px) + opacity`, 400 ms, `--ease-cine`. Con movimiento reducido aparece sin animar.
  - Marca la escena visible con `aria-current="true"` (fondo Bone, texto tinta), calculado con `IntersectionObserver`.
  - Cada sección lleva `scroll-margin-top` igual a la altura de la barra + 16 px, también al volver con Atrás/Adelante (corrige el fallo de restauración de scroll de la auditoría).
- **Teléfono:** píldora compacta con logo, rótulo mono de la escena actual (`03 Proyectos`) y botón de menú de 44 px.

### 3.1 Hero (Ink) — `desktop-page.dc.html`, primera escena

- **Metadatos:** «● Disponible para proyectos freelance» (punto en **Code** con pulso) y «Piedecuesta, CO · HH:MM GMT-5».
- **Nombre:** «JORGE» en Bone y «GÓMEZ» en Signal, centrado y detrás de la foto. **Sin animación** en el nombre.
- **Foto:** sin cambios de tratamiento.
- **Paneles laterales nuevos (señales de programador), decorativos y `aria-hidden`; solo a partir de 1280 px:**
  - **Izquierda:** ventana de código girada -3° (barra con tres puntos, nombre de archivo y líneas abstractas en Code / Bone / `#E8C9A0`). **El archivo debe ser real:** usa un controlador de `logitrack-api` que exista y su nombre de archivo verdadero (en el tablero, «AuthController.java» es un marcador). Si no puedes verificarlo en el repo, para y pregunta.
  - **Derecha:** rótulo `// stack principal` y 6 fichas con logo (Java, Spring Boot, PostgreSQL, Docker, n8n, Python), giradas 2,5°.
  - Por debajo de 1280 px se ocultan (no caben junto al nombre).
- **Lema nuevo, centrado al pie de la foto**, sobre un velo que funde la foto con el panel (`linear-gradient` de Ink a transparente, 190 px de alto):
  - ES: «EL CÓDIGO RESUELVE.» (Bone) / «EL CRITERIO MARCA LA DIFERENCIA.» (Signal).
  - EN: «CODE SOLVES.» / «JUDGMENT MAKES THE DIFFERENCE.»
  - Es texto real (no `aria-hidden`). Se evaluó ponerlo en la columna derecha y se descartó: choca con la «Z» del apellido y empuja los CTA hacia la cinta.
- **Bloque izquierdo** (sube a 132 px del borde inferior del escenario para dejar sitio al lema): «Full-Stack Developer» y la línea mono:
  - ES: `// Java · Spring Boot · IA y automatización` · EN: `// Java · Spring Boot · AI & automation`. Las `//` en Code.
- **Bloque derecho** (misma altura): descripción, «Ver proyectos →» y el menú «Descargar CV ⌄» (ya implementado).
  - ES: «Combino desarrollo de software, comunicación y pensamiento estratégico para crear soluciones que respondan a necesidades reales y tengan sentido para quienes las usan.»
  - EN: «I combine software development, communication and strategic thinking to build solutions that meet real needs and make sense to the people who use them.»
- **Cinta de stack:** sin cambios y **sin logos**: solo nombres separados por «✦», como hoy. Los logos de tecnología van únicamente en «Mi stack» y en las fichas «// stack principal».
- **Teléfono (`mobile-home.dc.html`):** nombre de 112 px, foto, lema de 34 px al pie de la foto (con `text-wrap: balance`) y debajo la tarjeta con rol, línea mono, descripción y CTA. Sin paneles laterales.

### 3.2 Perfil (Graphite)

- **Rótulos:** «01 — Perfil» en Signal y `del_negocio_al_codigo()` (sin cambios).
- **Frase nueva:** línea rellena + línea en contorno, como hoy.
  - ES: «ENTENDER EL RETO.» / «CONSTRUIR LA RESPUESTA.»
  - EN: «UNDERSTAND THE CHALLENGE.» / «BUILD THE ANSWER.»
- **Texto nuevo, dos párrafos** (19 px, interlineado 1,6, ancho máx. 600 px; 16 px en teléfono):
  - ES 1: «Soy desarrollador Full-Stack con enfoque en Java y Spring Boot. Mi formación en Comunicación Social y Periodismo también influye en cómo abordo la tecnología: me lleva a escuchar, analizar contextos y comprender las necesidades detrás de cada problema.»
  - ES 2: «Me interesa construir software que no solo funcione, sino que tenga sentido para quienes lo utilizan. Por eso busco conectar las decisiones técnicas con los objetivos del negocio, la claridad de la experiencia y el propósito de cada solución.»
  - EN 1: «I'm a Full-Stack developer focused on Java and Spring Boot. My background in Social Communication and Journalism also shapes how I approach technology: it leads me to listen, analyze context and understand the needs behind each problem.»
  - EN 2: «I want to build software that doesn't just work, but makes sense to the people who use it. That's why I connect technical decisions with business goals, a clear experience and the purpose of each solution.»
- **Se mantienen sin cambios:** las 3 tarjetas de cifras (**vuelve a verificar las cifras contra sus fuentes** y repórtalo), la Formación con sus textos actuales y el Traductor con sus **fragmentos reales actuales** (el tablero solo reproduce el de Inventario, `KpiService.java`). Único cambio en el Traductor: la sintaxis pasa a Code.
- **Bloque nuevo al final de Perfil: «Mi stack».** Separado por una línea `--line-12` y 48 px de aire.
  - Rótulo `stack.list()` en Code, título «MI STACK» (EN «MY STACK») y a la derecha «15 tecnologías» (EN «15 technologies»; el número sale del catálogo, no se escribe a mano).
  - 5 columnas separadas por líneas verticales: Lenguajes (Java, Python, JavaScript, TypeScript) · Backend (Spring Boot, Spring Security) · Datos (PostgreSQL, MySQL) · Frontend (React, HTML, CSS) · IA y herramientas (Agentes de IA, n8n, Docker, Git / GitHub). **La lista sale del catálogo de tecnologías del código**; si no coincide con esta, manda el catálogo y repórtalo.
  - Cada fila: ficha de logo de 38 px (Tile, radio 10) + nombre en Manrope 700, 17 px.
  - Teléfono: 2 columnas, fichas de 30 px.

### 3.3 Servicios (Paper)

Sin cambios, salvo que los separadores «/» de la cinta de código pasan a Code.

### 3.4 Proyectos (Deep)

- «Ver todos en GitHub ↗» como píldora con borde y logo de GitHub (ya implementado).
- **Etiquetas de stack:** sin cambios y **sin logos** (solo texto).
- «Ver código ↗» con logo de GitHub delante.
- El resto, sin cambios.

### 3.5 Contacto: dos paneles, formulario a la vista

La escena se parte en **dos paneles** con 12 px de separación (columnas 1,15 fr / 1 fr). En ≤ 900 px se apilan: mensaje, formulario y canales (ver `mobile-home.dc.html`).

- **Panel izquierdo (Signal, texto tinta):**
  - Rótulos «04 — Contacto» y «Piedecuesta, Colombia · HH:MM GMT-5».
  - Título nuevo, ES: «LAS BUENAS IDEAS MERECEN CONSTRUIRSE BIEN.» · EN: «GOOD IDEAS DESERVE TO BE BUILT WELL.»
  - Texto nuevo:
    - ES (22 px, 700): «¿Tienes un proyecto, un problema por resolver o buscas a alguien que aporte a tu equipo?»
    - ES (18 px, 500): «Hablemos de tus objetivos, lo que necesitas y cómo puedo aportar desde el desarrollo de software.»
    - EN: «Do you have a project, a problem to solve, or are you looking for someone to strengthen your team?» / «Let's talk about your goals, what you need and how I can contribute through software development.»
  - Al pie, rótulo «O por el canal que prefieras» y píldoras **con icono o logo**: Copiar correo (icono de sobre), WhatsApp, GitHub, LinkedIn (logos oficiales) y **un solo** menú «CV · ES ⌄» / «CV · EN ⌄» según el idioma (ya implementado). Se mantienen los mecanismos actuales de correo y WhatsApp: el dato nunca aparece en el HTML.
- **Panel derecho (Ink): el formulario, siempre visible.**
  - Rótulo `nuevo_mensaje()` en Code y título «CUÉNTAME TU IDEA» (EN «TELL ME YOUR IDEA»).
  - Campos, validación, estados y textos de error: los actuales del modal, sin cambios de lógica. Las opciones de «¿Qué necesitas?» son las que ya tiene el código (el tablero las muestra de forma ilustrativa).
  - Nombre y Correo en dos columnas; Empresa, chips y Mensaje a todo el ancho; botón «Enviar mensaje →» Signal de 60 px a todo el ancho.
  - Mejoras de la auditoría incluidas: `name` en cada campo, `spellcheck="false"` en el correo, placeholders con ejemplo y «…», objetivos táctiles ≥ 44 px, ⌘/Ctrl + Enter envía desde el mensaje.
  - **Estados dentro del panel:** enviando (botón deshabilitado), recibido (el panel muestra «MENSAJE RECIBIDO» y «Enviar otro»), error (`role="alert"`, el mensaje se conserva y se ofrece «Copiar correo»).
  - **Sin autofocus** al cargar: el formulario ya está a la vista.

### 3.6 Pie (Ink)

- **Créditos:** el primero pegado a la izquierda y el último a la derecha (`justify-content: space-between`), alineados con los bordes de la palabra de abajo. En teléfono, rejilla de 2 columnas.
- **Llamado a redes:** rótulo «SÍGUEME EN REDES» (EN «FOLLOW ME») en Signal y dos píldoras con logo: GitHub ↗ y LinkedIn ↗ (44 px de alto).
- **Marca:** «JORGEGMCH» en contorno, como `<svg viewBox="0 0 1288 316">` con `<text y="312" textLength="1288" lengthAdjust="spacingAndGlyphs">` a 357 px, para que ocupe exactamente el ancho de la rejilla. Decorativa, `aria-hidden`.
- **Línea final:** «© 2026 Jorge Gómez. Todos los derechos reservados.» y «Volver arriba» con icono de flecha (comportamiento ya corregido).

### 3.7 Elementos globales

Sin cambios: grano de película fijo y control global de pausa (WCAG 2.2.2).

## 4. Movimiento (`motion-script.dc.html`)

Regla dura: **solo `transform` y `opacity`**, sin librerías y con `prefers-reduced-motion` respetado.

1. **Intro.** La frase de negocio se tacha con doble trazo de lápiz, se reescribe como `optimize_workflow()` (en Code) y, tras la pausa, se abren las barras de cine. ≤ 5 s, una vez por sesión, **sin botón**: Esc, clic, Enter o Espacio la cierran. Con movimiento reducido no se muestra.
2. **El logo se traduce** (§3.0). El nombre del Hero ya no se anima.
3. **Cortina entre escenas.** Sin cambios.
4. **Cintas.** Sin cambios.
5. **Proyectos apilados.** Sin cambios.
6. **Barra que acompaña** (§3.0). Sustituye al botón magnético, que se retira.

Tarjetas de cifras: al pasar el puntero suben a `scale(var(--lift-scale))` (ya implementado).

## 5. Envío del formulario

- Se mantiene la interfaz `sendContactMessage(payload): Promise<Result>` con el adaptador que **no envía nada** y ofrece «Copiar correo». Ninguna petición de red ni clave en el código.
- **Backend: PENDIENTE de decisión del autor.** Propuesta en estudio: función propia en `api/` del mismo repo (Vercel Functions, Node.js) + servicio de correo transaccional. Antes hay que resolver si el plan gratuito de Vercel admite este sitio (sus reglas limitan el plan Hobby a uso personal no comercial).
- Requisitos ya fijados para cuando exista (documentados, no implementados): validación en el servidor, honeypot, límite de envíos, secretos solo en variables de entorno del servidor, sin datos personales en los logs, y si el envío falla, el formulario lo dice y ofrece los otros canales.

## 6. Se retira

- El modal del formulario (`<dialog>`), el botón circular «Escríbeme» y su efecto magnético, con su código y sus tests (los tests que solo prueban lo retirado se **borran**, no se saltan; los que prueban validación y estados se reescriben para el formulario en línea).
- La animación del nombre en el Hero.
- Lo ya retirado en v2 (Certificaciones como vista, edad, `Developer.java`, mapa, partículas, pastillas flotantes, rejilla del stack del Hero, tarjetas giratorias, paleta verde).

## 7. Reglas que siguen vigentes

- Sin push. **Nunca imprimas el teléfono ni el correo.**
- La fecha de nacimiento nunca en ningún archivo ni en el DOM.
- `git add` con rutas explícitas, sin `--no-verify`.
- Conventional Commits en inglés, sin atribución de IA. Un commit por causa.
- Solo colores de `tokens.css`, solo `transform` y `opacity`, `prefers-reduced-motion` y ninguna petición a terceros en ejecución.
- Contenido veraz: ninguna cifra ni texto sin respaldo en un repo.
- Logos: solo oficiales, registrados en `docs/LOGOS.md` con fuente, licencia y hash.
- Docs en español.
