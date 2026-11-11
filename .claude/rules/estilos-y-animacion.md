# Estilos y animación

## Tamaños de pantalla

- Diseño pensado primero para escritorio y adaptado a todos los tamaños: base de escritorio y `@media (max-width)` hacia abajo.
- Revisar en 1920, 1440, 1280, 1024 (iPad en horizontal o laptop pequeña), 768 (iPad en vertical) y 360 px (teléfono).
- El contenido tiene un ancho máximo, para que no se estire en pantallas muy anchas.
- Ninguna vista tiene scroll horizontal ni elementos cortados.

## Tokens y CSS

- Colores, tipografías, espaciados, radios, duraciones y easing salen de variables de `tokens.css`. Cero hex ni valores mágicos en componentes; `0`, `1px` y los porcentajes no necesitan variable.
- Los breakpoints de `@media` se escriben literales, porque CSS no admite variables ahí. Se usan solo los definidos como comentario en `tokens.css` (Fase 4).
- CSS Modules por componente, junto a su `.tsx`. Estilos globales solo en `tokens.css` y `global.css`.
- Un solo tema (oscuro).
- Estilos inline solo para valores dinámicos (por ejemplo, el punto de fijado de cada panel de la cortina o la posición de cada tarjeta en la pila de Proyectos).
- Voz de código (spec v2.1 §2): el color Code va en sintaxis, cursores, rótulos tipo `funcion()`, el guion bajo del logo y el punto de «Disponible»; nunca en botones, fondos, bordes de acción ni títulos. Signal es la voz de acción.

## Animación

- Animar solo `transform` y `opacity`; nunca `width`, `height`, `top` ni `left`.
- Toda animación respeta `prefers-reduced-motion`, con CSS o con `useReducedMotion`.
- Ninguna librería de animación o de UI sin aprobación del autor.
- Pausa global (WCAG 2.2.2, spec §3.7): el botón de pausa de la barra pone `data-motion="paused"` y `global.css` detiene toda animación. Lo que mueve el scroll del visitante o entra una sola vez (la cortina, la pila de Proyectos, la entrada de la barra fija) lleva su excepción con `animation-play-state: running !important`: congelado a medias quedaría invisible o tapado.
