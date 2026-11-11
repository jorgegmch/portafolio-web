# Comandos del Hero

Tres comandos manuales para cambiar lo que el Hero muestra sin rehacer a mano sus comprobaciones. Este documento dice qué hace cada uno y fija lo que comparten: los requisitos, el protocolo de medición y lo que es normal encontrar al verificar el contacto.

| Comando | Cambia |
|---|---|
| `/update-hero-cv` | Los cuatro PDFs del CV |
| `/update-hero-photo` | El retrato |
| `/update-hero-intro` | El párrafo de presentación |

**Retirados el 2026-11-11, porque las piezas que cambiaban se fueron con el rediseño v2:** `/update-hero-social` (la fila de redes y contacto del Hero) y `/update-hero-badge` (las cinco pastillas flotantes). El Hero v2.1 ya no tiene ninguna de las dos piezas: las redes van en la escena Contacto y en el pie, y las tecnologías en las seis fichas «// stack principal» y en «Mi stack» de Perfil, todas con datos de `src/data/`. Los dos comandos siguen en el historial de git.

> **Estado:** su invocación real (el diálogo de AskUserQuestion y que se descubran al iniciar sesión) está pendiente de probar, tras reiniciar Claude Code; lo que falle se arregla en un commit `fix` aparte. Esta nota se borra cuando esa prueba esté hecha. El párrafo del Hero se cambió en el rediseño v2.1 siguiendo los pasos de `/update-hero-intro` sin invocarlo, con la autorización del autor (`214f876`).
>
> Lección de las pruebas: cada escenario de prueba se ejecuta con su propio permiso de copia, y los escenarios de parada nunca copian. Una prueba que copia a `public/cv/` o a `src/assets/hero/` se restaura desde la copia de seguridad, y se comprueban los SHA-256 antes de seguir.

## Lo que comparten

- **Dónde viven:** `.claude/skills/<nombre>/SKILL.md`, con la convención de `pre-push-check`: solo se invocan a mano, y llevan las secciones «Nunca», «Pasos» e «Informe». No hay scripts versionados: cada comando describe los pasos y las herramientas.
- **Ninguno hace commit ni push.** Preparan los cambios, muestran `git diff --stat` y esperan al autor.
- **Ninguno añade dependencias.** Usan lo que ya está instalado: `pdftotext` para los PDFs y Pillow, del Python del sistema, para exportar WebP.
- **Ninguno imprime el teléfono ni el correo,** ni un fragmento de ellos. Cuando comparan un dato con `src/config/contact.ts` lo hacen en memoria y dicen solo «coincide» o «no coincide».
- **Preguntan** con opciones cerradas cuando falta algo o hay más de una lectura posible. No deciden por el autor: si una medida empeora, dan las cifras y ofrecen opciones.
- **Los tests no se debilitan.** Antes de tocar uno, el comando lista cuáles cambian y por qué.
- **La política de una marca se lee en su fuente oficial en el momento de usar el comando.** `docs/LOGOS.md` es un registro, no una autorización.

## Requisitos

