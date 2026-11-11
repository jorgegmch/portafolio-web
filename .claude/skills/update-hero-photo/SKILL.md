---
name: update-hero-photo
description: Sustituye el retrato del Hero de portafolio-web por una fotografía nueva, la exporta a WebP sin metadatos y vuelve a medir lo que dependía de la anterior. No hace commit ni push.
disable-model-invocation: true
---

# Actualizar el retrato del Hero

Recibe la ruta de un PNG de fuera del repo, lo revisa, lo exporta a los
cuatro WebP de `src/assets/hero/` y vuelve a medir lo que se midió sobre la
foto anterior. Prepara el cambio y se detiene: el commit lo decide el autor.

El retrato es siempre una fotografía real del autor: no preguntes por ello.
`hero.photoAlt` describe una fotografía y no se cambia salvo que el autor lo
pida.

## Nunca

- No hagas `git add`, commit ni push.
- No reemplaces ningún WebP antes de terminar la revisión, de que el autor
  apruebe la comparación de pesos y de que haya respondido a todas las
  preguntas.
- No leas fuera del repo nada más que el archivo que anunciaste.
- No modifiques el PNG de origen: trabaja sobre una copia.
- No recortes, no retoques y no quites el fondo por tu cuenta.
- No muevas el lema, su velo ni los paneles laterales, ni cambies un
  límite de un test para que pase. Si algo empeora, da las cifras y
  ofrece opciones.
- No instales nada y no versiones ningún script de exportación. Si falta
  Pillow o no trae WebP, detente y dilo.
- No imprimas el contenido del EXIF ni de ningún otro metadato del PNG:
  di qué trae, no su valor.
- Las capturas no se commitean.
- Para volver atrás se usa la copia de seguridad, no `git checkout`.

## Qué depende de la foto

Léelo en el repo antes de empezar; esta lista dice dónde mirar, no lo que
vale hoy.

- **Los archivos y sus medidas:** `src/assets/hero/portrait.ts` declara los
  cuatro anchos y la proporción 4:5. `src/assets/hero/portrait.test.ts`
  comprueba las dimensiones, la proporción, la transparencia, la
  compresión con pérdida y que no hay metadatos. No se toca: se ejecuta.
  `src/components/sections/Hero.portrait.test.tsx` comprueba cómo se carga
  (`srcset`, `sizes`, dimensiones); tampoco se toca.
- **Lo que va sobre la foto (rediseño v2.1):** el nombre, detrás; y al pie
  de la foto, el lema sobre un velo que la funde con el panel. Con una
  foto nueva puede cambiar dónde queda la cara respecto al lema y cuánto
  se ve en la primera pantalla. La silueta, las pastillas y sus tests se
  retiraron con el rediseño v2.

## Pasos

1. **Origen.** La ruta del PNG llega como argumento; si no llega, pídela.
   Antes de leerlo, escribe la ruta exacta que vas a leer. Debe ser un
   archivo, estar fuera del repo y empezar por la firma de PNG; si no,
   detente.
2. **Estado y herramientas.** `git status -sb`: si `src/assets/hero/` tiene
   cambios sin commitear, detente. Comprueba que el Python del sistema
   tiene Pillow con WebP y que Playwright MCP responde. Sin Pillow,
   detente. Sin Playwright, sigue solo si el autor lo acepta, e informa
   «no se pudo comprobar» en cada medida del navegador.
3. **Copia de trabajo.** Anota el SHA-256 del PNG y cópialo a una carpeta
   nueva fuera del repo. Todo lo demás se hace sobre la copia.
4. **Qué trae el PNG.** Dimensiones, modo de color y peso. Lee sus
   fragmentos con Python estándar y di cuáles lleva además de la imagen
   (`eXIf`, `iCCP`, `tEXt`, `iTXt`, `zTXt`), sin imprimir su contenido. Si
   el EXIF incluye la ubicación, dilo. Si trae un perfil de color que no es
   sRGB, pregunta con AskUserQuestion: quitarlo sin convertir cambia los
   colores.
5. **Medidas.**
   - Sin canal alfa: detente; el fondo no es transparente.
   - Proporción distinta de 4:5: pregunta con AskUserQuestion cómo
     recortar. No recortes por tu cuenta.
   - Menos ancho que el mayor de `portrait.ts`: avisa de que los archivos
     más anchos que el PNG serían un reescalado hacia arriba y pregunta con
     AskUserQuestion si seguir.
