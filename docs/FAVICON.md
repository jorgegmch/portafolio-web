# Favicon

Los iconos de `public/` se generan a partir de un solo PNG de `design/`. El script no es un archivo del repo: está copiado abajo, y basta para repetirlo.

## Fuente (`design/`)

| Archivo | Qué es | SHA-256 |
|---|---|---|
| `favicon-jg.png` | Diseño aportado por el autor: «JG» en Bone con su trazo naranja, anillo y `< >` en Signal, sobre un contenedor redondeado Ink. 512×512, RGBA, sin metadatos. Lleva un margen transparente de unos 30 px alrededor del contenedor. | `512c24cceaa052e57978f12c0abec68141d3033a87b7b0d370cd2a43b19fa3c7` |

No hay versión vectorial: el logo solo existe en mapa de bits, así que el sitio no tiene `favicon.svg`.

## Salidas (`public/`)

Las dos salidas recortan la fuente a la caja del contenedor redondeado, `(29, 30, 482, 483)`, sin el margen transparente.

| Archivo | Tamaños | Cómo | SHA-256 |
|---|---|---|---|
| `favicon.ico` | 16, 32 y 48 px | Recorte reducido con Lanczos; las esquinas quedan transparentes. | `a8a45855930a610f56d6f15c2c8fbe3a695ce64d1c8ffc95666b70d4074f1e6b` |
| `apple-touch-icon.png` | 180×180 px | Recorte con las esquinas rellenas de Ink (`#111113`), reducido con Lanczos y guardado en RGB, sin transparencia ni metadatos. | `9079fb5b08237f09baf39685c5c49ed99863a7d7a7df59440bfe766b973a7db0` |

No hay manifest ni iconos de 192 y 512 px. Ningún test comprueba estos hashes: se anotan para detectar un cambio a mano.

## Por qué sin margen

- **Pestaña:** Chrome pinta el favicon en un cuadro de 16 px. Con el margen de la fuente, el contenedor ocupaba 14×14 px y se veía pequeño; recortado llena el cuadro entero, como el favicon anterior. A 16 px el anillo y los `< >` no se distinguen; el autor prefirió conservar el diseño completo antes que una variante con solo las letras (2026-11-18).
- **iOS:** rellena de negro la transparencia y aplica su propia máscara. Con margen y esquinas transparentes se vería un marco negro alrededor del icono; por eso el `apple-touch-icon` va a sangre y sin transparencia.

## Regenerar

Requiere Python con Pillow, que no son dependencias del repo. Desde la raíz del repo:

```python
from PIL import Image

# Caja del contenedor redondeado dentro de design/favicon-jg.png: sin el margen transparente.
BOX = (29, 30, 482, 483)
INK = (0x11, 0x11, 0x13, 255)  # --color-ink

logo = Image.open('design/favicon-jg.png').convert('RGBA').crop(BOX)

# favicon.ico: 16, 32 y 48 px, con las esquinas transparentes.
sizes = [logo.resize((s, s), Image.LANCZOS) for s in (16, 32, 48)]
sizes[2].save('public/favicon.ico', format='ICO',
              sizes=[(16, 16), (32, 32), (48, 48)], append_images=sizes[:2])

# apple-touch-icon.png: 180 px, esquinas rellenas de Ink, en RGB y sin metadatos.
flat = Image.alpha_composite(Image.new('RGBA', logo.size, INK), logo)
flat.convert('RGB').resize((180, 180), Image.LANCZOS).save(
    'public/apple-touch-icon.png', format='PNG', optimize=True)
```

Con Pillow 12.1.0 reproduce las dos salidas byte a byte (comprobado el 2026-11-19). Otra versión puede comprimir distinto: si el hash cambia, se comparan los píxeles antes de dar el archivo por distinto.

## Al cambiar el logo

1. Sustituir `design/favicon-jg.png`. Si el contenedor cambia de sitio, medir de nuevo la caja: el rectángulo de los píxeles con alfa mayor que 128, llevado a un cuadrado centrado.
2. Regenerar las dos salidas y revisarlas a tamaño real: el `.ico` a 16 y 32 px en una pestaña, y el `apple-touch-icon` con una máscara redondeada.
3. Actualizar los tres hashes de este documento.
4. `index.html` no cambia si se conservan los nombres. `src/config/site.icons.test.ts` falla si algún `href` de icono apunta a un archivo que no existe en `public/`, o si se declara otro icono de pestaña además del `.ico`.
5. Chrome guarda el favicon en caché aunque se recargue la página: para verlo, una ventana de incógnito.

## Etiquetas de `index.html`

- `<link rel="icon" href="/favicon.ico" sizes="any" />`: el único icono de pestaña. `sizes="any"` viene del patrón `.ico` + SVG de web.dev («Building an adaptive favicon»), que el sitio usaba antes; sin SVG no cambia nada.
- `<link rel="apple-touch-icon" href="/apple-touch-icon.png" />`.
