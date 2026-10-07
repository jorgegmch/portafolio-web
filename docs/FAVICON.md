# Favicon

Los iconos de `public/` se generan a partir de los SVG de `design/`. El script que los generó no está en el repo: esta nota recoge lo necesario para repetirlo.

## Fuentes (`design/`)

| Archivo | Qué es |
|---|---|
| `favicon-jg.svg` | Logo detallado: contenedor redondeado, letras, anillo, trazos, nodos y glow. `viewBox` de 512×512. |
| `favicon-jg-simple.svg` | Solo las letras, ampliadas y algo más separadas, sin anillo, trazos, nodos ni glow. Para 48 px o menos, donde el detalle no se lee. |
| `favicon-jg-square.svg` | El detallado con el fondo cuadrado a sangre, sin esquinas redondeadas: iOS aplica su propia máscara. |

## Salidas (`public/`)

| Archivo | Fuente | Tamaños | Cómo |
|---|---|---|---|
| `favicon.svg` | `favicon-jg-simple.svg` | vectorial | Copia exacta del archivo. |
| `favicon.ico` | `favicon-jg-simple.svg` | 16, 32 y 48 px | Un PNG por tamaño con Chrome; Pillow los empaqueta en un `.ico`. |
| `apple-touch-icon.png` | `favicon-jg-square.svg` | 180×180 px | Un PNG con Chrome, guardado en RGB (sin transparencia) y sin metadatos. |

No hay manifest ni iconos de 192 y 512 px.

## Herramientas

- **Rasterizar:** Playwright (ya es dependencia de desarrollo) lanzando el Chrome instalado (`chromium.launch({ channel: 'chrome' })`). Para cada tamaño: una página con ese `viewport` y `deviceScaleFactor: 1`, el SVG incrustado en el HTML con `width` y `height` en píxeles, y `page.screenshot({ omitBackground: true })` para conservar la transparencia de las esquinas.
- **Empaquetar el `.ico`:** Pillow, con `save(..., format='ICO', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[...])`, pasando los PNG ya rasterizados para que no reescale ninguno.
- No hacen falta ImageMagick ni Inkscape, y no se añadió ninguna dependencia.

## Al cambiar el logo

1. Editar los SVG de `design/`; si cambia el detallado, repetir el cambio en el cuadrado.
2. Regenerar las tres salidas y revisar el simplificado a 16 y 32 px a tamaño real.
3. `index.html` no cambia si se conservan los nombres. `src/config/site.icons.test.ts` falla si algún `href` de icono apunta a un archivo que no existe en `public/`.

## Etiquetas de `index.html`

El `.ico` va primero y el SVG después: entre iconos igual de apropiados el navegador usa el último, y si no admite el formato pasa al siguiente (MDN, atributo `rel`). El patrón, con `sizes="any"` en el `.ico`, es el de web.dev («Building an adaptive favicon»).
