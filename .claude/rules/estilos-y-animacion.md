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
- Estilos inline solo para valores dinámicos (por ejemplo, la posición del mouse).

## Animación

- Animar solo `transform` y `opacity`; nunca `width`, `height`, `top` ni `left`.
- Toda animación respeta `prefers-reduced-motion`, con CSS o con `useReducedMotion`.
- Ninguna librería de animación o de UI sin aprobación del autor.

## Canvas de partículas

- `requestAnimationFrame` con limpieza al desmontar.
- Pausa con la pestaña oculta.
- Cantidad de partículas según el tamaño de pantalla.
- `devicePixelRatio` con tope.
- Sin crear objetos en cada frame.
- Con `prefers-reduced-motion` el canvas se dibuja estático, sin animación.
- En dispositivos táctiles (`(hover: none)`) pasa a modo reducido: pocas partículas y movimiento propio suave, sin depender del mouse.
