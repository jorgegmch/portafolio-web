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
- **Qué pregunta:** cómo recortar si la proporción no es 4:5 (no recorta por su cuenta); si seguir cuando el PNG mide menos de 1472 px de ancho, porque el archivo grande sería un reescalado hacia arriba; y qué hacer con un perfil de color que no sea sRGB. Espera además la aprobación de la comparación de pesos antes de reemplazar.
- **Qué comprueba:**
  - trabaja sobre una copia y confirma al final que el hash del original no cambió;
  - dimensiones, proporción 4:5 y canal alfa; qué metadatos trae el PNG (por ejemplo, un EXIF con la ubicación), sin imprimir su valor;
  - que el fondo es de verdad transparente, sin franja clara en el borde, con capturas sobre el fondo oscuro;
  - los parámetros de exportación no se dan por sabidos: lee los cuatro WebP actuales y propone la calidad que da un peso comparable;
  - que los WebP salen sin EXIF, sin XMP y sin perfil ICC, leyendo sus fragmentos RIFF. La exportación vacía los metadatos a propósito;
  - el protocolo de medición completo, antes y después.
- **Qué cambia:** los cuatro archivos de `src/assets/hero/` (576, 800, 1152 y 1472 px de ancho), tras guardar fuera del repo una copia de los actuales con sus SHA-256.
- **Qué tests toca:** `src/components/sections/Hero.badges.test.tsx`: vuelve a medir la silueta y actualiza solo `left` y `sha256` de la constante `SILHOUETTE`. Ese test falla a propósito en cuanto cambia el archivo. `src/assets/hero/portrait.test.ts` ya comprueba las dimensiones, la proporción, la transparencia y que ningún archivo lleva EXIF, XMP ni perfil de color: no se toca, se ejecuta.
- **Qué depende de la foto, además de la silueta:** la franja de la cara (del 14 % al 45 % del alto, que los tests dan por hecha) y los porcentajes de las pastillas. El comando mide dónde quedan sobre la foto nueva; si una pastilla pasa a tapar la cara, a tocar la silueta o a incumplir los 20 puntos, no la mueve: da las cifras y ofrece opciones.
- **Margen de Java:** informa, antes y después, de los puntos porcentuales que hay entre el borde derecho de la pastilla de Java y la silueta; si es negativo, Java queda dentro de la silueta. No es lo mismo que el hueco horizontal a la figura, que va en píxeles: cada cifra dice cuál de las dos es.
- **Qué no hace:** no recorta, no retoca ni quita el fondo; no mueve pastillas; no cambia `hero.photoAlt`; no versiona un script de exportación.
- **Avisa** de que el historial conserva la foto anterior si la rama ya se subió, y de que la rama se sube con la foto provisional.
- **Prueba real:** un PNG derivado del WebP actual, fuera del repo. Se anota cuánto cambia la silueta y se confirma que el test del hash falla; después se restaura desde la copia y se comprueba que los hashes vuelven a ser los de antes.

### `/update-hero-intro`

- **Para qué sirve:** cambiar el párrafo de presentación en los dos idiomas.
- **Qué recibe:** solo el texto en español. Invocar el comando aprueba ese español; el inglés lo aprueba el autor aparte.
- **Qué pregunta:** propone un inglés nativo y natural, no literal, con una o dos líneas sobre las libertades que se tomó, y **espera la aprobación explícita del inglés** antes de escribir nada. Si el autor no lo aprueba, no escribe ninguna versión por su cuenta. Pregunta también de dónde sale lo que no tenga respaldo.
- **Qué comprueba:**
  - quién usa hoy la clave `hero.intro`; si la usa alguien más que el Hero y sus tests, no cambia ese uso sin preguntar;
  - `.claude/rules/contenido-veraz.md`: nada de años de experiencia, clientes, métricas ni producción real, y cada tecnología nombrada debe estar en `src/data/technologies.ts` o en la descripción de un repo. Lo que no tiene respaldo no lo corrige: lo señala;
  - que el texto no lleva datos personales; si los lleva, se detiene sin imprimirlos;
  - tras escribir, desde disco: sin «Ã», sin CR, sin caracteres de control, y con las tildes, la «ñ» y las comillas intactas;
  - antes y después, en español e inglés: las líneas que ocupa el párrafo, su tamaño por idioma, el equilibrado, el alto del Hero, el pelo a la barra, figura–párrafo, Python al texto, las distancias de Java y la cara cortada. Avisa con cifras si pasa de cuatro líneas en algún ancho o si algo empeora, y ofrece opciones sin decidir: acortar, ancho o tamaño;
  - si la descripción del documento dejó de coincidir con el párrafo. La informa; no la toca.
