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
- No muevas ninguna pastilla ni cambies un límite de un test para que
  pase. Si algo empeora, da las cifras y ofrece opciones.
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
- **La silueta:** la constante `SILHOUETTE` de
  `src/components/sections/Hero.badges.test.tsx` fija el borde izquierdo de
  la silueta (`left`) en una franja de alto (`from` y `to`), el archivo
  medido y su SHA-256. La usan dos tests:
  - «la silueta medida es la de la foto actual», que falla a propósito en
    cuanto cambia `portrait-576.webp`;
  - «queda a la altura de la cara, pero fuera de la silueta».
- **La franja de la cara:** los tests la dan por hecha, del 14 % al 45 %
  del alto del retrato, en números sueltos y en comentarios, no en una
  constante. La usan «queda a la altura de la cara, pero fuera de la
  silueta», «ninguna arranca a la altura de la cara» (teléfono), «apilado,
  ninguna arranca a la altura de la cara», «la que va arriba queda pegada
  al borde del retrato» y «una pastilla queda abajo en el centro, lejos de
  la cara».
- **Las posiciones de las pastillas:** los porcentajes `--badge-y`,
  `--badge-left` y `--badge-right` de
  `src/components/sections/Hero.module.css`, por tramo, y
  `--hero-java-right` en `src/styles/tokens.css`. Los fijan los tests de
  Java («en dos columnas va a la izquierda de la cabeza, a la altura del
  nombre», «apilado va arriba a la izquierda, por encima del pelo», «en
  teléfono va algo más baja, lejos del texto») y «en todos los tramos, las
  del mismo lado distan al menos 20 puntos de alto».

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
   medición de `docs/COMANDOS-HERO.md`, entero. Mide además, sobre
   `portrait-576.webp`, la silueta y la franja de la cara como en el paso
   12, para tener con qué comparar.
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
    `npx vitest run src/assets/hero/portrait.test.ts`: debe pasar. Ejecuta
    `npx vitest run src/components/sections/Hero.badges.test.tsx`: «la
    silueta medida es la de la foto actual» debe fallar, y solo ese. Si
    falla otro, o ese no falla, dilo.
12. **Medir el «después».** Compila y aplica otra vez el protocolo de
    medición, entero. Además, sobre el `portrait-576.webp` nuevo:
    - **Silueta:** en el navegador, sobre el canal alfa, el píxel opaco más
      a la izquierda en la franja de `SILHOUETTE` (`from` a `to`), en
      porcentaje del ancho. Cuenta como opaco un alfa mayor que 8 sobre
      255. Ese umbral no es una norma: está calibrado para reproducir el
      valor que el test fijaba con la foto anterior (30,73 %); con un
      umbral de 0 o de 128 la misma foto da otra cifra. Úsalo siempre, para
      que el «antes» y el «después» sean comparables.
      Contrástala con la misma medida hecha con Pillow; deben coincidir.
    - **Margen de Java:** los puntos que hay entre el borde derecho de la
      pastilla de Java y la silueta, es decir, `left` menos (100 menos el
      valor de `--hero-java-right`). Dalo en los dos extremos de la
      fórmula y medido en el navegador, antes y después. Un margen
      negativo significa que Java queda dentro de la silueta.
      No lo confundas con el hueco horizontal a la figura del protocolo:
      el margen va en puntos porcentuales del ancho del retrato y sale de
      la franja entera de `SILHOUETTE`; el hueco va en píxeles y sale solo
      de las filas que ocupa la pastilla. Cada cifra dice cuál de las dos
      es.
    - **Cara:** no se puede medir sola. Mírala en la captura, di de qué
      porcentaje a qué porcentaje del alto va y pide al autor que lo
      confirme.
    - **Pastillas:** con el protocolo, en reposo y en lo alto de la
      flotación: cuánto tapa cada una de la franja de la cara, su
      distancia a la silueta y el test de los 20 puntos.
13. **Actualizar el test.** Antes de tocarlo, lista qué cambia y por qué:
    solo `left` y `sha256` de `SILHOUETTE`. Con eso, «la silueta medida es
    la de la foto actual» vuelve a pasar.
    Si después falla «queda a la altura de la cara, pero fuera de la
    silueta», el test está haciendo su trabajo: Java ha quedado dentro de
    la silueta nueva. No lo arregles; déjalo en rojo e infórmalo.
    Si con la foto nueva una pastilla pasa a tapar la cara, a tocar la
    silueta o a incumplir los 20 puntos, o si la cara ya no va del 14 % al
    45 %, **no muevas nada ni cambies ningún otro número:** da las cifras,
    antes y después, y ofrece estas opciones, sin decidir:
    - reencuadrar la foto para que la cabeza quede donde estaba;
    - mover la pastilla, con una fórmula nueva si es Java;
    - aceptar el contacto como límite.
14. **Cierre.** `npm run lint`, `npm run typecheck`, `npm test` y
    `npm run build`. Confirma que el SHA-256 del PNG de origen no cambió.
    `git status -sb` y `git diff --stat`.

## Informe

- **El PNG:** dimensiones, proporción, canal alfa, qué metadatos traía
  (sin su valor) y el resultado de la comprobación de transparencia, con
  las capturas.
- **Los WebP:** una tabla con el peso anterior y el nuevo de cada archivo y
  el total, los parámetros usados y los fragmentos RIFF de cada uno.
- **Las medidas,** en las tres listas del protocolo (empeora, mejora, no
  cambia), con la silueta, la franja de la cara y el margen de Java a la
  silueta, antes y después. El margen de Java va en puntos porcentuales y
  el hueco horizontal a la figura, en píxeles: son dos medidas distintas,
  y cada cifra dice cuál es.
- **Los tests:** cuáles cambiaron y por qué, y el resultado de lint,
  typecheck, tests y build.
- Lo que no se pudo comprobar.
- Si te detuviste: en qué paso, por qué, y que no se reemplazó nada.
- Dónde quedó la copia de seguridad, con los SHA-256 anteriores, y cómo
  volver atrás: copiar esos cuatro archivos de vuelta a `src/assets/hero/`
  y deshacer el cambio de `SILHOUETTE`.
- El `git diff --stat`.
- Un aviso para el autor: con una foto nueva puede cambiar la posición de
  la cabeza. Si Java o cualquier otra pastilla pasa a tapar la cara o a
  tocar la silueta, este comando da las cifras y las opciones, y no
  decide.
- Dos avisos más: el historial de git conserva la foto anterior
  si la rama ya se subió; y la rama se sube con la foto provisional, así
  que esa foto queda en el historial.
