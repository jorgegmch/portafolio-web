---
name: update-hero-badge
description: Reemplaza una de las cinco pastillas de tecnología del Hero de portafolio-web por otra, con su icono, su compensación y sus medidas. Nunca añade una sexta. No hace commit ni push.
disable-model-invocation: true
---

# Reemplazar una pastilla del Hero

Pregunta qué pastilla se reemplaza y por qué tecnología, comprueba que la
etiqueta tiene respaldo, lee la política de la marca, consigue el icono,
mide su compensación y vuelve a medir el Hero. Prepara el cambio y se
detiene: el commit lo decide el autor.

## Nunca

- No hagas `git add`, commit ni push.
- No añadas una sexta pastilla. Si el autor pide añadir, detente y dilo:
  este comando solo reemplaza.
- No muevas ninguna pastilla ni cambies su lado, su altura ni un límite de
  un test. Si algo empeora o se solapa, da las cifras y ofrece opciones.
- No renombres nada en silencio. Si un token, una constante o un test
  lleva en el nombre la tecnología que sale, pregunta antes.
- No toques `SILHOUETTE` ni el hash de la foto.
- No inventes el respaldo de una tecnología: si no lo encuentras, señálalo
  y pregunta.
- No des por buena la política de una marca porque conste en
  `docs/LOGOS.md`: es un registro, no una autorización.
- No modifiques el logo de una marca. Va con `<img>`, sin filtros.
- No relajes `src/test/svgSafety.ts` ni debilites ningún test.
- No borres el icono ni los tests de la tecnología que sale sin que el
  autor apruebe la lista exacta.
- No descargues nada al repo: las descargas van a una carpeta de trabajo
  de fuera.
- No escribas nada en el repo antes de que el autor haya respondido a
  todas las preguntas.
- No edites con `Get-Content` ni `Set-Content` de PowerShell: corrompen la
  codificación. Usa la herramienta de edición.
- Las capturas no se commitean.
- Para volver atrás se usa la copia de seguridad, no `git checkout`.

## Cómo están hechas las pastillas

Léelo en el código antes de empezar, y di cuántas hay, en qué orden, cuál
es cada una y qué icono lleva. Esto dice dónde mirar, no lo que vale hoy.

- **`src/data/technologies.ts`:** el catálogo (`id`, `name`, `group` y
  `logos`, que solo nombra archivos de `public/tech/`) y `heroBadges`, la
  lista de pastillas en orden. Cada pastilla tiene `technology`, `icon` y
  `brand`. El nombre visible sale del catálogo, con `technologyName`.
  `brand` dice de dónde sale el icono: `true`, de `public/tech/`; `false`,
  de `public/icons/`.
- **`src/components/sections/Hero.module.css`:** la posición no va en el
  registro, sino en una regla por puesto, `.float:nth-child(n)`. El puesto
  es el lugar de la pastilla en `heroBadges`. Cada regla da el lado
  (`--badge-left` o `--badge-right`), la altura (`--badge-y`) y el desfase
  de la flotación, y los tramos de 1280, 1023 y 480 px las redefinen.
- **`src/styles/tokens.css`:** `--hero-java-right` y los factores
  `--badge-icon-scale-…`.
- **`src/components/sections/Hero.tsx`:** pinta cada pastilla con su icono
  decorativo y su nombre.

### Qué es del puesto y qué es de la tecnología

**Del puesto.** Lo hereda la pastilla nueva y no se toca:

- el lado, la altura y la posición de su regla `.float:nth-child(n)`, en
  todos los tramos; por ejemplo, la altura apilada de la que va a la
  derecha, a media altura;
- en el puesto que va junto a la cabeza: `--hero-java-right`, `SILHOUETTE`
  y el hash de la foto, con sus tests («queda a la altura de la cara, pero
  fuera de la silueta» y el resto del bloque de ese puesto);
- los tests de reparto: cuántas van a cada lado, la que queda abajo en el
  centro, las que no arrancan a la altura de la cara y «en todos los
  tramos, las del mismo lado distan al menos 20 puntos de alto».

**De la tecnología.** Sale con la que se va y entra con la nueva:

- el icono y su carpeta;
- su entrada del catálogo, con `logos` si el icono es de marca;
- su factor de compensación, si lo necesita;
- su fila de `docs/LOGOS.md`;
- los tests del propio archivo, en `src/data/badgeIcons.test.ts` o en
  `src/data/brandLogos.test.ts`.

**Nombres que mezclan las dos cosas.** Hay cosas del puesto con nombre de
tecnología, y al revés:

