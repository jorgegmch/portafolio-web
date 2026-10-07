# Plan de reconstrucción del portafolio

Reconstrucción de `portafolio-web` como SPA con Vite + React + TypeScript, con i18n ES/EN, página `/certificaciones`, fondo canvas, animación de carga, calidad automatizada y despliegue en Vercel.

Este archivo es la única versión del checklist. Se actualiza al cerrar cada fase, en un commit `docs` propio.
La memoria entre sesiones (estado actual, decisiones con su porqué, aprendizajes y próximos pasos) está en `docs/MEMORY.md`.

## Cómo retomar

1. Leer este archivo, `docs/MEMORY.md` y `AGENTS.md`, y contrastar con git (`git status -sb`, `git branch -vv`, `git log --oneline -3`).
2. **Siguiente paso: el encargo 1 de «Trabajo pendiente aprobado», el Hero (Fase 6).** El propio encargo dice qué proponer por escrito antes de escribir código; se espera la respuesta del autor. No se ejecuta sin que el autor lo pida.
3. Después vienen, en este orden, los encargos 2 y 3: la transición de idioma y el cursor glitch. Tampoco se ejecutan sin que el autor lo pida.
4. Antes de cada push: `/pre-push-check`. Al cerrar una fase: `/close-phase <fase>`.

## Fases

- [x] **Fase 1 — Scaffold y tooling:** Vite + React 19 + TypeScript estricto, alias `@/`, ESLint 10 con reglas de capas, Vitest + Testing Library.
- [x] **Fase 2 — Config, datos e i18n:** `config/`, `data/` (16 proyectos, 9 certificaciones, 13 tecnologías), diccionarios `es.ts` y `en.ts`, `detectLang`.
- [x] **Fase 3 — Lógica pura y hooks:** `calculateAge`, `useAge`, `assembleContact`, `ContactButton`, `safeStorage`, `LangProvider` y los hooks de sesión, movimiento y scroll.

- [x] **Fase 4 — Layout base:** `tokens.css`, `global.css` y fuentes `@fontsource`; `Navbar` con selector ES/EN y menú móvil; `Footer`; `ParticleBackground`; router con `Layout`, páginas mínimas de inicio y certificaciones, favicon y título. Detalle en «Cierre de la Fase 4».

- [x] **Fase 5 — Animación de carga:** `LoadingIntro` (una frase que se escribe y se transforma en código), botón «Saltar animación», una vez por sesión y sin intro con `prefers-reduced-motion`; montada en `Layout` con el resto de la página inerte. Detalle en «Cierre de la Fase 5».

### Fase 6 — Secciones de la home

Es el siguiente paso: ver «Cómo retomar». El Hero tiene un encargo aprobado más detallado que esta casilla: el encargo 1 de «Trabajo pendiente aprobado».

- [ ] **Hero:** foto, nombre, tagline, "Ver proyectos", "Descargar CV" con dropdown (versión diseñada y versión ATS, según idioma), iconos del stack principal
- [ ] **Sobre mí:** bio, panel terminal que muestra la salida de `java Developer` con la edad en vivo y sin datos de contacto, 4 tarjetas de estadísticas, botón "Ver certificaciones"
- [ ] **Tecnologías:** grupos con logos, sin niveles ni porcentajes
- [ ] **Proyectos:** 5 destacados + botón "Ver todos en GitHub". En orden: LogiTrack IQ (protagonista), LogiTrack API, Inventory Guardian, CRM Registro Campers, n8n Daily News Agent
- [ ] **Contacto:** email, WhatsApp, LinkedIn y GitHub; sin formulario. Los botones de email y WhatsApp usan `ContactButton`, que arma el dato al hacer clic y no al cargar
- [ ] Repetir la verificación con grep sobre `dist/` con la sección de contacto ya montada
- [ ] `examples/java/Developer.java`: el record real y compilable

### Fase 7 — Página `/certificaciones`

