---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "src/test/**"
  - "e2e/**"
---

# Tests

## Entorno

- Todos los tests corren en jsdom. `src/test/setup.ts` limpia el DOM y el Web Storage después de cada uno, así que ningún archivo puede declararse con entorno `node`.
- jsdom no trae `matchMedia` ni `IntersectionObserver`: usa `src/test/mockMatchMedia.ts` y el doble definido en `useRevealOnScroll.test.tsx`.
- Los mocks compartidos viven en `src/test/`.
- Los timers falsos se restauran al terminar.

## Qué probar

- Casos límite reales: valores vacíos, storage bloqueado, medianoche, años bisiestos, cambio de año.
- Los tests de fechas usan una fecha de nacimiento ficticia, no la de `config/`.

## Disciplina

- Ver fallar el test antes de implementar.
- Nunca borrar ni debilitar un test, ni saltarlo con `.skip`, para que pase. Nunca commitear `.only`.
- Los tests buscan por rol y nombre accesible.

## Playwright

- Las capturas y las trazas pueden contener el contacto ya ensamblado: no se commitean.
