# Arquitectura

## Capas

Un módulo solo importa de su propia capa o de las inferiores:

    assets · config · data · i18n · lib · styles  <-  hooks  <-  components/ui  <-  components/layout · components/sections  <-  pages  <-  App

- Los límites se hacen cumplir con `no-restricted-imports` en `eslint.config.js`. No añadas `eslint-plugin-boundaries`: arrastra vulnerabilidades altas.
- Prohibido importar de carpetas padre (`../`): usa el alias `@/`, que apunta a `src/`.
- Toda carpeta nueva bajo `src/` se añade a su capa en `eslint.config.js`.

## Estructura y texto van separados

- `src/data/` guarda solo lo que no se traduce: ids, fechas, nombres propios, etiquetas de stack.
- `src/i18n/es.ts` y `en.ts` guardan los textos, indexados por esos ids.
- Los tipos de id se derivan de los arreglos `as const` de `data/`, y `Dictionary` los exige con `Record<ProjectId, …>`, `Record<ServiceId, …>`, `Record<EducationId, …>`, `Record<TechnologyGroup, …>` y similares. No relajes esos tipos: son los que impiden que falte un texto en un idioma.
- Añadir un proyecto = una entrada en `data/` + una en cada diccionario.
- Los nombres de tecnología son nombres propios y no se traducen; el idioma que dé uno propio lo pone en `technologyNames` de su diccionario (hoy, solo «Agentes de IA»), y los componentes lo leen con `useTechnologyName`.

## Una fuente de verdad por dato

- Los conteos y las listas derivadas salen de `data/` (`projects.length`, `builtProjects`, `featuredProjects`, `technologies.length`, `technologyGroups`); nunca se escriben a mano.
- Los datos personales y las claves de storage viven solo en `src/config/`.

| Qué cambia | Dónde |
|---|---|
| Nombre legal, rol, ubicación, redes, desde cuándo programa | `src/config/site.ts` |
| Email y WhatsApp (codificados) | `src/config/contact.ts` |
| Rutas y anclas de sección | `src/config/routes.ts` |
| Claves de localStorage / sessionStorage | `src/config/storage.ts` |
| Proyectos, formación, tecnologías y sus grupos, ventana de código del Hero | `src/data/` |
| Logos de redes y su tamaño | `src/data/socialMarks.ts` (registro en `docs/LOGOS.md`) |
| Textos en español e inglés | `src/i18n/es.ts`, `src/i18n/en.ts` |
| Colores, tipografías, espaciados, radios, duraciones | `src/styles/tokens.css` |

La fecha de nacimiento no está en el repo: se retiró con la edad en el rediseño v2.
