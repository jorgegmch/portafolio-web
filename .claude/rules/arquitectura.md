# Arquitectura

## Capas

Un módulo solo importa de su propia capa o de las inferiores:

    config · data · i18n · lib  <-  hooks  <-  components/ui  <-  components/layout · components/sections  <-  pages  <-  App

- Los límites se hacen cumplir con `no-restricted-imports` en `eslint.config.js`. No añadas `eslint-plugin-boundaries`: arrastra vulnerabilidades altas.
- Prohibido importar de carpetas padre (`../`): usa el alias `@/`, que apunta a `src/`.
- Toda carpeta nueva bajo `src/` se añade a su capa en `eslint.config.js`.

## Estructura y texto van separados

- `src/data/` guarda solo lo que no se traduce: ids, fechas, nombres propios, etiquetas de stack.
- `src/i18n/es.ts` y `en.ts` guardan los textos, indexados por esos ids.
- Los tipos de id se derivan de los arreglos `as const` de `data/`, y `Dictionary` los exige con `Record<ProjectId, …>` y `Record<CertificationId, …>`. No relajes esos tipos: son los que impiden que falte un texto en un idioma.
- Añadir un proyecto o una certificación = una entrada en `data/` + una en cada diccionario.

## Una fuente de verdad por dato

- Los conteos y las listas derivadas salen de `data/` (`projects.length`, `featuredProjects`, `primaryStack`); nunca se escriben a mano.
- Los datos personales y las claves de storage viven solo en `src/config/`.

| Qué cambia | Dónde |
|---|---|
| Nombre legal, rol, ubicación, redes | `src/config/site.ts` |
| Fecha de nacimiento (codificada, con su propio desplazamiento) | `src/config/site.ts` (`birthDateCodes`, `BIRTH_DATE_OFFSET`) |
| Email y WhatsApp (codificados) | `src/config/contact.ts` |
| Rutas y anclas de sección | `src/config/routes.ts` |
| Claves de localStorage / sessionStorage | `src/config/storage.ts` |
| Proyectos, certificaciones, tecnologías | `src/data/` |
| Textos en español e inglés | `src/i18n/es.ts`, `src/i18n/en.ts` |
| Colores, tipografías, espaciados | `src/styles/tokens.css` (Fase 4, aún no existe) |
