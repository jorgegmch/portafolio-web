# Comandos del Hero

Cinco comandos manuales para cambiar lo que el Hero muestra sin rehacer a mano sus comprobaciones. Este documento dice qué hace cada uno y fija lo que comparten: los requisitos, el protocolo de medición y lo que es normal encontrar al verificar el contacto.

| Comando | Cambia |
|---|---|
| `/update-hero-cv` | Los cuatro PDFs del CV |
| `/update-hero-photo` | El retrato |
| `/update-hero-intro` | El párrafo de presentación |
| `/update-hero-social` | La fila de redes y contacto |
| `/update-hero-badge` | Una de las cinco pastillas |

> **Estado:** los comandos todavía no existen. Se crean uno a uno, cada cual en su commit; hasta entonces este documento describe lo que harán. Esta nota se borra al terminar el último.
>
> La invocación real de las cinco skills (el diálogo de AskUserQuestion y que se descubran al iniciar sesión) se prueba una sola vez al final, tras crear las cinco y reiniciar Claude Code. Lo que falle se arregla en un commit `fix` aparte.

## Lo que comparten

- **Dónde viven:** `.claude/skills/<nombre>/SKILL.md`, con la convención de `pre-push-check`: solo se invocan a mano, y llevan las secciones «Nunca», «Pasos» e «Informe». No hay scripts versionados: cada comando describe los pasos y las herramientas.
- **Ninguno hace commit ni push.** Preparan los cambios, muestran `git diff --stat` y esperan al autor.
- **Ninguno añade dependencias.** Usan lo que ya está instalado: `pdftotext` para los PDFs y Pillow, del Python del sistema, para exportar WebP.
- **Ninguno imprime el teléfono ni el correo,** ni un fragmento de ellos. Cuando comparan un dato con `src/config/contact.ts` lo hacen en memoria y dicen solo «coincide» o «no coincide».
- **Preguntan** con opciones cerradas cuando falta algo o hay más de una lectura posible. No deciden por el autor: si una medida empeora, dan las cifras y ofrecen opciones.
- **Los tests no se debilitan.** Antes de tocar uno, el comando lista cuáles cambian y por qué.
- **La política de una marca se lee en su fuente oficial en el momento de usar el comando.** `docs/LOGOS.md` es un registro, no una autorización.

## Requisitos

- **Playwright MCP.** Los comandos que miden (foto, párrafo, redes y pastilla) lo necesitan. Es una herramienta local y no está versionada: `.mcp.json` y `.playwright-mcp/` van en `.git/info/exclude`. **Si no está disponible, el comando informa «no se pudo comprobar» en cada medida y no da nada por bueno.**
- **`pdftotext` y Pillow** son herramientas de esta máquina, no del repo. Si falta la que el comando necesita, el comando se detiene y lo dice; no la instala ni la sustituye por otra.
- **Archivos de fuera del repo.** Antes de leer nada fuera del repo, el comando avisa de la ruta exacta que va a leer. No copia nada al repo antes de verificarlo.
- **Capturas y trazas:** pueden contener el contacto ya ensamblado. No se commitean.
- **Quién actualiza `docs/LOGOS.md`:** todo comando que añada o cambie un archivo de logo o de icono actualiza su fila (origen, licencia y SHA-256) en el mismo cambio. Hoy son `/update-hero-social` y `/update-hero-badge`.

## Fichas

### `/update-hero-cv`

- **Para qué sirve:** sustituir los cuatro PDFs de `public/cv/` por una versión nueva, sin publicar por error un dato que no deba ir.
- **Qué recibe:** una sola ruta de carpeta, fuera del repo.
- **Qué pregunta:** si falta un PDF o un patrón encuentra más de uno; si un PDF trae «Gomez» sin tilde, o un hallazgo que no es un descarte conocido, pregunta si seguir o detenerse y recomienda detenerse.
- **Qué comprueba:**
  - localiza los cuatro PDFs por las palabras de su nombre, cortado por guion bajo, guion, punto, espacio y paréntesis, sin distinguir mayúsculas: una que empiece por «Infogra» para el infográfico (cubre «Infografico» e «Infographic»), «ATS» para el plano, y «ES» o «EN» para el idioma. Son palabras enteras, no subcadenas; si un nombre lleva las dos versiones, pregunta;
  - ignora los `.docx` y cualquier otro archivo, y dice cuáles ignoró;
  - de cada uno: que empieza por `%PDF-`, su tamaño y su número de páginas;
  - aplica la sección «Revisión de PDFs» de `pre-push-check`, sin duplicarla, con el texto extraído con `pdftotext -enc UTF-8`: todo correo o teléfono debe ser el de `src/config/contact.ts`;
  - busca cédula, fecha de nacimiento, dirección, estado civil y números largos, y revisa los metadatos;
  - que el nombre va con tilde, «Gómez», en el texto y en los metadatos;
  - un PDF sin capa de texto no se da por limpio: «no se pudo comprobar».