6. **Transparencia.** Comprueba que el fondo es de verdad transparente: qué
   parte de la imagen tiene alfa cero, que las esquinas de arriba lo
   tienen, y que el borde semitransparente no es más claro que lo que hay
   justo dentro (una franja clara delata un fondo mal quitado). Compón la
   foto sobre el color de `--color-bg`, a tamaño completo y ampliada en el
   borde del pelo y de los hombros, y enséñale las capturas al autor.
7. **Medir el «antes».** Con el repo tal como está, aplica el protocolo de
   medición de `docs/COMANDOS-HERO.md`, entero, para tener con qué
   comparar.
8. **Exportación.** No des por sabidos los parámetros. Lee los cuatro WebP
   actuales (peso, dimensiones, fragmentos, canal alfa) y busca, con Pillow,
   la calidad que da un peso total comparable: WebP con pérdida, alfa sin
   pérdida y reescalado Lanczos desde la copia, a los anchos de
   `portrait.ts`. Exporta a la carpeta de trabajo, no al repo. Vacía a
   propósito los metadatos: borra `info` de la imagen y guarda con `exif`,
   `icc_profile` y `xmp` vacíos.
   Enseña la comparación, archivo por archivo y en total, y **espera la
   aprobación del autor** antes de reemplazar nada.
9. **Sin metadatos.** Lee con Python estándar los fragmentos RIFF de cada
   WebP exportado: no puede haber `ICCP`, `EXIF` ni `XMP `, ni bytes
   después de la imagen, y debe haber `VP8 ` y `ALPH`. Si el PNG traía
   EXIF o perfil de color, confirma expresamente que no pasaron.
10. **Copia de seguridad.** Copia los cuatro WebP actuales a una carpeta
    nueva fuera del repo, con la fecha y la hora en el nombre. Anota el
    SHA-256 de cada uno y comprueba que la copia tiene el mismo.
11. **Reemplazar.** Copia los cuatro WebP exportados a `src/assets/hero/`
    con los nombres actuales y compara los SHA-256. Ejecuta
    `npx vitest run src/assets/hero/portrait.test.ts` y
    `npx vitest run src/components/sections/Hero.portrait.test.tsx`: deben
    pasar. Si falla alguno, dilo.
12. **Medir el «después».** Compila y aplica otra vez el protocolo de
    medición, entero. Además:
    - **Cara:** no se puede medir sola. Mírala en la captura, di de qué
      porcentaje a qué porcentaje del alto va y pide al autor que lo
      confirme.
    - **Cara y lema:** en las capturas de cada tramo, si el lema o su velo
      tapan la cara.
    Si con la foto nueva el lema tapa la cara o algo del protocolo empeora,
    **no muevas nada ni cambies ningún número:** da las cifras, antes y
    después, y ofrece estas opciones, sin decidir:
    - reencuadrar la foto para que la cabeza quede donde estaba;
    - ajustar el lema o su velo, en un cambio aparte;
    - aceptarlo como límite.
13. **Cierre.** `npm run lint`, `npm run typecheck`, `npm test` y
    `npm run build`. Confirma que el SHA-256 del PNG de origen no cambió.
    `git status -sb` y `git diff --stat`.

## Informe

- **El PNG:** dimensiones, proporción, canal alfa, qué metadatos traía
  (sin su valor) y el resultado de la comprobación de transparencia, con
  las capturas.
- **Los WebP:** una tabla con el peso anterior y el nuevo de cada archivo y
  el total, los parámetros usados y los fragmentos RIFF de cada uno.
- **Las medidas,** en las tres listas del protocolo (empeora, mejora, no
  cambia), con la franja de la cara y su relación con el lema, antes y
  después.
- **Los tests:** el resultado de los del retrato, de lint, typecheck,
  tests y build.
- Lo que no se pudo comprobar.
- Si te detuviste: en qué paso, por qué, y que no se reemplazó nada.
- Dónde quedó la copia de seguridad, con los SHA-256 anteriores, y cómo
  volver atrás: copiar esos cuatro archivos de vuelta a `src/assets/hero/`.
- El `git diff --stat`.
- Un aviso para el autor: con una foto nueva puede cambiar la posición de
  la cabeza. Si el lema pasa a tapar la cara, este comando da las cifras y
  las opciones, y no decide.
- Dos avisos más: el historial de git conserva la foto anterior
  si la rama ya se subió; y la rama se sube con la foto provisional, así
  que esa foto queda en el historial.
