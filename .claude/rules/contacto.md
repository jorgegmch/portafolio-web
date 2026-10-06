---
paths:
  - "src/config/contact.ts"
  - "src/lib/assembleContact*"
  - "src/components/ui/ContactButton*"
  - "src/components/sections/Contact*"
---

# Contacto ofuscado

El email y el WhatsApp no pueden aparecer como texto literal en ningún archivo del repo, ni en el bundle, ni en el DOM antes de que el visitante interactúe. Es ofuscación contra scrapers simples, no protección real.

## Archivos implicados

- `src/config/contact.ts` guarda los datos como códigos de carácter desplazados.
- `src/lib/assembleContact.ts` los reconstruye.
- `ContactButton` es la única vía para mostrarlos o abrirlos.

## Reglas

- El contacto solo se ensambla dentro del manejador del clic. Nunca en el render, ni en efectos de montaje, ni en atributos iniciales (`href`, `data-*`, `aria-*`).
- Es un botón, no un enlace: un `href` inicial expondría el dato.
- El correo puede mostrarse como texto solo después del clic. El número de WhatsApp no entra nunca al DOM.

## Tests

- Comprueban la forma del resultado, nunca el valor.
- El valor esperado se obtiene de `assembleContact`; jamás se escribe en el test.
- Cubren: antes del clic el dato no está en el DOM, después del clic se abre el enlace correcto, y el botón se opera con teclado.

## Verificación con grep sobre `dist/`

Repítela cada vez que toques esta parte:

1. Construye con el contacto montado en la aplicación.
2. Control positivo: confirma que el código del contacto sí está en `dist/` (los códigos, `wa.me`, `mailto:`). Sin esto, la búsqueda pasa sin probar nada.
3. Busca el correo completo, su parte local, su dominio y el número con y sin indicativo, con guiones y con espacios. Debe haber cero coincidencias en `dist/` y cero con `git grep` en los archivos versionados.
4. Pasa las cadenas por línea de comandos; no las guardes en ningún archivo.
5. Si montaste algo solo para la prueba, confirma con `git status` que quedó revertido.