- **Qué cambia:** guarda fuera del repo una copia de los PDFs actuales, con sus SHA-256; copia los nuevos a `public/cv/` con los nombres en kebab-case del registro (`src/data/cv.ts`) y compara el SHA-256 de origen y de destino. No copia nada antes de terminar la revisión y de que el autor responda.
- **Qué tests toca:** ninguno. Ejecuta los del registro (`src/data/cv.test.ts`) y los del botón.
- **Qué no hace:** no convierte `.docx`, no edita los PDFs ni sus metadatos, no cambia el registro.
- **Recuerda al autor** que los PDFs quedan descargables por cualquiera una vez publicados, y que la versión anterior sigue en el historial.
- **Prueba real:** PDFs ficticios generados con Python estándar, fuera del repo: uno sin capa de texto, uno con un correo inventado, uno con «Gomez» sin tilde y uno con tilde, que además comprueba que `-enc UTF-8` la conserva. Nada de la prueba se commitea.

### `/update-hero-photo`

- **Para qué sirve:** cambiar el retrato por una fotografía real y dejar al día todo lo que se midió sobre el anterior.
- **Qué recibe:** la ruta de un PNG fuera del repo. Es una fotografía real: el comando no pregunta por ello, y `hero.photoAlt` describe una fotografía.
- **Qué pregunta:** nada, salvo que una comprobación falle o una medida empeore.
- **Qué comprueba:**
  - trabaja sobre una copia y confirma al final que el hash del original no cambió;
  - dimensiones, proporción 4:5, canal alfa y cómo se ve sobre el fondo oscuro;
  - que los WebP salen sin EXIF, sin XMP y sin perfil ICC (Pillow conserva el perfil del PNG si no se vacía a propósito);
  - el protocolo de medición completo, antes y después.
- **Qué cambia:** los cuatro archivos de `src/assets/hero/` (576, 800, 1152 y 1472 px de ancho).
- **Qué tests toca:** `src/components/sections/Hero.badges.test.tsx`: vuelve a medir la silueta y actualiza la constante `SILHOUETTE` y el hash de `portrait-576.webp`. Ese test falla a propósito en cuanto cambia el archivo. `src/assets/hero/portrait.test.ts` ya comprueba las dimensiones, la proporción, la transparencia y que ningún archivo lleva EXIF, XMP ni perfil de color: no se toca, se ejecuta.
- **Qué no hace:** no recorta, no retoca ni quita el fondo; no versiona un script de exportación.
- **Avisa** de que el historial conserva la foto anterior si la rama ya se subió.
- **Prueba real:** un PNG derivado del WebP actual, fuera del repo. Se anota cuánto cambia la silueta y se confirma que el test del hash falla; después se restaura desde la copia y se comprueba que los hashes vuelven a ser los de antes.

### `/update-hero-intro`

- **Para qué sirve:** cambiar el párrafo de presentación en los dos idiomas.
- **Qué recibe:** solo el texto en español.
- **Qué pregunta:** propone un inglés natural, con una o dos líneas sobre las libertades que se tomó, y **espera la aprobación explícita del inglés** antes de escribir nada.
- **Qué comprueba:**
  - `.claude/rules/contenido-veraz.md`: nada de años de experiencia, clientes, métricas ni producción real;
  - que el texto no lleva datos personales;
  - antes y después, en español e inglés: las líneas que ocupa el párrafo, su tamaño por idioma y el equilibrado. Avisa si pasa de cuatro líneas o si algo empeora.