- [ ] Ruta con `react-router-dom` (adelantado en la Fase 4: la ruta y una página mínima con su título ya existen; falta el contenido)
- [ ] Timeline vertical por fecha, con color, etiqueta e icono por categoría (Formación formal, Habilidades blandas, Técnico)
- [ ] Solo texto: sin imágenes de los documentos ni enlaces a los PDFs originales

### Fase 8 — SEO, accesibilidad y rendimiento

- [ ] Meta, Open Graph, canonical, `og-image`, `robots.txt`, `sitemap.xml`, JSON-LD
- [ ] Skip-link, foco visible, contraste AA, `<html lang>` dinámico (adelantado en la Fase 4: el skip-link, el foco visible y `<html lang>` ya existen; falta la revisión completa)
- [ ] Code-splitting de `/certificaciones`
- [ ] Lighthouse ≥ 90 en las 4 categorías

### Fase 9 — Calidad y CI

- [ ] Tests de componentes: selector de idioma, dropdown de CV, certificaciones, tarjetas
- [ ] Smoke test en Playwright, incluida la comprobación de que el contacto no aparece en el HTML servido
- [ ] GitHub Actions: lint, typecheck, tests, build, e2e y `npm audit` en cada push
- [ ] Lighthouse CI
- [ ] Dependabot para npm y GitHub Actions

### Fase 10 — Deploy y cierre

- [ ] `vercel.json`: rewrite de SPA y headers de seguridad (CSP, `X-Content-Type-Options`, `X-Frame-Options`)
- [ ] Importar el repo en Vercel (integración Git)
- [ ] README nuevo y descripción del repo actualizada
- [ ] Desactivar GitHub Pages cuando el dominio de Vercel esté confirmado

## Cierre de la Fase 4

### Commits

| # | Hash | Commit |
|---|---|---|
| 1 | 6b6f909 | feat(styles): add design tokens and global styles |
| 2 | ee73d07 | feat(styles): load self-hosted Outfit and JetBrains Mono |
| 3 | 30d2a9d | feat(i18n): add layout texts |
| 4 | 59776ae | feat(config): add social link labels and main content anchor |
| 5 | c231cc0 | feat(ui): add skip link |
| 6 | 6aa622f | feat(ui): add language switcher |
| 7 | 11dac3e | feat(hooks): add useScrolled |
| 8 | 2688d10 | feat(hooks): add useScrollToHash |
| 9 | 28d6967 | feat(layout): add Navbar |
| 10 | 2fd384f | feat(hooks): add useMediaQuery |
| 11 | fb2780a | feat(layout): add mobile menu to Navbar |
| 12 | 8423726 | feat(layout): add Footer |
| 13 | 15ced55 | feat(lib): add particle field model |
| 14 | 2ae377c | test: add canvas, animation frame and per-query matchMedia doubles |
| 15 | 5b8b725 | feat(lib): add particle field drawing |
| 16 | f1d4b9e | feat(hooks): add useParticleCanvas |
| 17 | 77655e0 | feat(hooks): add reduced motion and pointer to useParticleCanvas |
| 18 | c7b8144 | feat(layout): add ParticleBackground |
| 19 | 92355f4 | feat(pages): add home and certifications page shells |
| 20 | 3a83a93 | style(layout): add navbar height token |
| 21 | d9f78e0 | feat(app): mount the router and layout shell |
| 22 | 84e4445 | refactor(config): show handle in logo and short name in hero |
| 23 | 884eb74 | style(layout): make the navbar logo slightly bolder |
| 24 | 2e92c79 | feat(layout): add copyright notice to Footer |
| 25 | 5dd0c31 | chore: update document title |
| 26 | 479e993 | feat(assets): replace favicon with JG monogram |
| 27 | 7fae10a | chore: add space to document title |
| 28 | 9711c10 | chore: add pre-push-check skill |
| 29 | 5456879 | chore: add close-phase skill |
| 30 | 487fe87 | chore: use first argument in close-phase skill |
| 31 | este commit | docs: update plan and memory after closing Phase 4 |

### Decisiones tomadas

