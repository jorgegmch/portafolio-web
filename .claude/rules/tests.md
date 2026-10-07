# Tests

## Entorno

- Todos los tests corren en jsdom. `src/test/setup.ts` limpia el DOM y el Web Storage después de cada uno, así que ningún archivo puede declararse con entorno `node`.
- jsdom no trae `matchMedia` ni `IntersectionObserver`: usa `src/test/mockMatchMedia.ts` y el doble definido en `useRevealOnScroll.test.tsx`.
- Los mocks compartidos viven en `src/test/`.
- Los timers falsos se restauran al terminar.
- `user-event` no se usa con timers falsos: se cuelga. Esos casos usan el reloj real o `fireEvent`.
- Un test que lee el texto de un CSS no ve la cascada: lo que dependa de la especificidad o del orden de carga se comprueba en el navegador.

## Qué probar

- Casos límite reales: valores vacíos, storage bloqueado, medianoche, años bisiestos, cambio de año.
- Los tests de fechas usan una fecha de nacimiento ficticia, no la de `config/`.

## Disciplina

- Ver fallar el test antes de implementar.
- Nunca borrar ni debilitar un test, ni saltarlo con `.skip`, para que pase. Nunca commitear `.only`.
- Los tests buscan por rol y nombre accesible.

## Playwright

- Las capturas y las trazas pueden contener el contacto ya ensamblado: no se commitean.
