# Contacto

El email y el teléfono no pueden aparecer como texto literal en ningún archivo de texto del repo ni en el bundle, ni como texto en la página. Se publican en claro solo en el contenido de los PDFs del CV. Es ofuscación del código fuente contra scrapers simples, no protección real: quien ejecute la página los obtiene.

## Archivos implicados

- `src/config/contact.ts` guarda los datos como códigos de carácter desplazados.
- `src/lib/assembleContact.ts` los reconstruye.
- `ContactButton` es el único componente que los usa, y solo dentro del clic: «Copiar correo» lleva el correo al portapapeles sin escribirlo en la página, y WhatsApp abre el chat de `wa.me` en una pestaña nueva.
- Desde el rediseño v2, `ContactButton` solo está en la escena Contacto: en los canales y en el aviso de error del formulario. El Hero y el pie no llevan contacto.

## Reglas

- El contacto solo se ensambla dentro del manejador del clic: nunca en el render, ni en efectos de montaje, ni en atributos iniciales (`href`, `data-*`, `aria-*`).
- `ContactButton` es un botón, no un enlace. Ni el correo ni el teléfono entran al DOM, tampoco después del clic: el aviso de «Copiar correo» dice que se copió, sin escribirlo.
- El formulario de contacto no lleva el correo de destino: su adaptador no envía nada (`docs/FORMULARIO-CONTACTO.md`).
- La fecha de nacimiento no está en el repo ni en el sitio: se retiró con la edad en el rediseño v2.

## Tests

- Comprueban la forma del resultado, nunca el valor.
- El valor esperado se obtiene de `assembleContact`; jamás se escribe en el test.
- `ContactButton`: antes del clic el dato no está en el DOM, después del clic se abre el enlace correcto o se copia sin escribirlo, y el botón se opera con teclado.
- Escena Contacto: antes y después de interactuar, ni el correo ni el número están en la página, ni en texto ni en atributos.
- Un test recorre los archivos de texto de `src/` y comprueba que ninguno contiene el correo, su parte local completa (nunca un prefijo) ni el teléfono, obtenidos de `assembleContact`.

## Verificación con grep

Repítela cada vez que toques esta parte:

1. Construye con el contacto montado en la aplicación.
2. Control positivo: confirma que el código del contacto sí está en `dist/` (los códigos, `wa.me`, `mailto:`). Sin esto, la búsqueda pasa sin probar nada.
3. Busca el correo completo, su parte local, su dominio y el número con y sin indicativo, con guiones y con espacios. Debe haber cero coincidencias en `dist/`, sin contar los PDFs del CV, y cero con `git grep -I` en los archivos versionados. El dato se decodifica en el navegador, así que el bundle sigue sin tenerlo; si algún día se prerenderiza el HTML, esta regla se revisa antes.
   - Única excepción, solo por nombre de archivo: el dominio del correo coincide una vez en `public/tech/javascript.svg` y una vez en su copia, `dist/tech/javascript.svg`. Uno de los correos de terceros del aviso de la licencia MIT de ese logo usa el mismo proveedor de correo. Esas dos coincidencias no cuentan.
   - La excepción cubre solo el dominio y solo esos dos archivos. El correo completo, su parte local y el número deben dar cero también ahí. El dominio en cualquier otro archivo, o más de una vez en esos dos, es un fallo.
   - El control positivo del paso 2 sigue siendo obligatorio: sin él, un cero no prueba nada.
4. Pasa las cadenas por línea de comandos; no las guardes en ningún archivo.
5. Si montaste algo solo para la prueba, confirma con `git status` que quedó revertido.
6. PDFs del CV: extrae su texto y comprueba que todo correo o teléfono que contengan es el de `src/config/contact.ts`, y que no llevan cédula ni fecha de nacimiento, tampoco en los metadatos. Un PDF sin capa de texto no se da por limpio.
