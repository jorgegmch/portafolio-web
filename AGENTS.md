# AGENTS.md

Guía para agentes de código que trabajan en este repositorio.

## Qué es

Portafolio personal en reconstrucción: SPA con Vite + React 19 + TypeScript estricto, con i18n ES/EN, que se desplegará en Vercel. El trabajo va por fases en la rama `rebuild/vite-react`.

`docs/PLAN.md` contiene las fases, los pendientes de decisión y los riesgos; léelo al empezar cada fase y actualízalo al cerrarla, en un commit `docs` propio. `docs/MEMORY.md` contiene la memoria entre sesiones: estado actual, decisiones con su porqué, aprendizajes y próximos pasos. El `README.md` todavía describe el sitio viejo (HTML estático); se reescribe en la última fase.

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

`npm run test:e2e` (Playwright) está declarado, pero aún no hay configuración ni tests; llegan en la fase de CI.

## Arquitectura

### Capas

Un módulo solo importa de su propia capa o de las inferiores. Lo hace cumplir `no-restricted-imports` en `eslint.config.js`, así que una violación rompe el lint:

```
config · data · i18n · lib  <-  hooks  <-  components/ui  <-  components/layout · components/sections  <-  pages  <-  App
```

- Los imports hacia carpetas padre (`../`) están prohibidos: usa el alias `@/` (apunta a `src/`).
- Al crear una carpeta nueva bajo `src/`, añádela a su capa en `eslint.config.js`.

### Estructura y texto van separados

- `src/data/` guarda solo lo que no se traduce: ids, fechas, nombres propios, etiquetas de stack.
- `src/i18n/es.ts` y `en.ts` guardan los textos, indexados por esos ids.
- `Dictionary` (`src/i18n/types.ts`) usa `Record<ProjectId, …>` y `Record<CertificationId, …>`. Los tipos de id se derivan de los arreglos `as const` de `data/`, de modo que añadir un proyecto o una certificación sin su texto en ambos idiomas no compila.

Añadir un proyecto o certificación = una entrada en `data/` + una en cada diccionario.

### Una fuente de verdad por dato

Los conteos y listas derivadas salen de `data/` (`projects.length`, `featuredProjects`, `primaryStack`), nunca se escriben a mano. Los datos personales y las claves de storage viven solo en `src/config/`. La tabla "Un solo lugar por cambio" de `docs/PLAN.md` dice dónde va cada cosa.

### Contacto ofuscado

El email y el WhatsApp no pueden aparecer como texto literal en ningún archivo del repo (es público), ni en el bundle, ni en el DOM antes de que el visitante interactúe.

- `src/config/contact.ts` los guarda como códigos de carácter desplazados.
- `src/lib/assembleContact.ts` los reconstruye; se llama solo desde un manejador de clic, nunca al renderizar.
- `ContactButton` es la única vía para mostrarlos.
- Los tests comprueban la forma del resultado y obtienen el valor esperado de `assembleContact`; nunca lo escriben.

Es ofuscación contra scrapers simples, no protección real. Si tocas esta parte, repite la verificación con grep sobre `dist/` descrita en `docs/PLAN.md`, pasando las cadenas por línea de comandos sin guardarlas en ningún archivo.

### Idioma

`detectLang` (pura) resuelve el idioma inicial: `?lang=` > localStorage > navegador > `es`. `LangProvider` la usa y expone `{ lang, t, setLang }` vía `useLang`. Solo la elección hecha con `setLang` se guarda; un `?lang=` recibido vale para la visita y se quita de la URL cuando el visitante elige.

### Tests

- Entorno jsdom para todos; `src/test/setup.ts` limpia el DOM y el Web Storage después de cada test, por lo que un archivo de test no puede declararse con entorno `node`.
- jsdom no trae `matchMedia` ni `IntersectionObserver`: usa `src/test/mockMatchMedia.ts` y el doble definido en `useRevealOnScroll.test.tsx`.
- Los tests de fechas usan una fecha de nacimiento ficticia, no la de `config/`.

## Reglas del proyecto

- **Texto aprobado:** la bio en `es.ts` y su traducción en `en.ts` están aprobadas palabra por palabra. No las edites sin aprobación explícita.
- **Nombre legal:** "Jorge Alberto Gomez Chaparro", sin tilde en Gomez. Se define una vez en `config/site.ts`.
- **Sin inventar datos:** las etiquetas de stack salen de la descripción de cada repo en GitHub; tecnologías sin niveles ni porcentajes.
- **DRY con regla de tres:** no extraigas una abstracción hasta la tercera repetición real. Por eso no existe `useTheme` (el sitio tiene un solo tema).
- **Privacidad:** ningún documento del repo lleva email, teléfono, fecha de nacimiento ni número de cédula; se nombra el campo, no su valor.

## Flujo de trabajo

- Antes de escribir código de una fase: presentar el plan por commits y el plan de tests, y esperar aprobación.
- Si se pide un commit concreto, hacer solo ese y esperar aprobación antes del siguiente, salvo que se diga "todos".
- Mostrar contenido nuevo (datos, textos) antes de commitearlo.
- Al entregar código nuevo: explicar brevemente qué hace y para qué sirve, y después cómo lo logra. Marcar aparte cualquier concepto nuevo para el proyecto.
- Commits separados por causa, con Conventional Commits en español (`feat(lib): se añade…`), sin líneas de atribución ni menciones a herramientas. Cada commit debe pasar lint, typecheck y tests por sí solo.
- No hacer push sin que se pida. Antes del primer push, comprobar:
  - que ningún mensaje de commit mencione a IA: `git log --format=%B | Select-String "claude|anthropic|co-authored"` no debe devolver nada;
  - que ningún archivo versionado contenga datos personales en claro (email, teléfono, número de cédula).
- Las reglas se editan en este archivo. `CLAUDE.md` solo debe importarlo con `@AGENTS.md` y no duplicar su contenido.

## Memoria

- Al empezar, leer `docs/MEMORY.md`; al terminar una tarea, actualizarlo (estado, decisiones con su porqué, errores a evitar). Máximo ~50 líneas.
- Si algo se vuelve regla permanente, proponer moverlo a este archivo. Nunca guardar datos sensibles.
- Sus cambios se commitean junto con el commit `docs` de cierre de fase.

## Límites

- ✅ Siempre: actualizar `docs/MEMORY.md` al terminar cada tarea.

## Dependencias

- `eslint-plugin-jsx-a11y` solo declara soporte hasta ESLint 9; se usa con ESLint 10 mediante el bloque `overrides` de `package.json`. Si una actualización de ESLint rompe el lint, empieza por ahí.
- `eslint-plugin-boundaries` se descartó porque arrastraba vulnerabilidades altas; no lo reintroduzcas sin revisar `npm audit`.
