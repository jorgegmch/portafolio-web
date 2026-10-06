---
paths:
  - "src/components/**"
  - "src/pages/**"
  - "src/hooks/**"
  - "src/lib/**"
---

# Convenciones de código

## Reparto de responsabilidades

- `components/ui` es presentacional: recibe textos y datos por props y no llama a `useLang`. Lo llaman las secciones y las páginas.
- Sin lógica de negocio en componentes: cálculos y formatos en `lib/`, efectos y suscripciones en `hooks/`.
- Todo listener, observer y timer se limpia al desmontar.

## TypeScript

- Sin `any` ni `as` para callar errores. `as const` está permitido.
- `@ts-expect-error` solo con un comentario que lo justifique.

## Nombres e idioma

- Identificadores en inglés; comentarios y nombres de tests en español.
- Un componente por archivo, con el mismo nombre en PascalCase; hooks como `useX`.

## Texto, storage y enlaces

- El texto visible nunca va literal en JSX: siempre sale del diccionario.
- Web Storage solo mediante `safeStorage` y las claves de `config/storage.ts`.
- Todo enlace con `target="_blank"` lleva `rel="noopener noreferrer"`.
