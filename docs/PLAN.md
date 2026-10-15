# Plan de reconstrucción del portafolio

Reconstrucción de `portafolio-web` como SPA con Vite + React + TypeScript, con i18n ES/EN, página `/certificaciones`, fondo canvas, animación de carga, calidad automatizada y despliegue en Vercel.

Este archivo es la única versión del checklist. Se actualiza al cerrar cada fase, en un commit `docs` propio.
La memoria entre sesiones (estado actual, decisiones con su porqué, aprendizajes y próximos pasos) está en `docs/MEMORY.md`.

## Cómo retomar

1. Leer este archivo, `docs/MEMORY.md` y `AGENTS.md`, y contrastar con git (`git status -sb`, `git branch -vv`, `git log --oneline -3`).
2. **Siguiente paso: la sección «Servicios» de la Fase 6,** con el plan por commits aprobado por el autor el 2026-10-15. Cada commit espera la aprobación de su `git diff --stat`.
3. Los encargos 2 (transición de idioma, Fase 7) y 3 (cursor glitch) están en `docs/ENCARGOS.md`. La Ronda 2 del Hero va después de todas las secciones de la Fase 6. Nada de esto se ejecuta sin que el autor lo pida.
4. Antes de cada push: `/pre-push-check`. Al cerrar una fase: `/close-phase <fase>`.

## Fases

- [x] **Fase 1 — Scaffold y tooling:** Vite + React 19 + TypeScript estricto, alias `@/`, ESLint 10 con reglas de capas, Vitest + Testing Library.
- [x] **Fase 2 — Config, datos e i18n:** `config/`, `data/` (17 proyectos, 14 de ellos construidos; 9 certificaciones, 14 tecnologías), diccionarios `es.ts` y `en.ts`, `detectLang`.
- [x] **Fase 3 — Lógica pura y hooks:** `calculateAge`, `useAge`, `assembleContact`, `ContactButton`, `safeStorage`, `LangProvider` y los hooks de sesión, movimiento y scroll.

- [x] **Fase 4 — Layout base:** `tokens.css`, `global.css` y fuentes `@fontsource`; `Navbar` con selector ES/EN y menú móvil; `Footer`; `ParticleBackground`; router con `Layout`, páginas mínimas de inicio y certificaciones, favicon y título. Detalle en el commit de cierre, `9acabbf`.

- [x] **Fase 5 — Animación de carga:** `LoadingIntro` (una frase que se escribe y se transforma en código), botón «Saltar animación», una vez por sesión y sin intro con `prefers-reduced-motion`; montada en `Layout` con el resto de la página inerte. Detalle en el commit de cierre, `96266ff`.

### Fase 6 — Secciones de la home

En curso: ver «Cómo retomar». Lo hecho y lo pendiente de cada sección está en `docs/CIERRE-FASE-6.md`.

- [ ] **Hero:** foto, nombre, tagline, "Ver proyectos", "Descargar CV" con dropdown (versión diseñada y versión ATS, según idioma), iconos del stack principal
- [x] **Sobre mí:** bio, panel terminal que muestra la salida de `java Developer` con la edad en vivo y sin datos de contacto, 3 tarjetas de estadísticas, botón "Ver certificaciones". Detalle y pendientes en `docs/CIERRE-FASE-6.md`, «Sobre mí».
  - Condición para el revelado al hacer scroll: Reveal no anima el elemento que escala. En las tarjetas, el `<li>` es el que se revela y el `<div class="stat">` de dentro es el que escala con el hover; en la terminal, el envoltorio se revela y el panel escala.
