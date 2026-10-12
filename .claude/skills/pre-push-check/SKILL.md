---
name: pre-push-check
description: Comprobaciones previas a un push en portafolio-web. Solo lee e informa; el push lo hace el autor.
disable-model-invocation: true
---

# Comprobación previa al push

Ejecuta las comprobaciones de abajo sobre los commits que aún no están en el
remoto y entrega un veredicto. Es de solo lectura.

## Nunca

- No hagas push, ni lo intentes con variantes del comando.
- No modifiques archivos versionados; el build solo escribe en `dist/`, que
  está ignorado. No borres nada. No hagas commits ni `git add`.
- No uses `--no-verify`.
- No escribas datos personales en ningún sitio, tampoco en tu respuesta: si
  encuentras uno, nombra el archivo, la línea y el tipo de dato, no su valor.
- Si una comprobación falla, no la arregles: infórmala y sigue con las demás.

## Pasos

1. **Estado.** `git status -sb`, `git branch -vv` y
   `git log --oneline @{upstream}..HEAD`. Informa la rama, cuántos commits
   van por delante y cualquier archivo modificado o sin versionar. Si no hay
   upstream, dilo y usa `origin/main..HEAD`.
2. **Mensajes de commit.** En Bash:
   `git log --format=%B @{upstream}..HEAD | grep -iE "claude|anthropic|co-authored"`.
   No debe devolver nada. Control positivo obligatorio: repite el `grep` con
   una palabra que sí esté en esos mensajes (por ejemplo `feat`) y confirma
   que da resultados; sin eso, la salida vacía no vale.
   Si devuelve algo, no lo marques como fallo sin más: muestra cada línea con
   el hash de su commit. Una mención legítima de la carpeta `.claude/` en un
   asunto no es una atribución; el autor decide cada caso.
3. **Formato de los mensajes.** Cada asunto sigue Conventional Commits, en
   inglés. Lista los que no.
4. **Archivos que no deben estar versionados.** `git ls-files` no debe
   contener `.claude/settings.local.json`, nada bajo `_incoming/`, archivos
   `.env` distintos de `.env.example`, capturas ni trazas de Playwright.
5. **Datos personales, por patrón.** Con `git grep -nIE` sobre los archivos
   versionados, busca: texto con forma de correo, secuencias de siete o más
   dígitos seguidos o separados por espacios o guiones, y fechas completas
   (año, mes y día). Descarta lo que sea claramente otra cosa (hashes,
   versiones, el correo `noreply` de los commits, códigos de carácter de
   `src/config/`). Lista el resto como archivo, línea y tipo, sin el valor.
   Excepción explícita, solo por nombre de archivo:
   `public/tech/javascript.svg` contiene dos correos dentro del aviso de la
   licencia MIT del logo. Son de sus autores y forman parte del texto
   oficial, así que no se informan. La excepción no cubre ningún otro
   archivo ni ningún otro tipo de dato en ese: si el archivo tiene un número
   de correos distinto de dos, o cualquier otra coincidencia, lístalo.
   Esta búsqueda no ve dentro de binarios: los PDFs se revisan en el paso 6.
   Control positivo: confirma que el patrón de correo encuentra una dirección
   ficticia de ejemplo pasada por la entrada estándar.
   Límite: esto no comprueba valores concretos; la cédula y la fecha de
   nacimiento no están escritas en ningún sitio con el que comparar.
6. **Contacto en el bundle y en los PDFs.** Decodifica en memoria el correo
   y el teléfono de `src/config/contact.ts`; no los imprimas ni los guardes.
   - Bundle: repite la verificación de `.claude/rules/contacto.md` sobre
     `dist/`, sin contar los PDFs. Cero coincidencias, con su control
     positivo y con la única excepción que esa regla nombra: el dominio
     del correo en `dist/tech/javascript.svg`.
   - PDFs versionados: localízalos con `git ls-files '*.pdf'`, sin dar por
     hecha ninguna carpeta, y aplícales la «Revisión de PDFs» de abajo.
7. **Tests sin trampas.**
   `git grep -nE "\.(only|skip)\(" -- '*.test.ts' '*.test.tsx'` no debe
   devolver nada. Control positivo obligatorio:
   `git ls-files -- '*.test.ts' '*.test.tsx'` debe listar `src/App.test.tsx`;
   si no aparece, el patrón no cubre todos los tests y la salida vacía no
   vale.
