# Plan de reconstrucción del portafolio

Reconstrucción de `portafolio-web` como SPA con Vite + React + TypeScript, con i18n ES/EN, una sola página con sus escenas, animación de carga y calidad automatizada. El hosting está pendiente de decisión (ver «Pendientes de decisión»).

Este archivo es la única versión del checklist. Se actualiza al cerrar cada fase, en un commit `docs` propio.
La memoria entre sesiones (estado actual, decisiones con su porqué, aprendizajes y próximos pasos) está en `docs/MEMORY.md`.

## Cómo retomar

1. Leer este archivo, `docs/MEMORY.md` y `AGENTS.md`, y contrastar con git (`git status -sb`, `git branch -vv`, `git log --oneline -3`).
2. **Rama de trabajo: `redesign/v2`,** que sale de `rebuild/vite-react` en «feat(services): flip the service cards». Qué está subido no se apunta aquí, porque cambia con cada push: se consulta con `git status -sb` y `git log origin/redesign/v2..HEAD` (el segundo lista los commits que faltan por subir). El push lo hace siempre el autor.
3. **Fuente de verdad del diseño:** `docs/design/redesign-v2/DESIGN-SPEC.md` (v2.1) y sus tableros. Si discrepan, manda la spec.
4. **Siguiente paso:** los pendientes del autor y las comprobaciones de «Pendientes del rediseño v2.1»; después, las fases 8 a 10.
5. Los encargos 2 (transición de idioma) y 3 (cursor glitch) están en `docs/ENCARGOS.md`. No se ejecutan sin que el autor lo pida.
6. Antes de cada push: `/pre-push-check`. Al cerrar una fase: `/close-phase <fase>`.

## Fases

- [x] **Fase 1 — Scaffold y tooling:** Vite + React 19 + TypeScript estricto, alias `@/`, ESLint 10 con reglas de capas, Vitest + Testing Library.
- [x] **Fase 2 — Config, datos e i18n:** `config/`, `data/` (17 proyectos, 14 de ellos construidos; 9 certificaciones, 14 tecnologías), diccionarios `es.ts` y `en.ts`, `detectLang`.
- [x] **Fase 3 — Lógica pura y hooks:** `calculateAge`, `useAge`, `assembleContact`, `ContactButton`, `safeStorage`, `LangProvider` y los hooks de sesión, movimiento y scroll.

- [x] **Fase 4 — Layout base:** `tokens.css`, `global.css` y fuentes `@fontsource`; `Navbar` con selector ES/EN y menú móvil; `Footer`; `ParticleBackground`; router con `Layout`, páginas mínimas de inicio y certificaciones, favicon y título. Detalle en el commit de cierre, «docs: update plan and memory after closing Phase 4».

- [x] **Fase 5 — Animación de carga:** `LoadingIntro` (una frase que se escribe y se transforma en código), botón «Saltar animación», una vez por sesión y sin intro con `prefers-reduced-motion`; montada en `Layout` con el resto de la página inerte. Detalle en el commit de cierre, «docs: update plan and memory after closing Phase 5».

Lo que hicieron las fases 1 a 5 se describe como quedó entonces; el rediseño v2 cambió después varias piezas (ver la Fase 6).

### Fase 6 — Secciones de la home: hecha con el rediseño v2 y v2.1

- [x] **Rediseño v2** (de «docs(design): add the redesign v2 handoff» a «fix(contact): give the title room for the opening question mark», del 2026-10-19 al 2026-10-24) y **ajustes de diseño** (hasta «chore: remove the unused code», 2026-11-10): paneles con cortina entre escenas, intro de cine con tachado a lápiz (sin botón, ≤ 5 s), Hero, Perfil con Traductor, Servicios en acordeón numerado, cintas cruzadas, Proyectos apilados, Contacto y pie de «créditos finales». Retiró la página `/certificaciones`, el fondo de partículas, la terminal de `java Developer` con la edad, el mapa, las pastillas del Hero y su fila de redes, y la fecha de nacimiento del código.
- [x] **Rediseño v2.1** (de «docs(design): update the redesign handoff to v2.1» a «docs(logos): record the footer social logos», 2026-11-11): voz de código (color Code), barra que acompaña (píldora fija con la escena actual), Hero con lema, ventana de código real y fichas «// stack principal», textos nuevos de Hero, Perfil y Contacto, «Mi stack» con los logos oficiales, Contacto en dos paneles con el formulario a la vista (sin el diálogo «Escríbeme» ni el efecto magnético) y pie con «Sígueme en redes» y la marca en SVG. Corrigió dos fallos de la auditoría de Vercel: la restauración del scroll con Atrás/Adelante y los objetivos táctiles de menos de 44 px.
- [x] **Correcciones del 2026-11-11** (de «docs(design): update redesign v2 spec and artboards» a «feat(services): update the strategic communication text»), con la spec actualizada por el autor:
  - spec y tableros nuevos («docs(design): update redesign v2 spec and artboards»);
  - logos negros oficiales de un solo color en las píldoras de canales de Contacto, sobre Signal; a 900 px o menos, donde los canales pasan a Graphite, las blancas, con un `<picture>` («feat(contact): use official single-color social logos»);
  - «Ver código» sin logo, con nombre accesible «Ver código de {proyecto} en GitHub» («feat(projects): drop the github logo from the view code links»);
  - hover de la ventana de código y de las fichas del Hero, solo con puntero fino, con realce en Signal sobre un pseudo-elemento que solo anima su opacidad («feat(hero): add hover to the code window and stack tiles»);
  - texto nuevo de «Comunicación estratégica» en ES y EN («feat(services): update the strategic communication text»).
