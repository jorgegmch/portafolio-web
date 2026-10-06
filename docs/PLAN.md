# Plan de reconstrucción del portafolio

Reconstrucción de `portafolio-web` como SPA con Vite + React + TypeScript, con i18n ES/EN, página `/certificaciones`, fondo canvas, animación de carga, calidad automatizada y despliegue en Vercel.

Este archivo es la única versión del checklist. Se actualiza al cerrar cada fase, en un commit `docs` propio.
La memoria entre sesiones (estado actual, decisiones con su porqué, aprendizajes y próximos pasos) está en `docs/MEMORY.md`.

## Fases

- [x] **Fase 1 — Scaffold y tooling:** Vite + React 19 + TypeScript estricto, alias `@/`, ESLint 10 con reglas de capas, Vitest + Testing Library.
- [x] **Fase 2 — Config, datos e i18n:** `config/`, `data/` (16 proyectos, 9 certificaciones, 13 tecnologías), diccionarios `es.ts` y `en.ts`, `detectLang`.
- [x] **Fase 3 — Lógica pura y hooks:** `calculateAge`, `useAge`, `assembleContact`, `ContactButton`, `safeStorage`, `LangProvider` y los hooks de sesión, movimiento y scroll.

### Fase 4 — Layout base

- [ ] `tokens.css` con la paleta actual, `global.css` y fuentes `@fontsource`
- [ ] `Navbar` con selector ES/EN accesible por teclado
- [ ] `Footer`
- [ ] `ParticleBackground`: canvas propio, reacciona al mouse, modo reducido

### Fase 5 — Animación de carga

- [ ] `LoadingIntro`: frase en lenguaje natural que se transforma en código
- [ ] Botón "Saltar", una sola vez por sesión, respeta `prefers-reduced-motion`

### Fase 6 — Secciones de la home

- [ ] **Hero:** foto, nombre, tagline, "Ver proyectos", "Descargar CV" con dropdown (versión diseñada y versión ATS, según idioma), iconos del stack principal
- [ ] **Sobre mí:** bio, panel terminal que muestra la salida de `java Developer` con la edad en vivo y sin datos de contacto, 4 tarjetas de estadísticas, botón "Ver certificaciones"
- [ ] **Tecnologías:** grupos con logos, sin niveles ni porcentajes
- [ ] **Proyectos:** 5 destacados + botón "Ver todos en GitHub". En orden: LogiTrack IQ (protagonista), LogiTrack API, Inventory Guardian, CRM Registro Campers, n8n Daily News Agent
- [ ] **Contacto:** email, WhatsApp, LinkedIn y GitHub; sin formulario. Los botones de email y WhatsApp usan `ContactButton`, que arma el dato al hacer clic y no al cargar
- [ ] Repetir la verificación con grep sobre `dist/` con la sección de contacto ya montada
- [ ] `examples/java/Developer.java`: el record real y compilable

### Fase 7 — Página `/certificaciones`

- [ ] Ruta con `react-router-dom`
- [ ] Timeline vertical por fecha, con color, etiqueta e icono por categoría (Formación formal, Habilidades blandas, Técnico)
- [ ] Solo texto: sin imágenes de los documentos ni enlaces a los PDFs originales

### Fase 8 — SEO, accesibilidad y rendimiento

- [ ] Meta, Open Graph, canonical, `og-image`, `robots.txt`, `sitemap.xml`, JSON-LD
- [ ] Skip-link, foco visible, contraste AA, `<html lang>` dinámico
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

## Pendiente antes de la Fase 6

- [ ] Foto con fondo transparente
- [ ] 4 PDFs de CV (diseñado y ATS, en ES y EN), sin número de cédula
- [ ] Logos SVG de las tecnologías, con licencia verificada
- [ ] `ai.svg`: icono genérico, sin marcas de empresas de IA, con licencia verificada

## Extensiones de Claude Code

- [ ] Skills `verify-contact`, `close-phase` y `pre-push-check`
- [ ] Hooks, todos escritos en Node: bloquear `git add -A`, `--no-verify` y force push; antes de la Fase 6, un escaneo de datos personales
- [ ] Subagente `reviewer` al empezar la UI
- [ ] MCP solo si Playwright no basta

Cada pieza nueva exige su excepción en el `.gitignore` del repo, en el mismo commit que la crea.

## Pendientes de decisión

- **React en el catálogo de tecnologías:** hoy solo aparece como etiqueta de un proyecto.
- **Tagline del hero:** hoy "Where code meets storytelling." en ambos idiomas. Se decide en la Fase 6.

## Riesgos conocidos

- **`jsx-a11y` con ESLint 10:** funciona, pero el plugin solo declara soporte hasta ESLint 9; se permite con un `overrides` en `package.json`.
- **Open Graph por idioma:** las meta son estáticas, así que la vista previa en redes no cambia con `?lang=`.
- **PDFs de CV:** todo lo que esté en `public/` es público.
