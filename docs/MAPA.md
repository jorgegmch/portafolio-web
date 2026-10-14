# Mapa de «Sobre mí»

`src/components/ui/WorldMap.tsx` dibuja la silueta del mundo con un punto en la ciudad, bajo la terminal de la sección «Sobre mí». Es decorativo: el `<svg>` lleva `aria-hidden="true"` y `focusable="false"`, sin rol, título ni texto; no tiene interacción ni animación. La ubicación ya se dice en texto en la terminal.

## Proyección y cuadro

`src/lib/mapProjection.ts`:

- **Proyección equirectangular:** la longitud va lineal al eje X y la latitud al eje Y, con el norte arriba (`project`). Un punto fuera del recorte lanza `RangeError`.
- **Recorte:** `MAP_BOUNDS = { north: 84, south: -60, west: -180, east: 180 }`, sin la Antártida ni el Ártico extremo.
- **Cuadro:** `MAP_SIZE = { width: 1000, height: 400 }`. 360° de ancho y 144° de alto dan la misma escala en los dos ejes: 1000 / 360 = 400 / 144, unos 2,78 px por grado. Un test lo fija; con 1000×500, como decía un plan anterior, el mapa saldría estirado un 25 % en vertical.
- **Sin imports:** el script de generación usa este módulo tal cual con Node, sin el alias `@/`. Un test exige que no importe nada.

## La Antártida

La tierra al sur de 60° S se descarta entera. `scripts/generate-world-map.ts` (`polygonsInside`):

- quita los polígonos con todos los vértices al sur del recorte;
- falla si un polígono lo cruza a medias, en vez de recortarlo;
- conserva el resto solo si todos sus vértices caen dentro.

Por qué: la Antártida ocuparía una franja ancha y vacía de interés al pie del mapa y no aporta nada a un punto en Colombia. Además, su polígono en la fuente da la vuelta por los polos de −180° a 180°: es el único tramo de la fuente que cruza el antimeridiano y, dibujado, pintaría una raya horizontal de lado a lado. El script además falla si algún tramo del resultado mide más de medio cuadro.

Comprobado el 2026-10-14 sobre la fuente de la URL fijada, con su SHA-256 verificado y el mismo criterio de `polygonsInside`: 119 polígonos dentro del recorte, 8 enteros al sur y ninguno a medias. Los 119 suman 120 anillos, los mismos 120 subtrazados que tiene `src/data/worldMap.ts`: el redondeo no dejó ninguno sin dibujar. El script imprime esas cifras al ejecutarse.

## Fuente de la tierra

- **Datos:** Natural Earth 1:110m, tierra (`ne_110m_land.geojson`), del repositorio `nvkelso/natural-earth-vector`.
- **URL fijada a un commit**, tal como está en el script (`SOURCE_URL`):
  `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/693f11422f4e08d2da4566b854dda53eb7c39fb3/geojson/ne_110m_land.geojson`
- **Commit** (`SOURCE_COMMIT`): `693f11422f4e08d2da4566b854dda53eb7c39fb3`.
- **SHA-256 que verifica el script** (`SOURCE_SHA256`): `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9`.
- **Licencia: dominio público.** El script lo dice en un comentario con la URL de los términos de uso, https://www.naturalearthdata.com/about/terms-of-use/. La frase literal de esa página, comprobada el 2026-10-14 en https://www.naturalearthdata.com/about/terms-of-use/, es: «All versions of Natural Earth raster + vector map data found on this website are in the public domain.» En el HTML, «Natural Earth» va en cursiva (`<em>`).

El encabezado de `src/data/worldMap.ts` repite la URL, el commit, el SHA-256 y la fecha de generación (2026-10-14). `src/data/worldMap.test.ts` compara ese encabezado con las constantes del script, para que no se separen.

## Cómo regenerarlo

Desde la raíz del repo, con Node 24 y sin compilar (Node ejecuta el TypeScript quitando los tipos):

```bash
node scripts/generate-world-map.ts
```

- No forma parte del build ni de CI: se ejecuta a mano y `src/data/worldMap.ts` se commitea.
- Descarga la fuente de la URL fijada y comprueba su SHA-256. Si no coincide, o si la geometría no encaja (un polígono que cruza el recorte, un tramo de lado a lado, un tipo de geometría inesperado), escribe el error, «No se escribió src/data/worldMap.ts.» y sale con código 1, sin tocar el archivo.
- Es determinista: con la misma fuente y el mismo día, el resultado es idéntico byte a byte. Solo cambia la línea de la fecha.
- `scripts/` está fuera de las capas de `src/`: ESLint le permite importar por ruta relativa (Node no entiende `@/`) y `tsconfig.node.json` lo incluye en el typecheck.