- **Qué cambia:** `hero.intro` en `src/i18n/es.ts` y `src/i18n/en.ts`.
- **Qué tests toca:** la constante `INTRO` de `src/i18n/dictionaries.hero.test.ts`, que fija el texto palabra por palabra.
- **Qué no hace:** no toca la meta description, el rol ni el tamaño del párrafo. Si el texto nuevo pide otro tamaño, lo dice y ofrece opciones.
- **Prueba real:** un texto de prueba, medido y revertido desde la copia.

### `/update-hero-social`

- **Para qué sirve:** añadir una red a la fila o reemplazar una.
- **Qué recibe:** nada; pregunta.
- **Qué pregunta:** si se añade o se reemplaza (quitar, solo si el autor lo pide), qué red y qué enlace.
- **Qué comprueba:**
  - busca el icono en la fuente oficial de la marca; si no puede descargarlo, da el enlace y espera a que el autor lo traiga;
  - lee la política de marca vigente; si no permite el uso, propone un icono genérico;
  - tope de cinco y orden fijo;
  - el comprobador de SVG y los tests de logos;
  - la verificación de `.claude/rules/contacto.md`, con su control positivo;
  - el protocolo de medición, en la parte que afecta a la fila.
- **Qué cambia:** `src/data/social.ts`, los textos en `es.ts` y `en.ts`, el archivo en `public/social/` o `public/icons/`, y su fila en `docs/LOGOS.md`.
- **Qué tests toca:** `src/data/social.test.ts`, `src/data/socialLogos.test.ts` y `src/components/sections/Hero.social.test.tsx`.
- **Qué no hace, y es su garantía:** nunca pide ni acepta un correo o un teléfono. El correo y WhatsApp son entradas de un tipo (`kind`), sin valor: van por `ContactButton` y salen de `src/config/contact.ts`. Si el autor pega uno, el comando se niega a escribirlo y a repetirlo.
- **Prueba real:** añadir una red de prueba y revertirla desde la copia.

### `/update-hero-badge`

- **Para qué sirve:** reemplazar una de las cinco pastillas por otra tecnología.
- **Qué recibe:** nada; pregunta.
- **Qué pregunta:** cuál se reemplaza, por qué tecnología y de dónde sale la etiqueta. Toda etiqueta de stack nueva se justifica citando de dónde sale (`.claude/rules/contenido-veraz.md`), y sale de la descripción de un repo en GitHub (`AGENTS.md`). Una certificación solo cuenta si el autor lo dice. Antes de renombrar cualquier cosa ligada a una posición, pregunta.
- **Qué comprueba:**
  - si la tecnología no está en `src/data/technologies.ts`, propone la entrada;
  - el icono, por este orden: el oficial si la marca lo permite; si hay que descargarlo a mano, el enlace para el autor; si no se permite, candidatos genéricos de licencia CC0, MIT o ISC, con capturas a tamaño real y ampliadas;
  - mide la tinta del icono y propone un factor de compensación, con tope ×1,27 y su test;
  - el comprobador de SVG;
  - el protocolo de medición completo, antes y después.
- **Qué cambia:** el registro de pastillas, el icono, su token de compensación si lo necesita y su fila en `docs/LOGOS.md`. La pastilla nueva conserva la posición y el lado de la que sustituye.
- **Qué tests toca:** `src/data/badgeIcons.test.ts` y los de `Hero.badges.test.tsx` que nombran la pastilla. Los lista antes de tocarlos.
- **Qué pertenece a la posición y qué al icono:**
  - **a la posición,** y lo hereda la pastilla nueva: `--hero-java-right`, el test de la silueta y el hash de la foto (junto a la cabeza), y la altura del 46 % y el lado de la que hoy ocupa PostgreSQL. El comando pregunta si esos nombres pasan a ser neutros; el hash no se toca;
  - **al icono,** y se vuelve a medir: los factores de compensación. Si el token antiguo queda sin uso, pregunta si se retira.
- **Qué no hace:** nunca añade una sexta pastilla; no cambia posiciones; no decide si un límite que empeora es aceptable.
- **Prueba real:** reemplazar una pastilla por una de prueba, medir y revertir desde la copia.

## Protocolo de medición

Lo aplican los comandos que cambian algo visible. No depende de ningún otro documento: **el estado «antes» es el del repo en el momento de invocar el comando, y lo mide el propio comando** antes de cambiar nada. El «después» se mide igual y se compara cifra a cifra.

### Cómo se mide