- **Playwright MCP.** Los comandos que miden (foto y párrafo) lo necesitan. Es una herramienta local y no está versionada: `.mcp.json` y `.playwright-mcp/` van en `.git/info/exclude`. **Si no está disponible, el comando informa «no se pudo comprobar» en cada medida y no da nada por bueno.**
- **`pdftotext` y Pillow** son herramientas de esta máquina, no del repo. Si falta la que el comando necesita, el comando se detiene y lo dice; no la instala ni la sustituye por otra.
- **Archivos de fuera del repo.** Antes de leer nada fuera del repo, el comando avisa de la ruta exacta que va a leer. No copia nada al repo antes de verificarlo.
- **Capturas y trazas:** pueden contener el contacto ya ensamblado. No se commitean.
- **Quién actualiza `docs/LOGOS.md`:** todo cambio que añada o cambie un archivo de logo o de icono actualiza su fila (origen, licencia y SHA-256) en el mismo commit. Ninguno de los tres comandos toca logos.

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
- **Qué pregunta:** cómo recortar si la proporción no es 4:5 (no recorta por su cuenta); si seguir cuando el PNG mide menos de 1472 px de ancho, porque el archivo grande sería un reescalado hacia arriba; y qué hacer con un perfil de color que no sea sRGB. Espera además la aprobación de la comparación de pesos antes de reemplazar.
- **Qué comprueba:**
  - trabaja sobre una copia y confirma al final que el hash del original no cambió;
  - dimensiones, proporción 4:5 y canal alfa; qué metadatos trae el PNG (por ejemplo, un EXIF con la ubicación), sin imprimir su valor;
  - que el fondo es de verdad transparente, sin franja clara en el borde, con capturas sobre el fondo oscuro;
  - los parámetros de exportación no se dan por sabidos: lee los cuatro WebP actuales y propone la calidad que da un peso comparable;
  - que los WebP salen sin EXIF, sin XMP y sin perfil ICC, leyendo sus fragmentos RIFF. La exportación vacía los metadatos a propósito;
  - el protocolo de medición completo, antes y después.
- **Qué cambia:** los cuatro archivos de `src/assets/hero/` (576, 800, 1152 y 1472 px de ancho), tras guardar fuera del repo una copia de los actuales con sus SHA-256.
- **Qué tests toca:** ninguno. `src/assets/hero/portrait.test.ts` ya comprueba las dimensiones, la proporción, la transparencia y que ningún archivo lleva EXIF, XMP ni perfil de color, y `src/components/sections/Hero.portrait.test.tsx`, cómo se carga: se ejecutan, no se tocan. El test de la silueta (`Hero.badges.test.tsx`) se retiró con las pastillas en el rediseño v2.
- **Qué depende de la foto:** el lema y su velo van al pie de la foto, y el nombre detrás. El comando mide con el protocolo si el lema sigue leyéndose sobre el velo y si la cara queda tapada por el lema o cortada en la primera pantalla; si algo empeora, da las cifras y ofrece opciones.
- **Qué no hace:** no recorta, no retoca ni quita el fondo; no mueve el lema ni los paneles; no cambia `hero.photoAlt`; no versiona un script de exportación.
- **Avisa** de que el historial conserva la foto anterior si la rama ya se subió, y de que la rama se sube con la foto provisional.
- **Prueba real:** un PNG derivado del WebP actual, fuera del repo. Se mide con el protocolo; después se restaura desde la copia y se comprueba que los hashes vuelven a ser los de antes.

### `/update-hero-intro`

- **Para qué sirve:** cambiar el párrafo de presentación en los dos idiomas.
- **Qué recibe:** solo el texto en español. Invocar el comando aprueba ese español; el inglés lo aprueba el autor aparte.
- **Qué pregunta:** propone un inglés nativo y natural, no literal, con una o dos líneas sobre las libertades que se tomó, y **espera la aprobación explícita del inglés** antes de escribir nada. Si el autor no lo aprueba, no escribe ninguna versión por su cuenta. Pregunta también de dónde sale lo que no tenga respaldo.
- **Qué comprueba:**
  - quién usa hoy la clave `hero.intro`; si la usa alguien más que el Hero y sus tests, no cambia ese uso sin preguntar;
  - `.claude/rules/contenido-veraz.md`: nada de años de experiencia, clientes, métricas ni producción real, y cada tecnología nombrada debe estar en `src/data/technologies.ts` o en la descripción de un repo. Lo que no tiene respaldo no lo corrige: lo señala;
  - que el texto no lleva datos personales; si los lleva, se detiene sin imprimirlos;
  - tras escribir, desde disco: sin «Ã», sin CR, sin caracteres de control, y con las tildes, la «ñ» y las comillas intactas;
  - antes y después, en español e inglés: las líneas que ocupa el párrafo, su tamaño por idioma, el alto del Hero, y si el párrafo pisa el apellido, el lema o los paneles laterales (protocolo de medición). Avisa con cifras si pasa de cuatro líneas en algún ancho o si algo empeora, y ofrece opciones sin decidir: acortar, ancho o tamaño;
  - si la descripción del documento dejó de coincidir con el párrafo. La informa; no la toca.
