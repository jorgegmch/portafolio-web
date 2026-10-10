# Contacto

El email y el teléfono no pueden aparecer como texto literal en ningún archivo de texto del repo ni en el bundle. Se publican en claro solo en la sección de contacto y en el contenido de los PDFs del CV. Es ofuscación del código fuente contra scrapers simples, no protección real: quien ejecute la página los lee.

## Archivos implicados

- `src/config/contact.ts` guarda los datos como códigos de carácter desplazados.
- `src/lib/assembleContact.ts` los reconstruye.
- La sección de contacto es el único componente que los decodifica al renderizar.
- `ContactButton` es la única vía para abrirlos, y la única para mostrarlos fuera de esa sección.

## Reglas

- En la sección de contacto, el correo y el teléfono se muestran como texto desde el render. No van en atributos (`href`, `data-*`, `aria-*`): las acciones de escribir o abrir WhatsApp siguen en `ContactButton`.
- Fuera de esa sección, el contacto solo se ensambla dentro del manejador del clic: nunca en el render, ni en efectos de montaje, ni en atributos iniciales.
- `ContactButton` es un botón, no un enlace. Fuera de la sección de contacto, el correo se muestra solo después del clic y el teléfono no entra al DOM.
- La fecha de nacimiento se decodifica al renderizar porque se muestra la edad; al DOM solo debe llegar la edad, nunca la fecha.

## Tests

- Comprueban la forma del resultado, nunca el valor.
- El valor esperado se obtiene de `assembleContact`; jamás se escribe en el test.
- `ContactButton`: antes del clic el dato no está en el DOM, después del clic se abre el enlace correcto, y el botón se opera con teclado.
- Sección de contacto: el correo y el teléfono se ven como texto, ningún atributo los contiene, y fuera de ella (Hero, pie) siguen ausentes del DOM antes del clic.
- Con la sección de contacto se añade un test que recorre los archivos de texto de `src/` y comprueba que ninguno contiene el correo, su parte local completa (nunca un prefijo) ni el teléfono, obtenidos de `assembleContact`.

## Verificación con grep

Repítela cada vez que toques esta parte:

1. Construye con el contacto montado en la aplicación.
2. Control positivo: confirma que el código del contacto sí está en `dist/` (los códigos, `wa.me`, `mailto:`). Sin esto, la búsqueda pasa sin probar nada.
3. Busca el correo completo, su parte local, su dominio y el número con y sin indicativo, con guiones y con espacios. Debe haber cero coincidencias en `dist/`, sin contar los PDFs del CV, y cero con `git grep -I` en los archivos versionados. El dato se decodifica en el navegador, así que el bundle sigue sin tenerlo; si algún día se prerenderiza el HTML, esta regla se revisa antes.
4. Pasa las cadenas por línea de comandos; no las guardes en ningún archivo.
5. Si montaste algo solo para la prueba, confirma con `git status` que quedó revertido.
6. PDFs del CV: extrae su texto y comprueba que todo correo o teléfono que contengan es el de `src/config/contact.ts`, y que no llevan cédula ni fecha de nacimiento, tampoco en los metadatos. Un PDF sin capa de texto no se da por limpio.