- `--hero-java-right` y el bloque de tests «Java» de
  `Hero.badges.test.tsx` son del puesto que va junto a la cabeza, pero
  buscan la pastilla por `technology === 'java'`;
- los factores `--badge-icon-scale-…` llevan el nombre de la tecnología,
  son del icono, y se declaran dentro de la regla del puesto;
- el bloque «todas miden lo mismo que TypeScript» usa esa pastilla como
  referencia de tamaño. Si TypeScript sale, ese test deja de compilar y el
  build falla hasta que se elija otra referencia;
- los tests de lados nombran cada tecnología.

Si la pastilla que sale tiene nombres así, **pregunta** si pasan a ser
neutros o se quedan, di cuántos archivos y cuántos tests cambian en cada
caso, y espera.

## Pasos

1. **Estado.** `git status -sb`: si hay un test temporal de una sesión
   anterior, bórralo; si alguno de los archivos de arriba tiene cambios
   sin commitear, detente. Lee el registro y di las cinco pastillas.
   Comprueba si Playwright MCP responde.
2. **Qué se quiere.** Pregunta con AskUserQuestion cuál de las cinco se
   reemplaza y por qué tecnología.
3. **Respaldo.** Toda etiqueta de stack se justifica citando de dónde sale
   (`.claude/rules/contenido-veraz.md`), y sale de la descripción de un
   repo en GitHub (`AGENTS.md`). Búscala en `src/data/projects.ts` y en los
   diccionarios, y cita el repo. Una certificación solo cuenta si el autor
   lo dice. Si no hay respaldo, señálalo y pregunta; no sigas sin
   respuesta.
4. **Catálogo.** Si la tecnología no está en el catálogo, propón su
   entrada (`id`, `name`, `group`) y espera el visto bueno.
5. **Nombres atados.** Con la lista de arriba, di qué es del puesto y qué
   de la tecnología para la pastilla elegida, y haz las preguntas sobre
   los nombres. No renombres nada sin respuesta.
6. **Política de la marca.** Léela en su fuente oficial, hoy. Di la URL y
   cita lo que permite y lo que exige. Las de Python y TypeScript no
   constan en `docs/LOGOS.md`: si entran en juego, se leen. Si la página
   no se deja leer con tus herramientas, prueba con el navegador; si
   tampoco, dale el enlace al autor y espera.
   Di con qué la leíste. Si tu herramienta devuelve un resumen y no el
   texto literal, dilo así, cita solo lo que hayas visto palabra por
   palabra y no afirmes que la marca permite usar su logo a partir de un
   resumen. Antes de usar un logo de marca, dale el enlace al autor para
   que lo abra y lo confirme: pregunta con AskUserQuestion y espera.
7. **Icono,** en este orden:
   - si la marca permite el logo: búscalo en esa fuente. Antes de
     descargar, di la URL exacta y la carpeta de trabajo de fuera del repo
     donde lo guardas;
   - si no puedes descargarlo: dale al autor el enlace o la página y
     espera; antes de leer lo que traiga, di la ruta exacta;
   - si la marca no lo permite, o ninguno de los dos puede descargarlo:
     busca un icono genérico de licencia CC0, MIT o ISC. Verifica la
     licencia en el `LICENSE` del repositorio oficial del conjunto y que
     cubre ese icono; sin crédito visible. Presenta tres o cuatro
     candidatos con capturas dentro de la pastilla, a su tamaño real (de
     24 a 28 px) y ampliadas, con la licencia exacta y el enlace, y espera
     la elección.
   Un icono con licencia MIT o ISC lleva su aviso como comentario dentro
   del archivo. Si ese aviso trae un correo de terceros, di cómo lo
   trataría `pre-push-check` antes de proponer ninguna excepción.
8. **Comprobar el archivo.** Antes de copiarlo, pásale `svgIssues` de
   `src/test/svgSafety.ts` con un test temporal que no se versiona y que
   borras al terminar. Si algo lo bloquea, dilo y pregunta; no relajes el
   comprobador. Si la sesión se corta, ese test puede quedarse en el repo:
   por eso el paso 1 empieza por `git status -sb`. Anota el SHA-256.
9. **Medir el «antes».** Con el repo tal como está, aplica el protocolo de
   medición de `docs/COMANDOS-HERO.md`, entero, en español e inglés, en
   reposo y en lo alto de la flotación. Sin Playwright, «no se pudo
   comprobar».
10. **Copia de seguridad.** Copia a una carpeta nueva fuera del repo, con la
    fecha y la hora en el nombre, todo lo que vas a tocar, y anota el
    SHA-256 de cada archivo.