- [ ] **Servicios** (antes «Tecnologías»; ancla `services`): etiqueta, título y 5 tarjetas de servicios definidas por el autor, con textos aprobados y enlace al repo que respalda cada una (la de comunicación no enlaza); debajo, «Mi stack tecnológico», una cuadrícula de fichas con el logo y el nombre de cada tecnología del catálogo, sin enlaces, niveles ni porcentajes. El catálogo pasa a 15 tecnologías con React; SQLite no entra.
- [ ] **Proyectos:** 5 destacados + botón "Ver todos en GitHub". En orden: LogiTrack IQ (protagonista), LogiTrack API, Portafolio Web, Inventory Guardian, RebelWear
- [ ] **Contacto:** email y teléfono visibles como texto, con llamado a la acción, ubicación a nivel de ciudad y tiempo de respuesta; LinkedIn y GitHub; sin formulario. Las acciones de escribir un correo y abrir WhatsApp siguen en `ContactButton`, que arma el dato al hacer clic
- [ ] Repetir la verificación de `.claude/rules/contacto.md` con la sección de contacto ya montada: cero literales en `dist/` (sin contar los PDFs del CV) y en `src/`, y los PDFs del CV solo con el email y el teléfono de `src/config/contact.ts`
- [x] `examples/java/Developer.java`: el record real y compilable (commit `494ee80`; cómo compilarlo, en `docs/EJEMPLO-JAVA.md`)

### Fase 7 — Página `/certificaciones`

- [ ] Ruta con `react-router-dom` (adelantado en la Fase 4: la ruta y una página mínima con su título ya existen; falta el contenido)
- [ ] Timeline vertical por fecha, con color, etiqueta e icono por categoría (Formación formal, Habilidades blandas, Técnico)
- [ ] Solo texto: sin imágenes de los documentos ni enlaces a los PDFs originales
- [ ] Transición de idioma: el encargo 2 de `docs/ENCARGOS.md`

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

## Ronda 2 del Hero

Después de todas las secciones de la Fase 6. No se ejecuta sin que el autor lo pida.

- Logos oficiales de Java y PostgreSQL en sus pastillas. Java sigue con Duke mientras la taza no tenga descarga oficial; si el autor la consigue, se cambia aquí.
- Aparición al hacer scroll del resto de elementos del Hero, igual que en «Sobre mí».
- Escritura palabra por palabra solo en el párrafo de presentación.
- Todo empieza al terminar la animación de carga, cuando el Hero se ve por primera vez.
- Contenedores de la fila de redes cuadrados con bordes redondeados en lugar de círculos. Cambia la lectura del autor anotada en `docs/LOGOS.md` sobre el círculo de WhatsApp y LinkedIn.
- **Aviso para la Fase 8:** si la foto aparece con un fundido, medir el LCP.

## Encargos aprobados

El texto literal de cada uno está en `docs/ENCARGOS.md`.

- **Encargo 2 — Transición de idioma** (Fase 7).
- **Encargo 3 — Cursor glitch** (trabajo aparte, después de la transición de idioma).

## Deudas

- **Recorte final en X** del campo de partículas, con cobertura débil.
- **1024 repetido** entre `lib`, `tokens`, `config` y `media`.
- **`useReducedMotion` duplica `useMediaQuery`.**
- **Utilidades de test duplicadas** entre los dos archivos del hook de partículas.
- **El dibujo estático** del fondo, con movimiento reducido, es una foto del momento del cambio.
- **Tests que leen archivos de disco** (eran seis al anotarlo: `ParticleBackground`, `Navbar.styles`, `site.title`, `site.icons`, `LoadingIntro.styles` e `introFrames.duration`): repiten el patrón y dependen de que Vitest se lance desde la raíz del repo; extraer un helper común.
  - Recuento del 11 de octubre de 2026, con `git grep`: 18 archivos de test importan `node:fs`, contando el nuevo `src/data/logoRecord.test.ts`, y otros 6 leen de disco solo a través de `src/test/cssRules.ts`. En total, 24.
  - `logoRecord.test.ts` lee `docs/LOGOS.md` y los archivos de `public/`, y es el primero que lista una carpeta: lo hace con `import.meta.glob`, porque el proyecto solo declara de Node leer un archivo y saber si existe.
  - La función que calcula el SHA-256 de un archivo está repetida en cinco tests (`Hero.badges`, `badgeIcons`, `brandLogos`, `socialLogos` y `logoRecord`): entra en el mismo helper.
