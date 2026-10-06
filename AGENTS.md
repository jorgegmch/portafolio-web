# AGENTS.md

Guía para agentes de código que trabajan en este repositorio.

## Qué es

Portafolio personal en reconstrucción: SPA con Vite + React 19 + TypeScript estricto, con i18n ES/EN, que se desplegará en Vercel. El trabajo va por fases en la rama `rebuild/vite-react`.

`docs/PLAN.md` contiene las fases, los pendientes de decisión y los riesgos; léelo al empezar cada fase y actualízalo al cerrarla, en un commit `docs` propio. `docs/MEMORY.md` contiene la memoria entre sesiones: estado actual, decisiones con su porqué, aprendizajes y próximos pasos.

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # tsc -b && vite build
npm run lint         # ESLint (incluye las reglas de capas)
npm run typecheck    # tsc -b
npm test             # Vitest, una pasada
npm run test:watch   # Vitest en modo watch
npx vitest run src/lib/calculateAge.test.ts   # un solo archivo
npx vitest run -t "medianoche"                # tests cuyo nombre coincide
```

## Arquitectura

Un módulo solo importa de su propia capa o de las inferiores. Lo hace cumplir `no-restricted-imports` en `eslint.config.js`, así que una violación rompe el lint. Detalle en `.claude/rules/arquitectura.md`.

```
config · data · i18n · lib  <-  hooks  <-  components/ui  <-  components/layout · components/sections  <-  pages  <-  App
```

- Los imports hacia carpetas padre (`../`) están prohibidos: usa el alias `@/` (apunta a `src/`).
- Al crear una carpeta nueva bajo `src/`, añádela a su capa en `eslint.config.js`.
- Una fuente de verdad por dato: los conteos y las listas derivadas salen de `data/`; los datos personales y las claves de storage viven solo en `src/config/`.

### Contacto ofuscado

- No escribas el email ni el WhatsApp como texto literal en ningún archivo: viven codificados en `src/config/contact.ts`.
- Ensámblalos con `assembleContact` solo dentro de un manejador de clic, nunca al renderizar.
- Muéstralos únicamente mediante `ContactButton`. Detalle y verificación con grep sobre `dist/` en `.claude/rules/contacto.md`.

## Reglas del proyecto

Son vinculantes: léelas antes de tocar los archivos que cubren y cúmplelas. Si una petición choca con una regla, avisa y pregunta antes de ejecutarla. El resto de este archivo es contexto: explica cómo está montado el proyecto; las reglas dicen qué debes hacer.

@.claude/rules/arquitectura.md
@.claude/rules/convenciones-de-codigo.md
@.claude/rules/contenido-veraz.md
@.claude/rules/contacto.md
@.claude/rules/tests.md
@.claude/rules/estilos-y-animacion.md
@.claude/rules/accesibilidad.md

- **Texto aprobado:** la bio en `es.ts` y su traducción en `en.ts` están aprobadas palabra por palabra. No las edites sin aprobación explícita.
- **Nombre legal:** "Jorge Alberto Gomez Chaparro", sin tilde en Gomez. Se define una vez en `config/site.ts`.
- **Sin inventar datos:** las etiquetas de stack salen de la descripción de cada repo en GitHub; tecnologías sin niveles ni porcentajes.
- **DRY con regla de tres:** no extraigas una abstracción hasta la tercera repetición real.

## Flujo de trabajo

- Antes de escribir código de una fase: presentar el plan por commits y el plan de tests, y esperar aprobación.
- Si se pide un commit concreto, hacer solo ese y esperar aprobación antes del siguiente, salvo que se diga "todos".
- Mostrar contenido nuevo (datos, textos) antes de commitearlo.
- Al entregar código nuevo: explicar brevemente qué hace y para qué sirve, y después cómo lo logra. Marcar aparte cualquier concepto nuevo para el proyecto.
- Commits separados por causa, con Conventional Commits en inglés (por ejemplo `feat(lib): add age calculation`), sin líneas de atribución ni menciones a herramientas. Los commits anteriores en español se traducen al reescribir el historial. Cada commit debe pasar lint, typecheck y tests por sí solo.
- Antes de cada push, comprobar:
  - que ningún mensaje de commit mencione a IA: `git log --format=%B | Select-String "claude|anthropic|co-authored"` no debe devolver nada;
  - que ningún archivo versionado contenga datos personales en claro (email, teléfono, número de cédula y fecha de nacimiento).
- README y descripción del repo en inglés; `AGENTS.md`, `PLAN.md` y `MEMORY.md` en español.
- Las reglas generales se editan aquí y el detalle por área en `.claude/rules/`. `CLAUDE.md` solo importa `@AGENTS.md` y no duplica su contenido.

## Verificación

- Antes de dar una tarea por terminada: `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` sin errores.
- Si no puedes comprobar algo, dilo; no lo des por hecho.

## Memoria

- Al empezar, leer `docs/MEMORY.md`; al terminar una tarea, actualizarlo (estado, decisiones con su porqué, errores a evitar). Máximo ~50 líneas.
- Si algo se vuelve regla permanente, proponer moverlo a este archivo. Nunca guardar datos sensibles.
- Sus cambios se commitean junto con el commit `docs` de cierre de fase.

## Límites

- ✅ Siempre: actualizar `docs/MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: añadir dependencias (con `npm audit` antes y después) y cualquier petición a terceros en runtime (Google Fonts, analítica, CDN, iframes).
- 🚫 Nunca: email, teléfono, cédula ni fecha de nacimiento en claro en ningún archivo (código, tests, docs, comentarios, metadatos de PDF o imágenes, capturas, logs) (en documentos se nombra el campo, no su valor).
- 🚫 Nunca: `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `new Function`.
- 🚫 Nunca: secretos en variables `VITE_*` (son públicas), ni tokens o claves en archivos del repo o en workflows; usar GitHub Secrets.
- 🚫 Nunca: `git add .` ni `git add -A` sin revisar `git status`; `--no-verify`; force push; push sin que se pida; commitear `.claude/settings.local.json`.