- **Qué cambia:** `hero.intro` en `src/i18n/es.ts` y `src/i18n/en.ts`, con la herramienta de edición, tras guardar fuera del repo una copia de los tres archivos con sus SHA-256.
- **Qué tests toca:** la constante `INTRO` de `src/i18n/dictionaries.hero.test.ts`, que fija el texto palabra por palabra.
- **Qué no hace:** no toca la descripción del documento, el rol ni los tokens de tamaño; no retoca el español recibido. Si el texto nuevo pide otro tamaño, lo dice con cifras y ofrece opciones.
- **Prueba real:** un texto de prueba, medido y revertido desde la copia.

### `/update-hero-social`

- **Para qué sirve:** añadir una red a la fila, reemplazar una o cambiar su icono.
- **Qué recibe:** nada; pregunta.
- **Qué pregunta:** si se añade o se reemplaza (quitar, solo si el autor lo pide); si es reemplazar, cuál y si entera o solo el icono; el nombre de la red y el enlace de su perfil. El pie de página se pregunta cada vez, antes de tocarlo.
- **Cómo es el registro** (`src/data/social.ts`): cada entrada tiene cuatro campos, `id`, `kind`, `icon` y `brand`, y ninguna guarda una URL ni un dato de contacto. Las de enlace toman su URL de `site.social`, en `src/config/site.ts`, la misma del pie; un test exige que toda red con enlace del Hero esté también en el pie. El tope es `HERO_SOCIAL_LIMIT`.
- **Qué comprueba:**
  - primero la política de marca vigente, leída ese día en su fuente oficial; no se fía de `docs/LOGOS.md`. Si no permite el uso, propone un icono genérico, propio o de licencia CC0, MIT o ISC, con candidatos y capturas;
  - si la política se leyó con una herramienta que devuelve un resumen y no el texto literal, lo dice, cita solo lo que vio palabra por palabra y no da por seguro que la marca permite el logo. Antes de usar un logo de marca, el autor abre el enlace y lo confirma;
  - después busca el logo en esa fuente. Avisa de la URL exacta antes de descargar y lo guarda fuera del repo; si no puede, da el enlace y espera a que el autor lo traiga;
  - el tope y el orden: los enlaces primero, después el correo y WhatsApp, y la red nueva al final de los enlaces; pregunta si el autor quiere otro orden;
  - el comprobador de SVG antes de copiar el archivo. Si lo bloquea, lo dice y no relaja el comprobador sin preguntar;
  - la verificación de `.claude/rules/contacto.md`, con su control positivo;
  - el protocolo de medición, en la parte que afecta a la fila, con 320 px de ancho incluido: es donde antes se parte.
- **Dato medido, 11 de octubre de 2026:** con cinco controles la fila mide 268 px, y a 320 px de ancho caben 267, así que se parte en dos filas: el Hero pasa de 863 a 919 px y la cara cortada, de 112 a 168 px, en español. El tope se queda en 5; el comando mide a 320 px y avisa con cifras, sin decidir.
- **Qué cambia:** `src/data/social.ts`; la URL en `site.social` y, con confirmación, la lista del pie (`src/config/site.ts`); los nombres accesibles en `es.ts` y `en.ts`; el archivo en `public/social/` o `public/icons/`, y su fila en `docs/LOGOS.md`, con la fecha de lectura de la política. Antes guarda fuera del repo una copia de todo lo que toca, con sus SHA-256.
- **Qué tests toca:** `src/data/social.test.ts`, `src/components/sections/Hero.social.test.tsx` y la constante `SOCIAL` de `src/i18n/dictionaries.hero.test.ts`; `src/data/socialLogos.test.ts` solo si entra o sale un logo de marca. `src/data/logoRecord.test.ts` no se toca y debe seguir pasando. Los lista antes de tocarlos y no debilita ninguno.
- **Qué no hace, y es su garantía:** nunca pide ni acepta un correo o un teléfono. El correo y WhatsApp son entradas cuyo `kind` dice que salen por `ContactButton`; su valor no está en el registro, sino codificado en `src/config/contact.ts`, que el comando no toca. De esas dos entradas solo se puede cambiar el icono. Si el autor pide cambiar el correo o el número, se detiene; si pega uno, se niega a escribirlo y a repetirlo.
- **Prueba real:** añadir una red de prueba y revertirla desde la copia.

### `/update-hero-badge`