- **Respaldo de la intro duplicado entre JS y CSS:** los 1000 ms de `exitFallbackMs` deben superar los 650 ms de `--duration-slow`; hoy solo los une un test.
- **Secuencias compuestas en la intro:** `buildIntroFrames` separa con `Array.from`, que partiría un emoji con ZWJ o una tilde descompuesta; si una frase las incluye, usar `Intl.Segmenter`.
- **Desbordamiento de la intro sin test:** que la frase quepa en 360 px solo lo vigila la medición manual en Chrome, no la suite; una frase más larga no haría fallar nada.
- **Enter en el botón de la intro, en el Chrome del autor:** con el botón enfocado no saltaba y Espacio sí. No se reproduce en incógnito ni en Chrome headless; parece una extensión de su perfil, sin causa confirmada.
- **Sonda de Chrome fuera del repo:** la duración, el foco, las teclas y los anchos se midieron con scripts desechables que conducen Chrome por DevTools; repetir la medición exige rehacerlos. Candidata a pasar a Playwright en la Fase 9.
- **Diagrama de capas sin `styles`** en `AGENTS.md` y `.claude/rules/arquitectura.md`.
- **Regla desactualizada:** `.claude/rules/arquitectura.md` aún dice que `tokens.css` no existe.
- **Sin revisar a ojo (Fase 4):** el anillo de foco del `main` al usar el skip link.
- **Sin revisar a ojo (Fase 4):** el panel del menú móvil abierto y cerrado, con el botón y con Esc.
- **Sin revisar (Fase 5):** si molesta el scroll de la página bajo la capa de la intro.
- **`README.md` línea 50** conserva el crédito anterior («Diseñado y construido por Jorge Gomez · 2026»); se corrige al rehacer el README con el procedimiento completo.

## Material pendiente del autor

- [ ] Foto con fondo transparente

## Extensiones de Claude Code

- [x] Skills `close-phase` y `pre-push-check`, en `.claude/skills/` (se invocan a mano: `/close-phase <fase>` y `/pre-push-check`)
- [ ] `/close-phase`: que envíe el detalle de cada fase a su propio archivo en vez de añadir una sección a este. Se cambia al cerrar la Fase 6.
- [ ] Skill `verify-contact`
- [ ] Hooks, todos escritos en Node: cubrir solo los huecos que `permissions.deny` no alcanza (`git commit -nm`, `git -c k=v push`, comillas, `sh -c`); antes de la Fase 6, un escaneo de datos personales
- [ ] Subagente `reviewer` (Fase 6)
- [ ] `disableBypassPermissionsMode` y `claude project purge`: son configuración de fuera del repo; preguntar al autor antes de tocar nada
- [ ] MCP solo si Playwright no basta

Cada pieza nueva exige su excepción en el `.gitignore` del repo, en el mismo commit que la crea.

## Pendientes de decisión

- **Tagline del hero:** hoy "Where code meets storytelling." en ambos idiomas. Se decide en la Fase 6.
- **Página 404 propia:** hoy una ruta desconocida redirige al inicio.
- **Aviso «Todos los derechos reservados»** del Footer frente a la licencia del repo.
- **`alt` de la foto y meta description:** si usan `shortName` o `legalName` (hoy usan `legalName`).
- **Trazo superior de la G** en la variante simplificada del favicon: posible retoque si en la pestaña real molesta.
- **Favicon sin hash registrado:** `apple-touch-icon.png`, `favicon.svg` y `favicon.ico`, en la raíz de `public/`, no tienen su SHA-256 anotado en ningún documento; `docs/LOGOS.md` y su test solo cubren las carpetas.

## Riesgos conocidos

- **`jsx-a11y` con ESLint 10:** funciona, pero el plugin solo declara soporte hasta ESLint 9; se permite con un `overrides` en `package.json`.
- **Open Graph por idioma:** las meta son estáticas, así que la vista previa en redes no cambia con `?lang=`.
- **PDFs de CV:** todo lo que esté en `public/` es público.
- **Rutas directas sin `vercel.json`:** hasta que exista el rewrite de SPA (Fase 10), abrir `/certificaciones` directamente en el despliegue dará un 404 del servidor.
- **Enlaces del Navbar a secciones:** no llevan a ningún sitio hasta la Fase 6, cuando existan las secciones.
- **La intro y Lighthouse:** en la primera visita la capa tapa la página unos 3,6 s; falta comprobar su efecto en las métricas de la Fase 8.
