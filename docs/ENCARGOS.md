# Encargos aprobados

Encargos del autor, aprobados y sin ejecutar. El texto es literal; la nota inicial de cada uno dice a qué fase de `docs/PLAN.md` corresponde. Ninguno se ejecuta sin que el autor lo pida.

El encargo 1 (Hero) ya está hecho: su texto queda en el historial de `docs/PLAN.md`, en el commit `b1d9f75`.

### Encargo 2 — Transición de idioma

(en PLAN.md correspondía a la Fase 7, cuya página de certificaciones retiró el rediseño v2; el encargo sigue aprobado, sin fase asignada)

> Commit propio: feat(i18n): add language switch transition. Al cambiar de idioma, Navbar, main y Footer se apagan (opacidad a 0) y vuelven, en 1 s en total: unos 450 ms de salida, el cambio de idioma exactamente en el punto oscuro (el atributo lang de html se actualiza ahí), y unos 450 ms de entrada. El canvas de partículas y el skip link quedan fuera del efecto. Duraciones como constantes nombradas o tokens, sin números sueltos. Con prefers-reduced-motion el cambio es instantáneo, sin animación. Un solo ciclo, sin parpadeos. El foco debe quedarse en el botón del selector. Si el usuario elige otro idioma durante la transición, dime qué harías antes de implementar y espera mi respuesta. Los tests del LangSwitcher y LangProvider que asuman cambio síncrono tendrán que actualizarse: lista cuáles y por qué antes de tocarlos. Tests con temporizadores falsos, rojo real y mutación de control en el momento del cambio de idioma. Confirma sin Ã ni CR desde disco. Después: git show --stat HEAD y espera mi aprobación. Sin push.

### Encargo 3 — Cursor glitch

(en PLAN.md no corresponde a ninguna fase: trabajo aparte, después del Hero)

> Nuevo trabajo: cursor personalizado con estilo glitch, en commits propios, después de la transición de idioma. Antes de escribir código, propón por escrito y espera mi respuesta: 1) la división en commits (lógica de tiempos pura con aleatoriedad inyectable, componente con su CSS Module, y montaje en Layout, o la que veas mejor), 2) la forma del cursor (no una flecha estándar; ofrece dos o tres opciones simples dibujadas con CSS o SVG), 3) el segundo color: busca primero en tokens.css si ya existe uno que encaje; si no, propón un valor y no añadas nada sin mi aprobación, 4) los intervalos: ráfaga de unos 150 ms cada cierto tiempo aleatorio entre un mínimo y un máximo largos (propón valores, por ejemplo entre 6 y 14 s), más una ráfaga corta al pasar sobre enlaces y botones; todo como constantes nombradas, sin números sueltos. Requisitos: el cursor del sistema solo se oculta cuando el nuestro ya está montado y solo con (hover: hover) y (pointer: fine); sin render en táctil; oculto hasta el primer pointermove y al salir el puntero de la ventana; sin bucle propio en reposo (la posición se actualiza solo cuando hay movimiento) y el glitch por clases CSS; con prefers-reduced-motion sin ráfagas ni retardo, solo la forma estática; capa por encima de todo con un token z-index (créalo si no existe) y pointer-events: none; el punto de clic debe coincidir exactamente con la posición real del puntero. Reutiliza useMediaQuery y useReducedMotion. Tests en rojo real y mutación de control en cada commit; la suite existente debe seguir verde sin tocar sus tests. Muéstrame los archivos completos y confirma sin Ã ni CR desde disco. Sin push.