- **Ruta desconocida:** una ruta comodín redirige al inicio con `replace`, para que Atrás no devuelva a la URL rota.
- **Año del Footer:** es fijo, `site.publishedYear` (2026), no calculado: es el año de primera publicación.
- **Título del documento:** «Jorge Gomez | Full-Stack Developer», con `site.title` como única fuente y un test que lo compara con `index.html`.
- **Terminal del hero:** mostrará `site.legalName`; por eso se conserva en la config aunque el `h1` ya no lo use.
- **Favicon:** documentado en `docs/FAVICON.md`, con las fuentes SVG en `design/`; el PNG original queda fuera del repo.

### Revisión visual

- **Comprobado a ojo por el autor:** el favicon, el responsive, el foco con Tab y la vuelta desde Certificaciones al inicio con el logo.
- **Pendiente:** el anillo de foco del `main` al usar el skip link, el panel del menú móvil abierto y cerrado (botón y Esc) y el `scroll-margin-top` de las secciones (Fase 6).

## Cierre de la Fase 5

### Commits

| # | Hash | Commit |
|---|---|---|
| 1 | 8bcacb1 | feat(i18n): make intro skip label explicit |
| 2 | c99185b | feat(lib): add intro frame builder |
| 3 | 23d58b5 | feat(hooks): add useIntroSequence |
| 4 | 9131318 | feat(hooks): add useIntroGate |
| 5 | 75f0023 | feat(layout): add LoadingIntro |
| 6 | e89c7fa | feat(layout): mount LoadingIntro in Layout |
| 7 | e94a550 | feat(i18n): update intro phrase |
| 8 | e52d32a | feat(lib): cap intro duration |
| 9 | f05fae3 | feat(layout): skip intro with Enter and Space |
| 10 | 42217f5 | feat(layout): focus intro layer on mount |
| 11 | da06ea2 | style(layout): restyle intro skip button |
| 12 | 7f85d53 | style(layout): enlarge intro text |
| 13 | este commit | docs: update plan and memory after closing Phase 5 |

### Decisiones tomadas

- **Mecánica:** máquina de escribir. Se escribe la frase, se borra solo hasta donde coincide con el código y se completa el código.
- **Frase:** una por idioma, aprobada por el autor («optimización de procesos» / «process optimization» → `optimize_workflow()`). El botón dice «Saltar animación» / «Skip animation».
- **Cuándo sale:** en cualquier ruta de entrada, una vez por sesión. Se marca como vista al terminar o al saltar, no al montar.
- **Movimiento reducido:** no aparece ni se marca como vista. La preferencia se lee solo al montar: cambiarla después ni la activa ni la corta.
- **Página de debajo:** se monta desde el principio, dentro de un `div` con `inert` mientras dura la intro.
- **Salida:** la capa se desvanece y se retira con `transitionend`; un respaldo de 1000 ms la retira si el evento no llega.
- **Duración:** entre 3 y 4 s contando el desvanecimiento, con el mínimo, el tope y un margen de 7 ms por fotograma como constantes. El margen sale de medir en Chrome (entre 5,0 y 6,3 ms por fotograma).
- **Foco:** empieza en la capa (`tabIndex -1`, sin anillo), no en el botón, para que el anillo del botón solo salga al llegar con Tab. Quitar el anillo de la capa es una excepción aceptada a `accesibilidad.md`, porque no es interactiva.
- **Teclas:** Enter, NumpadEnter y Espacio saltan con el foco en la capa; las que nacen en el botón las atiende él. Lleva el único `eslint-disable` del proyecto, con su razón.
- **Botón:** borde `--color-accent`, texto gris que pasa a azul con el puntero o el foco de teclado, y anillo separado del borde con `--space-1`.
- **Tamaño del texto:** token nuevo `--font-size-intro` (de 16 a 24 px).
- **Fuera de alcance:** cerrar con Escape y bloquear el scroll durante la intro.

### Revisión