11. **Listar los tests.** Antes de tocar ninguno, di cuáles cambian y por
    qué. Lo habitual:
    - `src/data/heroBadges.test.ts`: la lista «son estas cinco, en este
      orden»;
    - `Hero.badges.test.tsx`: los mapas de lados, que nombran cada
      tecnología; el mapa de factores; y, según el paso 5, la referencia
      de tamaño o el bloque del puesto junto a la cabeza;
    - `src/data/badgeIcons.test.ts` o `src/data/brandLogos.test.ts`: los
      tests del icono nuevo, tan estrictos como los del que sustituye;
    - los diccionarios y sus tests, solo si la tecnología aparece en ellos.
    `src/data/logoRecord.test.ts` no se toca: debe seguir pasando.
12. **Escribir,** con la herramienta de edición: el icono en su carpeta; la
    entrada del catálogo; la pastilla en `heroBadges`, en el mismo puesto;
    la fila de `docs/LOGOS.md` (origen, licencia, SHA-256 y fecha de
    lectura de la política); y los tests del paso 11.
13. **Compensación.** Mide la tinta del icono: qué parte de su cuadro
    ocupa el dibujo, y cuántos píxeles son dentro de la pastilla. Propón
    el menor factor que iguala su tinta a la de las demás, no el tope por
    defecto. Si el icono ya llena su cuadro, el factor es 1 y no hace
    falta token.
    Da el margen que queda entre la caja del icono y la placa, en
    píxeles, en los tres tramos: con letra de 16, de 14 y de 13 px. El
    tope es ×1,27: más, y la caja se sale de la placa. Si el icono solo
    iguala a los demás con el tope, avísalo: ahí el margen es de menos
    de 0,1 px y es frágil; di cuánta tinta le falta y ofrece opciones.
    Un icono de relleno pesa más que uno de trazo con la misma tinta:
    tenlo en cuenta, como se hizo con la base de datos y con el chip.
    Enseña capturas con factor 1 y con el propuesto y espera la elección.
    El factor va en un token con su test estricto. Si el del icono
    anterior queda sin uso, pregunta si se retira.
14. **Lo que sale.** No borres nada por tu cuenta. Presenta la lista exacta
    de lo que se borraría: el icono anterior, su fila de `docs/LOGOS.md`,
    `logos` en su entrada del catálogo si lo nombra y, uno a uno y por su
    nombre, los tests que solo comprueban ese archivo. Borra solo cuando
    el autor apruebe de forma explícita esa lista.
15. **Comprobar.** Lee desde disco los archivos tocados: sin «Ã», sin CR y
    sin caracteres de control. `npm run lint`, `npm run typecheck`,
    `npm test` y `npm run build`.
16. **Medir el «después».** El protocolo otra vez, entero. De la pastilla
    nueva: su ancho, que depende del nombre; su distancia al texto, a la
    figura (las dos medidas, cada cifra dice cuál es), a la cara, a las
    otras pastillas, a la barra y al borde de la ventana; y qué parte de
    su caja tapa. Además, los 20 puntos, las líneas del párrafo, el alto
    del Hero y la cara cortada. Si algo empeora o se solapa, da las cifras
    y ofrece opciones: otro nombre, otra pastilla o aceptar el límite. No
    decidas ni muevas nada.
17. **Cierre.** `git status -sb` y `git diff --stat`. Confirma que no queda
    el test temporal ni nada de la carpeta de trabajo dentro del repo.

## Informe

- Qué pastilla salió, cuál entró, en qué puesto, y de qué repo sale la
  etiqueta.
- Lo que se preguntó sobre los nombres y lo que el autor respondió.
- La política de la marca: la URL, la fecha de lectura y lo que permite.
- El icono: de dónde salió, su licencia, su SHA-256 y el resultado del
  comprobador.
- La compensación: la tinta medida, el factor propuesto y el elegido, y
  el margen de la caja a la placa en los tres tramos.
- Los tests que cambiaron y por qué; lo que se borró, con la lista
  aprobada; y el resultado de lint, typecheck, tests y build.
- Las medidas, en las tres listas del protocolo (empeora, mejora, no
  cambia), con la ventana, el idioma y las dos cifras de cada caso.
- Lo que no se pudo comprobar.
- Si te detuviste: en qué paso, por qué, y que no se escribió nada.
- Dónde quedó la copia de seguridad, con los SHA-256 anteriores, y cómo
  volver atrás.
- El `git diff --stat`.