- **Para qué sirve:** reemplazar una de las cinco pastillas por otra tecnología.
- **Qué recibe:** nada; pregunta.
- **Qué pregunta:** cuál se reemplaza, por qué tecnología y de dónde sale la etiqueta. Toda etiqueta de stack nueva se justifica citando de dónde sale (`.claude/rules/contenido-veraz.md`), y sale de la descripción de un repo en GitHub (`AGENTS.md`). Una certificación solo cuenta si el autor lo dice. Antes de renombrar cualquier cosa ligada a un puesto, pregunta.
- **Cómo son las pastillas:** `heroBadges`, en `src/data/technologies.ts`, da el orden y, de cada una, `technology`, `icon` y `brand`. La posición no va ahí: va en una regla por puesto, `.float:nth-child(n)`, en `Hero.module.css`. El puesto es el lugar de la pastilla en la lista.
- **Qué comprueba:**
  - si la tecnología no está en `src/data/technologies.ts`, propone la entrada;
  - primero la política de marca vigente, leída ese día en su fuente oficial; las de Python y TypeScript no constan en `docs/LOGOS.md` y se leen si entran en juego;
  - si la política se leyó con una herramienta que devuelve un resumen y no el texto literal, lo dice, cita solo lo que vio palabra por palabra y no da por seguro que la marca permite el logo. Antes de usar un logo de marca, el autor abre el enlace y lo confirma;
  - el icono, por este orden: el oficial si la marca lo permite, avisando de la URL exacta y guardándolo fuera del repo; si no puede descargarlo, el enlace para el autor; si no se permite o no se consigue, tres o cuatro candidatos genéricos de licencia CC0, MIT o ISC, verificada en el `LICENSE` del repositorio oficial, con capturas a tamaño real y ampliadas;
  - mide la tinta del icono y propone el menor factor de compensación que la iguala, con su test y con capturas a factor 1 y al propuesto. Da el margen de la caja a la placa en los tres tramos de letra y avisa si solo cabe con el tope ×1,27, donde el margen es de menos de 0,1 px;
  - el comprobador de SVG, antes de copiar el archivo; si lo bloquea, no lo relaja;
  - el protocolo de medición completo, antes y después.
- **Qué cambia:** el registro de pastillas, el icono, su token de compensación si lo necesita y su fila en `docs/LOGOS.md`, con la fecha de lectura de la política. La pastilla nueva conserva el puesto y el lado de la que sustituye. Antes guarda fuera del repo una copia de todo lo que toca, con sus SHA-256.
- **Qué tests toca:** `src/data/heroBadges.test.ts`, `src/data/badgeIcons.test.ts` o `src/data/brandLogos.test.ts`, y los de `Hero.badges.test.tsx` que nombran la pastilla. Los lista antes de tocarlos. `src/data/logoRecord.test.ts` no se toca y debe seguir pasando.
- **Qué pertenece al puesto y qué a la tecnología:**
  - **al puesto,** y lo hereda la pastilla nueva: el lado, la altura y la posición en todos los tramos; en el que va junto a la cabeza, `--hero-java-right`, el test de la silueta y el hash de la foto; y los tests de reparto, como el de los 20 puntos. El hash y `SILHOUETTE` no se tocan;
  - **a la tecnología,** y sale con ella: el icono, su entrada del catálogo, su factor de compensación, su fila de `docs/LOGOS.md` y los tests del propio archivo;
  - **nombres que mezclan las dos cosas:** `--hero-java-right` y el bloque de tests «Java» son del puesto; los factores `--badge-icon-scale-…` son del icono; y el bloque «todas miden lo mismo que TypeScript» usa esa pastilla como referencia de tamaño: si TypeScript sale, ese test deja de compilar y el build falla hasta elegir otra referencia. El comando pregunta si esos nombres pasan a ser neutros, dice cuántos archivos y tests cambian, y espera.
- **Qué no hace:** nunca añade una sexta pastilla; no cambia posiciones; no renombra nada en silencio; no borra el icono ni los tests de la tecnología que sale sin que el autor apruebe la lista exacta; no decide si un límite que empeora es aceptable.
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
- **La búsqueda del dominio del correo da una coincidencia,** en `public/tech/javascript.svg` y en su copia de `dist/`: uno de esos correos de terceros usa el mismo proveedor de correo que el autor. El correo completo, su parte local y el número siguen dando cero.
- **Ningún test fija el correo de contacto** de `src/config/contact.ts`: los tests comprueban la forma, nunca el valor. El correo cambió en el commit `c35c60b`, con el mismo codificado, y no hubo que tocar ninguno.