- **Comprobado a ojo por el autor en su Chrome:** el botón (borde azul, texto gris a azul, anillo separado) y el tamaño del texto. En incógnito, Enter salta la intro.
- **Medido en Chrome headless sobre el build de producción:** la duración (ES entre 3556 y 3614 ms, EN entre 3719 y 3782 ms), el foco inicial y el recorrido con Tab sin entrar en la página, las teclas con la capa y con el botón enfocados, los estados del botón y los anchos a 360, 768 y 1280 px (una sola línea, sin desbordamiento).
- **Sin revisar:** si el scroll bajo la capa molesta. Siguen pendientes de la Fase 4 el anillo de foco del `main` al usar el skip link, el panel del menú móvil abierto y cerrado (botón y Esc) y el `scroll-margin-top` de las secciones (Fase 6).

## Trabajo pendiente aprobado

Tres encargos del autor, aprobados y sin ejecutar. Van después de la Fase 5 y en este orden. El texto es literal; la nota inicial de cada uno dice a qué fase de este plan corresponde.

### Encargo 1 — Hero

(en PLAN.md corresponde a la Fase 6)

> Hero de la página de inicio, en commits propios. Antes de escribir código, propón por escrito y espera mi respuesta: 1) la división en commits (por ejemplo estructura y textos, tipografía de títulos, columna de foto con iconos flotantes, ajustes responsive), 2) los textos: "Hola, yo soy" y "Hello, I'm" como claves i18n en minúsculas normales (las mayúsculas sostenidas van por CSS con text-transform y el espaciado de letras con un token); la presentación breve bajo el nombre no la escribas tú: te daré el texto aprobado; pregúntame si "Where code meets storytelling." se queda, 3) cómo partir el nombre en "Jorge" y "Gomez" sin duplicar el dato de config/site.ts, 4) el verde: busca en tokens.css el verde de la paleta y comprueba su contraste sobre el fondo; si no existe, propón un valor sin añadirlo, 5) la tipografía de los títulos: qué pesos reales de Outfit cargar (el mínimo necesario), su costo en kB medido en el build y los tokens de peso; sin negrita falsa, 6) la foto: formato optimizado, width y height para evitar saltos de maquetación, metadatos EXIF eliminados (incluida la ubicación) y alt desde i18n, 7) los iconos de tecnología: una lista propuesta a partir de mi stack (Java, Spring Boot, Python, JavaScript, MySQL, n8n, Git; React y TypeScript solo si los confirmo), con la fuente y la licencia de cada icono verificadas en el repositorio oficial, no de memoria, y mostradas antes de añadir nada, 8) lo que no pedí (botones, CV, anillo decorativo) queda fuera hasta que lo apruebe. Requisitos: el nombre (h1) mucho más grueso y más grande, parecido en grosor y tamaño a mi referencia (en la captura, con el mismo número de letras, el nombre de la referencia ocupa cerca de un 30 % más de ancho que el actual: tómalo como orientación aproximada y ajústalo con tu medición, con clamp para que no desborde en móvil); el título de la página de Certificaciones, un poco más grueso (menos que el del hero); los estilos de títulos compartidos entre Home y Certificaciones donde tenga sentido; "Jorge" en el color de texto blanco y "Gomez" en el verde; encima del nombre el saludo en mayúsculas sostenidas; debajo, la presentación breve; a la derecha, mi foto estática (no reacciona al puntero) rodeada de iconos de tecnología que flotan con CSS (solo transform) y que al pasar el puntero se amplían un poco, como un efecto sutil que indique el hover, sin ser enlaces ni botones; los iconos son decorativos (aria-hidden) porque la sección de tecnologías los listará; con prefers-reduced-motion sin flotación; en móvil, iconos más pequeños o menos y la foto bajo el texto; posiciones y tamaños con tokens o variables CSS, sin números sueltos; el h1 sigue siendo único y viene de hero.heading. Mi referencia visual (el portafolio de otra persona) es solo inspiración de estructura: no copies su marca ni su foto. Tests en rojo real y mutación de control en cada commit; la suite existente debe seguir verde sin tocar sus tests salvo los que afirmen el comportamiento anterior (lista cuáles y por qué). Muéstrame los archivos completos y confirma sin Ã ni CR desde disco. Sin push.

### Encargo 2 — Transición de idioma

