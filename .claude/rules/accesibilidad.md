---
paths:
  - "src/components/**"
  - "src/pages/**"
  - "**/*.css"
---

# Accesibilidad

## Estructura

- HTML semántico: `header`, `nav`, `main`, `section`, `footer`.
- Un solo `h1`, y títulos sin saltar niveles.
- `button` para acciones, `a` para navegación.
- Skip-link al principio, y `<html lang>` sincronizado con el idioma.

## Teclado y foco

- Todo lo interactivo se alcanza y se opera con teclado.
- El foco siempre es visible: nunca `outline: none` sin reemplazo.
- Menús desplegables (selector de idioma, descarga de CV): Enter o Espacio abren, Escape cierra y devuelve el foco al botón.
- El botón que abre un menú lleva `aria-expanded`.

## Textos alternativos y anuncios

- Los textos de `aria-label` y `alt` viven en los diccionarios.
- Las imágenes decorativas llevan `alt=""`.
- El contenido que aparece tras una acción (por ejemplo, el correo tras el clic) se anuncia con `role="status"` o `aria-live="polite"`.

## Contraste

- AA como mínimo: 4.5:1 en texto normal, 3:1 en texto grande.
- Comprobar los pares de colores de `tokens.css`.
