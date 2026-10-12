---
name: update-hero-social
description: Añade una red a la fila de redes y contacto del Hero de portafolio-web, o reemplaza una o su icono, tras leer la política de la marca. No hace commit ni push.
disable-model-invocation: true
---

# Actualizar la fila de redes del Hero

Pregunta qué se quiere cambiar en la fila de redes y contacto, lee la
política de la marca, consigue el icono, cambia el registro, los textos y
los tests que lo fijan, y vuelve a medir. Prepara el cambio y se detiene:
el commit lo decide el autor.

## Nunca

- No hagas `git add`, commit ni push.
- No pidas ni aceptes un correo o un teléfono. Si el autor pega uno, no lo
  escribas en ningún archivo ni lo repitas en tu respuesta: di que los
  datos de contacto van codificados en `src/config/contact.ts`, por otra
  vía, y detente.
- No cambies a dónde apuntan el correo ni WhatsApp, ni toques
  `src/config/contact.ts`, `src/lib/assembleContact.ts` ni
  `ContactButton`. Si el autor pide cambiar el correo o el número, detente
  y dilo.
- No escribas nada en el repo antes de que el autor haya respondido a
  todas las preguntas.
- No des por buena la política de una marca porque conste en
  `docs/LOGOS.md`: es un registro, no una autorización.
- No modifiques el logo de una marca: ni el dibujo, ni el color, ni un
  comentario añadido. Va con `<img>`, sin filtros.
- No relajes `src/test/svgSafety.ts` ni debilites ningún test para que
  pase. Si un archivo no pasa, dilo y pregunta.
- No descargues nada al repo: las descargas van a una carpeta de trabajo
  de fuera.
- No edites con `Get-Content` ni `Set-Content` de PowerShell: corrompen la
  codificación. Usa la herramienta de edición.
- No decidas si un límite que empeora es aceptable: da las cifras y ofrece
  opciones.
- Las capturas no se commitean.
- Para volver atrás se usa la copia de seguridad, no `git checkout`.

## Cómo está hecho el registro

Léelo en el código antes de empezar; esto dice dónde mirar.

- **`src/data/social.ts`:** `heroSocial` es la fila, en orden. Cada entrada
  tiene cuatro campos y ninguno más: `id`, `kind`, `icon` y `brand`. No
  guarda ninguna URL ni ningún dato de contacto.
  - `kind` dice cómo se abre: `link` es un enlace al perfil; `email` y
    `whatsapp` salen solo por `ContactButton`. Hay una entrada de cada uno
    de estos dos, y su `id` es su `kind`.
  - El `id` de una entrada `link` tiene que ser una clave de `site.social`,
    en `src/config/site.ts`: ahí vive la URL del perfil.
  - `brand` dice de dónde sale el icono: `true` es el logo oficial de una
    marca, en `public/social/`; `false` es un icono propio o genérico, en
    `public/icons/`.
  - `HERO_SOCIAL_LIMIT` es el tope de la fila.
- **`src/config/site.ts`:** `site.social` guarda las URL y `socialLinks` es
  la lista del pie. Un test exige que toda red con enlace del Hero esté
  también en el pie, con la misma URL.
- **Diccionarios:** `hero.social` tiene un nombre accesible por cada `id`,
  en `src/i18n/es.ts` y `src/i18n/en.ts`. El aviso de pestaña nueva no va
  en ese texto: lo añade el Hero a los enlaces y a WhatsApp.
- **Tests que fijan la fila:** `src/data/social.test.ts`,
  `src/data/socialLogos.test.ts`,
  `src/components/sections/Hero.social.test.tsx`,
  `src/i18n/dictionaries.hero.test.ts` (la constante `SOCIAL`) y
  `src/data/logoRecord.test.ts`.

## Pasos

1. **Estado.** `git status -sb`: si alguno de los archivos de arriba tiene
   cambios sin commitear, detente. Lee el registro y di cuántas entradas
   hay, cuáles son y cuál es el tope. Comprueba si Playwright MCP responde.
2. **Qué se quiere.** Pregunta con AskUserQuestion:
   - si se añade una red o se reemplaza algo. Quitar una red, solo si el
     autor lo pide;
   - si es reemplazar: cuál de las actuales, y si se cambia la red entera
     o solo su icono;
   - el nombre de la red y el enlace de su perfil.
   Del correo y de WhatsApp solo se puede cambiar el icono.
3. **Tope y orden.** Si al añadir se pasa de `HERO_SOCIAL_LIMIT`, detente.
   Van primero los enlaces, en el orden del registro, y después el correo
   y WhatsApp; una red nueva va al final de los enlaces. Pregunta al autor
   si quiere otro orden.
4. **Pie de página.** Una red nueva con enlace obliga a añadirla también
   al pie, porque un test lo exige. Y cambiar la URL de GitHub o de
   LinkedIn cambia también la del pie, porque es la misma. En los dos
   casos dilo y espera la confirmación del autor. Si no quiere tocar el
   pie, no cambies el test por tu cuenta: ofrece las opciones.
5. **Política de la marca.** Léela en su fuente oficial, hoy. Di la URL que
   leíste y cita lo que permite y lo que exige. Si la página no se deja
   leer con tus herramientas, prueba con el navegador; si tampoco, dale el
   enlace al autor y espera. Sin política leída no sigas.
   Di con qué la leíste. Si tu herramienta devuelve un resumen y no el
   texto literal, dilo así, cita solo lo que hayas visto palabra por
   palabra y no afirmes que la marca permite usar su logo a partir de un
   resumen. Antes de usar un logo de marca, dale el enlace al autor para
   que lo abra y lo confirme: pregunta con AskUserQuestion y espera.