- [x] Verificación de `.claude/rules/contacto.md` con la escena Contacto montada: cero coincidencias en `dist/` y en `src/`, con control positivo; solo la excepción documentada del dominio en `javascript.svg`. Los PDFs del CV no cambiaron. Repetida el 2026-11-11 tras los logos negros, con el mismo resultado.
- El detalle de cada lote está en los mensajes de sus commits; las medidas y capturas de la verificación se tomaron con scripts locales de `.playwright-mcp/`, que no se versionan.

### Fase 7 — Página `/certificaciones`: retirada

El rediseño v2 retiró la página («refactor(pages): remove the certifications page»): de las certificaciones solo queda la Formación de Perfil. La transición de idioma, que estaba en esta fase, sigue aprobada sin fase (encargo 2).

### Fase 8 — SEO, accesibilidad y rendimiento

- [ ] Meta, Open Graph, canonical, `og-image`, `robots.txt`, `sitemap.xml`, JSON-LD
- [ ] Skip-link, foco visible, contraste AA, `<html lang>` dinámico (adelantado en la Fase 4: el skip-link, el foco visible y `<html lang>` ya existen; falta la revisión completa)
- [ ] Lighthouse ≥ 90 en las 4 categorías

### Fase 9 — Calidad y CI

- [ ] Tests de componentes que faltan: las tarjetas de proyecto y `useCardStack` (hoy se prueban sus enlaces de GitHub y el CSS de la pila, no el comportamiento) y el botón de idioma por sí solo (hoy se prueba dentro de la barra). El menú del CV ya tiene los suyos
- [ ] Smoke test en Playwright, incluida la comprobación de que el contacto no aparece en el HTML servido. Hoy hay un script `test:e2e` en `package.json`, pero ni configuración ni tests de Playwright en el repo
- [ ] GitHub Actions: lint, typecheck, tests, build, e2e y `npm audit` en cada push
- [ ] Lighthouse CI
- [ ] Dependabot para npm y GitHub Actions

### Fase 10 — Deploy y cierre

Depende de la decisión de hosting.

- [ ] `vercel.json` (si el hosting es Vercel): rewrite de SPA y headers de seguridad (CSP, `X-Content-Type-Options`, `X-Frame-Options`)
- [ ] Importar el repo en el hosting elegido
- [ ] README nuevo, en inglés, y descripción del repo actualizada (incluida la de portafolio-web en GitHub al fusionar)
- [ ] Desactivar GitHub Pages cuando el dominio nuevo esté confirmado
- [ ] Fusionar a `main`: merge commit, no squash

## Pendientes del rediseño v2.1

Hechas el 2026-11-11:

- [x] **Logos de redes en negro oficial en el panel Signal de Contacto** («feat(contact): use official single-color social logos»), registrados en `docs/LOGOS.md`. LinkedIn va en PNG: su paquete oficial no trae SVG.
- [x] **«Ver código» sin logo de GitHub** («feat(projects): drop the github logo from the view code links»); la spec y los tableros ya venían actualizados por el autor («docs(design): update redesign v2 spec and artboards»).

Material y decisiones del autor:

- [x] **Foto real del Hero:** la foto final sustituyó a la provisional el 2026-11-17, con `/update-hero-photo` («feat(hero): replace the hero portrait with the final photo»). El WebP está en color; el blanco y negro lo pone el filtro CSS (`docs/COMANDOS-HERO.md`).
- [x] **Favicon nuevo:** el «JG» en Ink y Signal del autor sustituyó al monograma cian del diseño anterior el 2026-11-18 («feat(favicon): replace the favicon with the ink and signal JG design» y «fix(favicon): fill the whole tab icon with the logo»). Sale de un PNG de 512 px: ya no hay `favicon.svg`. Fuente, recorte, script para regenerarlo y SHA-256 en `docs/FAVICON.md`.
- [ ] **Backend del formulario y hosting:** decisión abierta sobre Vercel, cuyo plan Hobby es solo para uso personal no comercial. Hoy el adaptador del formulario no envía nada (`docs/FORMULARIO-CONTACTO.md`).
- [ ] **Capturas reales de los 5 proyectos:** hoy cada tarjeta muestra «Captura pendiente».
- [ ] **PDFs del CV con «Gómez»:** los cuatro llevan el nombre sin tilde (comprobado el 2026-11-11). Se regeneran y se sustituyen con `/update-hero-cv`. El autor revisa además a ojo los dos infográficos (un texto convertido a contornos no sale al extraer el texto) y decide si LinkedIn y GitHub deben ser clicables en el PDF.
- [ ] **Descripción de n8n-daily-news-agent:** dice «every morning» y el flujo se dispara a las 19 h. El autor la cambia en GitHub y después se actualizan los dos diccionarios.
- [ ] **«Gemini»:** el autor lo quitó del CV a propósito; el portafolio lo sigue mencionando (n8n Daily News Agent) y es veraz. Decidir, sin urgencia, si se deja.
- [ ] **Meta description:** dice «Backend con Java, Spring Boot y PostgreSQL», que es cierto; el párrafo del Hero ya no nombra tecnologías. Decidir si deben decir lo mismo.
- [ ] **Párrafo del Hero en teléfono:** en español ocupa 5 líneas a 390 y 360 px y 6 a 320. Opciones: acortarlo, ensancharlo o bajar su tamaño.
- [ ] **Interlineado de la frase de Perfil:** sigue en 1,125, la excepción que pedía la tilde de la frase v2; la de la v2.1 no lleva mayúsculas con tilde y el tablero usa 0,96.
- [ ] **`examples/java/Developer.java`:** la terminal que lo mostraba se retiró en el rediseño v2 y el archivo sigue en el repo; su comentario remite a `docs/EJEMPLO-JAVA.md`, que se borró en el cierre del rediseño. Decidir si se borra.

Comprobaciones pendientes:

- [ ] **Contrastar los 14 proyectos construidos con GitHub, uno por uno:** que cada uno con `built: true` sigue siendo público y cumple el criterio de `.claude/rules/contenido-veraz.md`.
- [ ] **Pruebas en Safari, Firefox y dispositivos físicos:** todo lo medido se midió en Chrome (escritorio y emulación de teléfono).
- [ ] **Prueba de invocación real de `/update-hero-cv`, `/update-hero-photo` y `/update-hero-intro`:** tras reiniciar Claude Code, comprobar que se descubren al iniciar sesión y el diálogo de AskUserQuestion. Las «Prueba real» de `docs/COMANDOS-HERO.md` siguen escritas en futuro aunque se hicieron con material ficticio.

Limpieza:

- [ ] **Tokens sin uso** en `src/styles/tokens.css`: `--line-ink-60` (añadido en la v2.1 a petición del autor, sin uso todavía); los alias anteriores al rediseño `--color-surface`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-accent-alt`, `--color-border` y `--color-border-strong`; y `--color-signal-deep`, `--radius-sm`, `--tracking-wide`, `--tracking-wider`, `--leading-relaxed` y `--z-background`. No se borran sin aprobación.
- [ ] **Opción `icon` de `ContactButton`:** sin uso desde el rediseño v2.
- [ ] **Comentario de breakpoints de `tokens.css`:** dice que el Hero va apilado hasta 1023 px; desde el rediseño v2 se apila hasta 1280.
- [ ] **Mejoras de la auditoría de Vercel no aplicadas** (solo informe, 2026-11-10): `touch-action: manipulation`, color del resaltado al tocar, `overscroll-behavior` en `html`, estado del Traductor y de Servicios en la URL, `<title>` por idioma, comillas tipográficas en el resto de textos, cifras tabulares, `translate="no"` en marcas y código, `theme-color` y `color-scheme`, sombras de dos capas en lo que queda, radios concéntricos, más estados de hover, y bordes de menos de 3:1 (el chip apagado y los rótulos mono de 13 px que APCA marca bajos).
- [ ] **Avisos de `npm audit`:** moderados en `minimatch`, dentro de ESLint; su arreglo exige `--force` y bajar ESLint de la 10 a la 9. Esperar a una versión de ESLint 10 corregida.

## Encargos aprobados

El texto literal de cada uno está en `docs/ENCARGOS.md`.

- **Encargo 2 — Transición de idioma** (era de la Fase 7, retirada; sigue aprobado, sin fase).
- **Encargo 3 — Cursor glitch** (trabajo aparte, después de la transición de idioma).

## Deudas

- **`useReducedMotion` duplica `useMediaQuery`.**
- **Tests que leen archivos de disco:** repiten el patrón y dependen de que Vitest se lance desde la raíz del repo; `src/test/cssRules.ts` es un avance parcial del helper común. La función que calcula el SHA-256 de un archivo está repetida en `brandLogos`, `socialLogos`, `stackIcons` y `logoRecord`: entra en el mismo helper.
- **Respaldo de la intro duplicado entre JS y CSS:** `exitFallbackMs` (900 ms, en `src/lib/introFrames.ts`) debe superar la salida de las barras (`--dur-intro-exit`, 550 ms); hoy solo los une un test.
- **Secuencias compuestas en la intro:** `buildIntroFrames` separa con `Array.from`, que partiría un emoji con ZWJ o una tilde descompuesta; si una frase las incluye, usar `Intl.Segmenter`.
- **Desbordamiento de la intro sin test:** que la frase quepa en 360 px solo lo vigila la medición manual en Chrome, no la suite.
- **Sondas de Chrome fuera del repo:** la verificación del rediseño (anclas, áreas de clic, desbordes, choques del Hero, teclado, capturas) se midió con scripts de `.playwright-mcp/`, que no se versionan. Candidatos a tests de Playwright en la Fase 9.
- **Sin revisar a ojo (Fase 4):** el anillo de foco del `main` al usar el skip link.
- **Sin revisar (Fase 5):** si molesta el scroll de la página bajo la capa de la intro.
- **`README.md`:** describe el sitio anterior (HTML, CSS y JavaScript en GitHub Pages) y conserva «Jorge Gomez» sin tilde; se rehace en la Fase 10.

## Extensiones de Claude Code

- [x] Skills `close-phase` y `pre-push-check`, en `.claude/skills/` (se invocan a mano: `/close-phase <fase>` y `/pre-push-check`)
- [x] Comandos del Hero (`/update-hero-cv`, `/update-hero-photo` y `/update-hero-intro`; detalle en `docs/COMANDOS-HERO.md`). `/update-hero-social` y `/update-hero-badge` se retiraron el 2026-11-11 con las piezas que cambiaban.
- [ ] `/close-phase`: que envíe el detalle de cada fase a su propio archivo en vez de añadir una sección a este.
- [ ] Skill `verify-contact`
- [ ] Hooks, todos escritos en Node: cubrir solo los huecos que `permissions.deny` no alcanza (`git commit -nm`, `git -c k=v push`, comillas, `sh -c`), y un escaneo de datos personales
- [ ] Subagente `reviewer`
- [ ] `disableBypassPermissionsMode` y `claude project purge`: son configuración de fuera del repo; preguntar al autor antes de tocar nada
- [ ] MCP solo si Playwright no basta

Cada pieza nueva exige su excepción en el `.gitignore` del repo, en el mismo commit que la crea.

## Pendientes de decisión

- **Hosting y backend del formulario:** ver «Pendientes del rediseño v2.1».
- **Página 404 propia:** hoy una ruta desconocida redirige al inicio.
- **Aviso «Todos los derechos reservados»** del pie frente a la licencia del repo.
- **Meta description:** usa `legalName`; el `alt` de la foto ya usa `shortName`.
- **Espacio libre y tamaño mínimo de los logos de redes:** los paquetes descargados el 2026-11-11 no traen guía; GitHub incluye variantes `_Clearspace` sin decir cuánto espacio exige. Comprobarlo en las guías de marca publicadas.

## Riesgos conocidos

- **`jsx-a11y` con ESLint 10:** funciona, pero el plugin solo declara soporte hasta ESLint 9; se permite con un `overrides` en `package.json`.
- **Open Graph por idioma:** las meta son estáticas, así que la vista previa en redes no cambia con `?lang=`.
- **PDFs de CV:** todo lo que esté en `public/` es público.
- **La intro y Lighthouse:** en la primera visita la capa tapa la página entre 4,5 y 4,7 s (medido en la compilación); falta comprobar su efecto en las métricas de la Fase 8.