(en PLAN.md no corresponde a ninguna fase: trabajo aparte, después del Hero)

> Commit propio: feat(i18n): add language switch transition. Al cambiar de idioma, Navbar, main y Footer se apagan (opacidad a 0) y vuelven, en 1 s en total: unos 450 ms de salida, el cambio de idioma exactamente en el punto oscuro (el atributo lang de html se actualiza ahí), y unos 450 ms de entrada. El canvas de partículas y el skip link quedan fuera del efecto. Duraciones como constantes nombradas o tokens, sin números sueltos. Con prefers-reduced-motion el cambio es instantáneo, sin animación. Un solo ciclo, sin parpadeos. El foco debe quedarse en el botón del selector. Si el usuario elige otro idioma durante la transición, dime qué harías antes de implementar y espera mi respuesta. Los tests del LangSwitcher y LangProvider que asuman cambio síncrono tendrán que actualizarse: lista cuáles y por qué antes de tocarlos. Tests con temporizadores falsos, rojo real y mutación de control en el momento del cambio de idioma. Confirma sin Ã ni CR desde disco. Después: git show --stat HEAD y espera mi aprobación. Sin push.

### Encargo 3 — Cursor glitch

(en PLAN.md no corresponde a ninguna fase: trabajo aparte, después del Hero)

> Nuevo trabajo: cursor personalizado con estilo glitch, en commits propios, después de la transición de idioma. Antes de escribir código, propón por escrito y espera mi respuesta: 1) la división en commits (lógica de tiempos pura con aleatoriedad inyectable, componente con su CSS Module, y montaje en Layout, o la que veas mejor), 2) la forma del cursor (no una flecha estándar; ofrece dos o tres opciones simples dibujadas con CSS o SVG), 3) el segundo color: busca primero en tokens.css si ya existe uno que encaje; si no, propón un valor y no añadas nada sin mi aprobación, 4) los intervalos: ráfaga de unos 150 ms cada cierto tiempo aleatorio entre un mínimo y un máximo largos (propón valores, por ejemplo entre 6 y 14 s), más una ráfaga corta al pasar sobre enlaces y botones; todo como constantes nombradas, sin números sueltos. Requisitos: el cursor del sistema solo se oculta cuando el nuestro ya está montado y solo con (hover: hover) y (pointer: fine); sin render en táctil; oculto hasta el primer pointermove y al salir el puntero de la ventana; sin bucle propio en reposo (la posición se actualiza solo cuando hay movimiento) y el glitch por clases CSS; con prefers-reduced-motion sin ráfagas ni retardo, solo la forma estática; capa por encima de todo con un token z-index (créalo si no existe) y pointer-events: none; el punto de clic debe coincidir exactamente con la posición real del puntero. Reutiliza useMediaQuery y useReducedMotion. Tests en rojo real y mutación de control en cada commit; la suite existente debe seguir verde sin tocar sus tests. Muéstrame los archivos completos y confirma sin Ã ni CR desde disco. Sin push.

## Deudas