## Peso

El path de `src/data/worldMap.ts` ocupa **21 027 bytes (20,5 KB)** y **5 482 bytes con gzip (5,4 KB)**. El tope es de **25 KB** (25 600 bytes) y lo fija `src/data/worldMap.test.ts`.

## Una sola figura rellena

La tierra es un solo `<path>` con 120 subtrazados: cada anillo empieza con `M` absoluto, sigue con tramos `l` relativos y cierra con `z`, con coordenadas enteras. El CSS lo rellena; no se dibuja el borde.

El mar Caspio es un agujero dentro del polígono de Afro-Eurasia. Sus dos anillos giran en sentidos opuestos, así que el relleno por defecto (`nonzero`) lo deja hueco sin necesidad de `fill-rule="evenodd"`. Comprobado el 2026-10-14 sobre `src/data/worldMap.ts`, con el área con signo (fórmula del lazo) de cada anillo en coordenadas absolutas: el del Caspio da −327 y el de Afro-Eurasia, el mayor, +68 975,5; signos opuestos, y un punto del Caspio cae dentro de Afro-Eurasia. No hay un test que lo fije.

## Coordenadas de la ciudad

- **Valor guardado:** solo el redondeado, en `src/config/site.ts`: `coordinates: { lat: 7.0, lon: -73.1 }`. Un decimal son unos 11 km: nivel de ciudad.
- **Fuente:** DIVIPOLA del DANE, corte al 30 de diciembre de 2024, conjunto «DIVIPOLA - Códigos cabeceras - Centros poblados» de datos.gov.co (`xaxy-8nri`), fila `68547000`, la cabecera municipal de Piedecuesta. Así lo anotan el comentario de `site.ts` y `src/config/site.about.test.ts`, que comprueba que el valor guardado es esa cabecera redondeada a un decimal.
- **Licencia del conjunto:** Creative Commons Attribution | Share Alike 4.0 International (`licenseId: CC_40_BY_SA`), comprobada el 2026-10-14 en los metadatos del conjunto: https://www.datos.gov.co/api/views/xaxy-8nri.json.
- **En pantalla:** `WorldMap` coloca el punto en `project(site.coordinates)`; no hay coordenadas de píxel escritas a mano. El radio es de 8 unidades del viewBox (`CITY_RADIUS`) y escala con el mapa.

## Colores

Solo tokens de `src/styles/tokens.css`, sin colores literales en el componente ni en su CSS (lo fijan sus tests):

- **Tierra:** `--color-map-land: rgba(0, 212, 255, 0.12)`, el cian de la paleta, translúcido como los bordes. Sobre `--color-bg` (`#08080f`) queda como `rgb(7, 32, 44)`, con un contraste de **1,19:1** frente al fondo. Es una decisión visual: se lee como silueta sin competir con el texto. Al ser decorativo, no se le aplica el mínimo de contraste de WCAG.
- **Punto:** `--color-accent-alt`, con un brillo fijo `drop-shadow(0 0 var(--map-city-glow) …)` del mismo verde al 30 %. `--map-city-glow` es `var(--hero-status-glow)` (0,5rem): el mismo brillo que el punto de estado del Hero. No hay pulso ni transición.

## Limitación conocida

El redondeo a enteros deja 10 picos en el contorno: 4 idas y vueltas al mismo punto y 6 retrocesos en línea recta. Recuento del 2026-10-14 sobre los 120 anillos de `src/data/worldMap.ts`: para cada vértice B con sus vecinos A y C (cíclicos), es ida y vuelta si A = C, y retroceso si A, B y C están en línea (producto vectorial 0) y C vuelve hacia A (producto escalar de AB y BC negativo). No tienen área, así que con el relleno no se ven. Solo importarían si algún día se dibujara el borde con trazo; entonces habría que limpiarlos en el script.

## Lo que el mapa no hace

No revela ni sugiere una dirección: la coordenada es la de la cabecera del municipio, redondeada a un decimal, y no señala ninguna calle ni vivienda. El mapa no tiene enlaces, no pide nada a terceros al cargarse (la geometría va dentro del bundle) y no se puede ampliar.