8. **Calidad.** `npm run lint`, `npm run typecheck`, `npm test` y
   `npm run build`. Informa el resultado de cada uno con sus cifras.

## Revisión de PDFs

Procedimiento con nombre propio: lo usa el paso 6 y lo puede usar cualquier
otra skill que reciba PDFs. Su entrada es una lista de rutas de PDF; no
copia, no mueve y no modifica ninguno.

1. **Herramientas.** `pdftotext` para el texto y Python estándar para los
   metadatos. Las dos son de esta máquina, no del repo: no instales nada.
   Si `pdftotext -v` no responde, informa «no se pudo comprobar» para todos
   los PDFs; nunca los des por limpios.
2. **Cabecera.** Cada archivo empieza por `%PDF-`. Si no, falla y no se
   sigue con él.
3. **Texto.** `pdftotext -enc UTF-8 <archivo> -`. El `-enc UTF-8` es
   obligatorio: sin él el texto sale en Latin-1 y las tildes llegan rotas.
   Las páginas vienen separadas por un salto de página; cuéntalas.
   - Si ninguna página trae texto, el PDF no tiene capa de texto: «no se
     pudo comprobar».
   - Si una página no trae texto, «no se pudo comprobar» esa página.
   - Límite: un texto convertido a contornos no sale al extraer y no se
     puede detectar. En un PDF de diseño, dilo.
4. **Metadatos.** Léelos con Python estándar, sin imprimirlos:
   - el diccionario Info al que apunta `/Info`, con sus cadenas literales o
     hexadecimales (las que empiezan por `FEFF` van en UTF-16);
   - el paquete XMP (`<x:xmpmeta>`);
   - si el PDF guarda sus objetos en flujos comprimidos, descomprímelos con
     `zlib` antes de buscar.
   Un PDF cifrado, o un flujo que no se pueda descomprimir: «no se pudo
   comprobar». Informa qué campos existen por su nombre, nunca su valor.
5. **Qué se busca,** en el texto de cada página y en los metadatos:
   - **Correo:** todo texto con forma de correo se compara con el de
     config. Informa solo «coincide» o «no coincide».
   - **Teléfono:** toda secuencia de siete o más dígitos, seguidos o
     separados por espacios, puntos, guiones o paréntesis. Quita los
     separadores y compárala con el de config, con y sin indicativo.
     Informa solo «coincide» o «no coincide».
   - **Números largos:** cualquier otra secuencia de siete o más dígitos se
     lista; puede ser una cédula.
   - **Fecha completa** (día, mes y año), con cifras o con el mes escrito,
     en español o en inglés.
   - **Palabras de cédula** (cédula, C.C., identificación, documento de
     identidad, pasaporte), **de nacimiento** (nacimiento, nacido, born,
     birth), **de dirección** (dirección, address, calle, carrera, avenida,
     torre, apartamento, barrio) y **de estado civil** (estado civil,
     marital, soltero, casado, single, married).
   - **Nombre sin tilde:** «Gomez» es un AVISO, no un fallo. Lístalo por
     archivo. Los cuatro PDFs del repo lo llevan hasta que se regeneren.
6. **Cómo se informa.** Cada hallazgo como archivo, página (o «metadatos»)
   y tipo, sin el valor. En el texto, un correo o un teléfono que coincide
   pasa; en los metadatos no puede haber ninguno, coincida o no. Todo lo
   demás se lista para que el autor decida.
7. **Descartes conocidos.** No son datos personales; anótalos como
   descartados, con su motivo:
   - dos años seguidos, como el periodo de un trabajo, suman ocho dígitos;
   - `CreationDate` y `ModDate` son la fecha y la hora en que se generó el
     archivo, no una fecha de nacimiento;
   - «Identificación de las necesidades del cliente» sale por la palabra
     «identificación»;
   - «Torre de control de inventario» sale por la palabra «torre».
   Un descarte vale solo para esa frase o ese campo. Si la misma palabra
   aparece en otro sitio, se lista.

## Informe

Una tabla con una fila por paso: qué se comprobó, resultado (pasa, falla o
no se pudo comprobar) y la evidencia. Después:

- Si todo pasa: di que está listo y muestra el comando de push para que lo
  ejecute el autor. No lo ejecutes.
- Si algo falla o no se pudo comprobar: di que no está listo y qué falta.
- Los avisos (por ejemplo, «Gomez» sin tilde en un PDF) van en una lista
  aparte y no cambian el veredicto.