- **Recorte final en X** del campo de partículas, con cobertura débil.
- **1024 repetido** entre `lib`, `tokens`, `config` y `media`.
- **Cierre de desplegables duplicado** (`LangSwitcher` y `Navbar`; el del CV será el tercero).
- **`useReducedMotion` duplica `useMediaQuery`.**
- **Utilidades de test duplicadas** entre los dos archivos del hook de partículas.
- **El dibujo estático** del fondo, con movimiento reducido, es una foto del momento del cambio.
- **Tests que leen archivos de disco** (ya son seis: `ParticleBackground`, `Navbar.styles`, `site.title`, `site.icons`, `LoadingIntro.styles` e `introFrames.duration`): repiten el patrón y dependen de que Vitest se lance desde la raíz del repo; extraer un helper común.
- **Respaldo de la intro duplicado entre JS y CSS:** los 1000 ms de `exitFallbackMs` deben superar los 650 ms de `--duration-slow`; hoy solo los une un test.
- **Secuencias compuestas en la intro:** `buildIntroFrames` separa con `Array.from`, que partiría un emoji con ZWJ o una tilde descompuesta; si una frase las incluye, usar `Intl.Segmenter`.
- **Desbordamiento de la intro sin test:** que la frase quepa en 360 px solo lo vigila la medición manual en Chrome, no la suite; una frase más larga no haría fallar nada.
- **Enter en el botón de la intro, en el Chrome del autor:** con el botón enfocado no saltaba y Espacio sí. No se reproduce en incógnito ni en Chrome headless; parece una extensión de su perfil, sin causa confirmada.
- **Sonda de Chrome fuera del repo:** la duración, el foco, las teclas y los anchos se midieron con scripts desechables que conducen Chrome por DevTools; repetir la medición exige rehacerlos. Candidata a pasar a Playwright en la Fase 9.
- **Diagrama de capas sin `styles`** en `AGENTS.md` y `.claude/rules/arquitectura.md`.
- **Reglas desactualizadas:** `.claude/rules/arquitectura.md` aún dice que `tokens.css` no existe, y `.claude/rules/tests.md` no menciona los dobles nuevos de `src/test/`.
- **`README.md` línea 50** conserva el crédito anterior («Diseñado y construido por Jorge Gomez · 2026»); se corrige al rehacer el README con el procedimiento completo.

## Pendiente antes de la Fase 6

- [ ] Foto con fondo transparente
- [ ] 4 PDFs de CV (diseñado y ATS, en ES y EN), sin número de cédula
- [ ] Logos SVG de las tecnologías, con licencia verificada
- [ ] `ai.svg`: icono genérico, sin marcas de empresas de IA, con licencia verificada

## Extensiones de Claude Code

- [x] Skills `close-phase` y `pre-push-check`, en `.claude/skills/` (se invocan a mano: `/close-phase <fase>` y `/pre-push-check`)
- [ ] Skill `verify-contact`
- [ ] Hooks, todos escritos en Node: cubrir solo los huecos que `permissions.deny` no alcanza (`git commit -nm`, `git -c k=v push`, comillas, `sh -c`); antes de la Fase 6, un escaneo de datos personales
- [ ] Subagente `reviewer` (Fase 6)
- [ ] `disableBypassPermissionsMode` y `claude project purge`: son configuración de fuera del repo; preguntar al autor antes de tocar nada
- [ ] MCP solo si Playwright no basta

Cada pieza nueva exige su excepción en el `.gitignore` del repo, en el mismo commit que la crea.

## Pendientes de decisión

- **React en el catálogo de tecnologías:** hoy solo aparece como etiqueta de un proyecto.
- **Tagline del hero:** hoy "Where code meets storytelling." en ambos idiomas. Se decide en la Fase 6.
- **Página 404 propia:** hoy una ruta desconocida redirige al inicio.
- **Aviso «Todos los derechos reservados»** del Footer frente a la licencia del repo.
- **«Full-Stack» en el título frente a «Full Stack» en `site.role`:** decidirlo cuando el hero muestre el rol.
- **`alt` de la foto y meta description:** si usan `shortName` o `legalName` (hoy usan `legalName`).
- **Trazo superior de la G** en la variante simplificada del favicon: posible retoque si en la pestaña real molesta.

## Riesgos conocidos

- **`jsx-a11y` con ESLint 10:** funciona, pero el plugin solo declara soporte hasta ESLint 9; se permite con un `overrides` en `package.json`.
- **Open Graph por idioma:** las meta son estáticas, así que la vista previa en redes no cambia con `?lang=`.
- **PDFs de CV:** todo lo que esté en `public/` es público.
- **Rutas directas sin `vercel.json`:** hasta que exista el rewrite de SPA (Fase 10), abrir `/certificaciones` directamente en el despliegue dará un 404 del servidor.
- **Enlaces del Navbar a secciones:** no llevan a ningún sitio hasta la Fase 6, cuando existan las secciones.
- **La intro y Lighthouse:** en la primera visita la capa tapa la página unos 3,6 s; falta comprobar su efecto en las métricas de la Fase 8.