- **Qué cambia:** `hero.intro` en `src/i18n/es.ts` y `src/i18n/en.ts`, con la herramienta de edición, tras guardar fuera del repo una copia de los tres archivos con sus SHA-256.
- **Qué tests toca:** la constante `INTRO` de `src/i18n/dictionaries.hero.test.ts`, que fija el texto palabra por palabra.
- **Qué no hace:** no toca la descripción del documento, el rol ni los tokens de tamaño; no retoca el español recibido. Si el texto nuevo pide otro tamaño, lo dice con cifras y ofrece opciones.
- **Prueba real:** un texto de prueba, medido y revertido desde la copia.

## Protocolo de medición

Lo aplican los comandos que cambian algo visible. No depende de ningún otro documento: **el estado «antes» es el del repo en el momento de invocar el comando, y lo mide el propio comando** antes de cambiar nada. El «después» se mide igual y se compara cifra a cifra.

### Cómo se mide

- Contra la compilación (`npm run build` y la vista previa de Vite), no contra el servidor de desarrollo. El comando usa un puerto propio y no toca el servidor del autor.
- En Chrome, con Playwright MCP. Safari, Firefox y un dispositivo físico no se comprueban: se dice.
- **En español y en inglés.** El idioma se fija a propósito antes de cada medida, porque el navegador lo recuerda de una a otra.
- **La curva completa, no puntos sueltos:** un barrido de anchos y, en cada breakpoint y en cada tope de tamaño, un píxel a cada lado.
- **Las letras, no las cajas:** los `span` del nombre van a todo el ancho; lo que choca se mide con la caja de las letras (un `Range` del texto). Esa caja incluye el descendente de Anton, así que un solape pequeño con el apellido se confirma en una captura antes de darlo por choque.

### Anchos y alturas

| Tramo | Ventanas |
|---|---|
| Dos columnas, con paneles laterales (desde 1281 px) | 1281×800, 1281×720, 1290×800, 1312×800, 1366×768, 1440×900, 1520×900, 1600×900 y 1920×1080 |
| Apilado (hasta 1280 px) | 1280×800, 1279×800, 1152×768, 1104, 1056, 1024×768, 1023×768, 900×1000, 768×1024 y 644×900 |
| Teléfono | 481×800, 480×800, 390×844, 360×740 y 320×640 |

**La tabla es un mínimo.** Lo que manda es el barrido de anchos, más un píxel a cada lado de cada breakpoint y de cada tope de tamaño. Los breakpoints son los de `src/styles/tokens.css`; el Hero pasa de dos columnas a apilado en 1280 px.

### Qué se mide

- **Scroll horizontal:** ninguno, en ningún tamaño.
- **Párrafo:** líneas que ocupa, tamaño de letra y alto del Hero, por idioma.
- **El nombre:** su tamaño (`clamp(120px, 17.5vw, 252px)`, 112 en teléfono) y si el párrafo o el rol lo pisan.
- **El lema:** sus líneas, y que no choca con el apellido, con los bloques laterales ni con la cinta.
- **Paneles laterales (desde 1281 px):** que no chocan con el nombre ni con los bloques, entre 1281 y 1600 px como mínimo.
- **Cara cortada en la primera pantalla,** apilado y en teléfono: cuántos píxeles de la cara quedan bajo el borde de la ventana o bajo el lema.

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
- **La búsqueda del dominio del correo da una coincidencia,** en `public/tech/javascript.svg` y en su copia de `dist/`: uno de esos correos de terceros usa el mismo proveedor de correo que el autor. El correo completo, su parte local y el número siguen dando cero.
- **Ningún test fija el correo de contacto** de `src/config/contact.ts`: los tests comprueban la forma, nunca el valor. El correo cambió en el commit `c35c60b`, con el mismo codificado, y no hubo que tocar ninguno.