6. **Icono.**
   - Si la marca permite usar su logo: búscalo en esa misma fuente. Antes
     de descargar, di la URL exacta y la carpeta de trabajo de fuera del
     repo donde lo vas a guardar. Si no puedes descargarlo, dale al autor
     el enlace o la página y espera a que lo traiga; antes de leer lo que
     traiga, di la ruta exacta que vas a leer.
   - Si no lo permite: propón un icono genérico, propio o de un conjunto
     con licencia CC0, MIT o ISC verificada en su repositorio oficial.
     Enseña los candidatos con capturas, a tamaño real y ampliadas, sobre
     el fondo oscuro, y espera la elección del autor.
7. **Comprobar el archivo.** Antes de copiarlo, pásale `svgIssues` de
   `src/test/svgSafety.ts` con un test temporal que no se versiona y que
   borras al terminar. Si trae un `script`, un `style`, un enlace, una
   imagen incrustada o una referencia fuera del archivo, dilo y pregunta:
   no relajes el comprobador. Si es un PNG, comprueba su firma, su tamaño
   y que no lleva bloques de metadatos. Anota su SHA-256.
   El test temporal vive dentro del repo mientras se ejecuta. Si la sesión
   se corta, puede quedarse ahí: al retomar, el primer paso es
   `git status -sb`, para verlo y borrarlo antes de seguir.
8. **Medir el «antes».** Con el repo tal como está, aplica el protocolo de
   medición de `docs/COMANDOS-HERO.md` en lo que afecta a la fila, en
   español e inglés: en cuántas filas quedan los controles y cuánto sobra,
   alto del Hero, cara cortada, saludo a la barra, scroll horizontal y
   distancias de las pastillas. Incluye 320 px de ancho: es donde antes se
   parte la fila. Sin Playwright, «no se pudo comprobar».
9. **Copia de seguridad.** Copia a una carpeta nueva fuera del repo, con la
   fecha y la hora en el nombre, todo lo que vas a tocar, y anota el
   SHA-256 de cada archivo.
10. **Listar los tests.** Antes de tocar ninguno, di cuáles cambian y por
    qué. Lo habitual:
    - `social.test.ts`: la lista de la fila, la lista de enlaces y, si el
      icono es de marca, la lista de logos publicados;
    - `dictionaries.hero.test.ts`: los nombres accesibles de `SOCIAL`, en
      los dos idiomas;
    - `Hero.social.test.tsx`: los controles, que fijan el orden en el DOM,
      los iconos y el tabulador;
    - `socialLogos.test.ts`, solo si entra o sale un logo de marca: su
      lista, su SHA-256 oficial y sus comprobaciones;
    - un icono genérico nuevo lleva sus propios tests, como los del sobre:
      que es un SVG seguro, que no nombra ninguna marca y que su
      comentario dice que es un dibujo propio.
    `logoRecord.test.ts` no se toca: debe seguir pasando.
11. **Escribir,** con la herramienta de edición:
    - el archivo del icono, en `public/social/` o en `public/icons/`;
    - la entrada en `src/data/social.ts`;
    - la URL en `site.social` y, si el autor lo confirmó, la red en
      `socialLinks`;
    - el nombre accesible en `hero.social` de los dos diccionarios, sin
      «@» ni dígitos. El de una marca no se traduce;
    - los tests de la lista anterior;
    - la fila de `docs/LOGOS.md`: origen, licencia, SHA-256 y la fecha en
      que se leyó la política.
    Si un icono deja de usarse, no borres nada por tu cuenta. Presenta
    la lista exacta de lo que se borraría: el archivo, su fila de
    `docs/LOGOS.md` y, uno a uno y por su nombre, los tests que solo
    comprueban ese archivo. Ningún otro test entra en la lista. Borra
    solo cuando el autor apruebe de forma explícita esa lista.
12. **Comprobar.** Lee desde disco los archivos tocados: sin «Ã», sin CR y
    sin caracteres de control. `npm run lint`, `npm run typecheck`,
    `npm test` y `npm run build`.
13. **Contacto.** Repite la verificación de `.claude/rules/contacto.md`,
    con su control positivo, sin imprimir ni guardar el dato. Lo que es
    normal encontrar está en `docs/COMANDOS-HERO.md`.
14. **Medir el «después».** Lo mismo que en el paso 8. Si la fila pasa a
    partirse en dos, si crece el Hero o la cara cortada, o si algo empeora,
    da las cifras y ofrece opciones, sin decidir.
15. **Cierre.** `git status -sb` y `git diff --stat`. Confirma que no queda
    el test temporal ni nada de la carpeta de trabajo dentro del repo.

## Informe

- Qué se pidió y qué se cambió: la entrada, el icono, los textos.
- La política de la marca: la URL, la fecha de lectura y lo que permite.
- El icono: de dónde salió, su licencia, su SHA-256 y el resultado del
  comprobador.
- Los tests que cambiaron y por qué, y el resultado de lint, typecheck,
  tests y build.
- La verificación del contacto, con su control positivo.
- Las medidas, en las tres listas del protocolo (empeora, mejora, no
  cambia), con la ventana, el idioma y las dos cifras de cada caso.
- Si el pie de página cambió.
- Lo que no se pudo comprobar.
- Si te detuviste: en qué paso, por qué, y que no se escribió nada.
- Dónde quedó la copia de seguridad, con los SHA-256 anteriores, y cómo
  volver atrás.
- El `git diff --stat`.