- Contra la compilación (`npm run build` y la vista previa de Vite), no contra el servidor de desarrollo. El comando usa un puerto propio y no toca el servidor del autor.
- En Chrome, con Playwright MCP. Safari, Firefox y un dispositivo físico no se comprueban: se dice.
- **En español y en inglés.** El idioma se fija a propósito antes de cada medida, porque el navegador lo recuerda de una a otra.
- **En reposo y con la flotación.** Las pastillas suben 8 px al flotar: cada distancia de una pastilla se mide en reposo y en lo más alto.
- **La curva completa, no puntos sueltos:** un barrido de anchos y, en cada breakpoint y en cada tope de tamaño, un píxel a cada lado.

### Anchos y alturas

| Tramo | Ventanas |
|---|---|
| Dos columnas | 1024×768, 1034×768, 1040, 1056, 1072, 1088, 1104, 1152×768, 1280×800, 1281×800, 1440×900 y 1920×1080 |
| Dos columnas, ventana baja | 1024×600, 1034×600, 1152×600, 1280×600, 1281×600 y 1312×600 |
| Apilado | 1023×768, 1023×600, 820, 768×1024, 769, 644, 643 y 481×800 |
| Teléfono | 480×800, 390×844, 381, 380, 360×740 y 320×640 |
| Teléfono en horizontal | 844×390, 740×360, 667×375 y 568×320 |

**La tabla es un mínimo.** Lo que manda es el barrido de anchos, más un píxel a cada lado de cada breakpoint y de cada tope de tamaño.

Donde no se da el alto, vale 768 en dos columnas y 800 en el resto. Los breakpoints son los de `src/styles/tokens.css`.

Los valores sueltos de la tabla (1034, 643 y 644) no son una regla: son los anchos donde hoy cambia algo, con el texto y la foto actuales. Si el barrido encuentra otros, se miden esos y se actualiza la tabla.

### Qué se mide

- **Scroll horizontal:** ninguno, en ningún tamaño.
- **Párrafo:** líneas que ocupa, tamaño de letra y alto del Hero, por idioma.
- **A la barra de navegación:** el pelo de la figura y el saludo.
- **Figura–párrafo:** la distancia mínima entre el texto y la silueta.
- **Cara cortada en la primera pantalla,** apilado y en teléfono: cuántos píxeles de la cara quedan bajo el borde de la ventana.
- **Cada pastilla:** su ancho; su distancia al texto, a la figura, a las otras pastillas, a la barra y al borde de la ventana; y qué parte de su caja tapa la silueta y la franja de la cara.
- **El test de los 20 puntos:** las pastillas del mismo lado distan al menos 20 puntos de alto en todos los tramos (`src/components/sections/Hero.badges.test.tsx`).

### Las dos medidas de «a la figura»

- **Hueco horizontal:** en las filas que ocupa la pastilla, la distancia horizontal entre su caja y el primer píxel opaco de la figura.
- **Píxel opaco más cercano:** la distancia de la caja al píxel opaco más próximo, en cualquier dirección.

**No son comparables entre sí.** La segunda es siempre menor o igual que la primera. Cada cifra dice cuál de las dos es, y un «antes» solo se compara con un «después» de la misma medida.

### Cómo se comparan

El informe va en tres listas, con la ventana, el idioma y las dos cifras de cada caso:

1. **Empeora:** más cerca, más cortado, más líneas o un test que deja de pasar.
2. **Mejora.**
3. **No cambia.**

Una diferencia de menos de 1 px se cuenta como «no cambia». Si algo empeora, el comando no decide: da las cifras y ofrece opciones.

## Comportamiento esperado en la verificación del contacto

Al repetir la verificación de `.claude/rules/contacto.md`, esto es normal y no es una fuga:

- **`wa.me` y `mailto:` aparecen una vez en el JS de `dist/`.** Es lo que exige el control positivo. Buscar esos prefijos esperando cero da un falso fallo.
- **`public/tech/javascript.svg` contiene correos de terceros** dentro de su aviso de licencia MIT. `pre-push-check` los admite por nombre de archivo; no son datos del autor.
- **Ningún test fija el correo de contacto** de `src/config/contact.ts`: los tests comprueban la forma, nunca el valor. El correo cambió en el commit `c35c60b`, con el mismo codificado, y no hubo que tocar ninguno.
