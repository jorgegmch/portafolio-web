# Plan de reconstrucción del portafolio

Reconstrucción de `portafolio-web` como SPA con Vite + React + TypeScript, con i18n ES/EN, página `/certificaciones`, fondo canvas, animación de carga, calidad automatizada y despliegue en Vercel.

Este archivo es la única versión del checklist. Se actualiza al cerrar cada fase, en un commit `docs` propio.
La memoria entre sesiones (estado actual, decisiones con su porqué, aprendizajes y próximos pasos) está en `docs/MEMORY.md`.

**Estado:** Fases 1, 2 y 3 cerradas. Siguiente: Fase 4.

## Un solo lugar por cambio

| Qué cambia | Dónde |
|---|---|
| Nombre legal, fecha de nacimiento, rol, ubicación, redes | `src/config/site.ts` |
| Email y WhatsApp (codificados) | `src/config/contact.ts` |
| Rutas y anclas de sección | `src/config/routes.ts` |
| Claves de localStorage / sessionStorage | `src/config/storage.ts` |
| Proyectos, certificaciones, tecnologías | `src/data/` |
| Textos en español e inglés | `src/i18n/es.ts`, `src/i18n/en.ts` |
| Colores, tipografías, espaciados | `src/styles/tokens.css` (Fase 4) |

## Fases

### Fase 0 — Preparación (parcial)

- [x] Rama `rebuild/vite-react`
- [x] Decisiones base: npm, CSS Modules, react-router, solo tema oscuro, descripciones EN del repo + ES traducidas, 4 PDFs de CV
- [ ] Recursos pendientes: ver "Pendiente antes de la Fase 6"

### Fase 1 — Scaffold y tooling (hecha)

- [x] `.gitignore` y `.env.example`
- [x] Vite + React 19 + TypeScript estricto, alias `@/`
- [x] ESLint 10 con reglas de capas, `jsx-a11y` y `react-hooks`
- [x] Vitest + Testing Library
- [x] `npm audit` sin vulnerabilidades
- [ ] Importar las fuentes de `@fontsource` (ya instaladas; va en la Fase 4)

### Fase 2 — Config, datos e i18n (hecha)

- [x] `config/`: datos del sitio, contacto codificado, rutas, claves de storage
- [x] `data/`: tipos, 16 proyectos (5 destacados), 9 certificaciones, 13 tecnologías en 6 grupos
- [x] `i18n/`: tipo `Dictionary`, `es.ts` y `en.ts` con la bio aprobada y todos los textos
- [x] `detectLang` con tests: `?lang=` > localStorage > navegador > `es`

### Fase 3 — Lógica pura y hooks (hecha)

- [x] `calculateAge` con tests (día anterior, día del cumpleaños y día siguiente; años bisiestos; cambio de año)
- [x] `useAge`: recalcula en cada medianoche local y al volver a la pestaña
- [x] `assembleContact`: el email y el WhatsApp se ensamblan bajo demanda, no al cargar la página
- [x] `ContactButton` (sin estilos): arma el dato al hacer clic. El de email abre `mailto:` y muestra el correo como texto; el de WhatsApp abre `wa.me` en una pestaña nueva
- [x] Tests del contacto: antes del clic el dato no está en el DOM, después del clic se abre el enlace correcto, y el botón es accesible por teclado
- [x] Verificado con grep sobre `dist/` y sobre los archivos versionados que el contacto no queda como texto literal
- [x] `safeStorage` y `formatYearMonth`
- [x] `LangProvider` y `useLang` (persistencia y `<html lang>`)
- [x] `useOncePerSession`, `useReducedMotion`, `useRevealOnScroll`

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
- [ ] Importar el repo en Vercel (integración Git; si algún día se despliega desde Actions, el token va como GitHub Secret)
- [ ] README nuevo y descripción del repo actualizada
- [ ] Desactivar GitHub Pages cuando el dominio de Vercel esté confirmado

## Pendiente antes de la Fase 6

- [ ] Foto con fondo transparente
- [ ] 4 PDFs de CV (diseñado y ATS, en ES y EN), sin número de cédula
- [ ] Logos SVG de las tecnologías, con licencia verificada
- [ ] `ai.svg`: icono genérico, sin marcas de empresas de IA, con licencia verificada

## Pendientes de decisión

- **Repos públicos contra la tarjeta:** el botón "Ver todos en GitHub" lleva a 19 repos públicos, pero la tarjeta "Proyectos" cuenta los 16 de `data/projects.ts`.
- **Descripciones en GitHub:** la de `crm-registro-campers` ya no coincide con la del sitio (que aclara que es solo frontend y un módulo de un MVP en equipo); la de `campuslands-erp-cli` tiene una puntuación por corregir, y al corregirla hay que actualizar `en.ts` y `es.ts`.
- **React en el catálogo de tecnologías:** hoy solo aparece como etiqueta de un proyecto.
- **Tagline del hero:** hoy "Where code meets storytelling." en ambos idiomas. Se decide en la Fase 6.

## Riesgos conocidos

- **Contacto:** el email y el WhatsApp se guardan codificados en `config/contact.ts`, se ensamblan al hacer clic y no existen en el DOM al cargar la página. Aun así es ofuscación contra scrapers simples, no protección real.
- **`jsx-a11y` con ESLint 10:** funciona, pero el plugin solo declara soporte hasta ESLint 9; se permite con un `overrides` en `package.json`.
- **Open Graph por idioma:** las meta son estáticas, así que la vista previa en redes no cambia con `?lang=`.
- **PDFs de CV:** todo lo que esté en `public/` es público.
