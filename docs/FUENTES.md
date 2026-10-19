# Fuentes

Registro de las fuentes que sirve el sitio. Se alojan en `public/fonts/` y se declaran en `src/styles/fonts.css`; no se piden a Google Fonts ni a ningún otro tercero en ejecución (rediseño v2, spec §2).

## Origen y licencia

Las tres son de Google Fonts y llevan la **SIL Open Font License 1.1**, sin nombres de fuente reservados. Cada licencia va junto a los archivos, copiada sin cambios del paquete de origen.

| Familia | Uso | Pesos | Paquete de origen | Licencia |
|---|---|---|---|---|
| Anton | Títulos de escena, nombre, cifras | 400 | `@fontsource/anton` 5.3.0 | `public/fonts/OFL-anton.txt` (© 2020 The Anton Project Authors) |
| Manrope | Texto corrido y títulos secundarios | 400, 500, 700, 800 | `@fontsource/manrope` 5.3.0 | `public/fonts/OFL-manrope.txt` (© 2019 The Manrope Project Authors) |
| JetBrains Mono | Rótulos, numeración y código | 400, 600 | `@fontsource/jetbrains-mono` 5.3.0 | `public/fonts/OFL-jetbrains-mono.txt` (© 2020 The JetBrains Mono Project Authors) |

- Los paquetes de Anton y Manrope se descargaron con `npm pack` desde `registry.npmjs.org`, sin instalarlos. Los de JetBrains Mono salen del paquete que el proyecto ya tenía instalado.
- Tras copiarlos se retiraron `@fontsource/outfit` y `@fontsource/jetbrains-mono` de las dependencias: Outfit deja de usarse y los woff2 ya viven en el repo.
- Solo el subconjunto `latin`, que cubre el español. Los signos fuera de él (por ejemplo, `↗` y `✦`) salen de la fuente de respaldo.
- Anton y Manrope 400 se precargan en `index.html`.

## Archivos (SHA-256)

| Archivo | SHA-256 |
|---|---|
| `anton-latin-400-normal.woff2` | `d0fa07ff63dd60cbc0e2f58e29c802dca2a5ae0276c999f59c6111ab7bbaec3b` |
| `manrope-latin-400-normal.woff2` | `849290ef12a2eeb9af5c11924120d11aa4ae8b435ed3347d7fc8bc240c293ca3` |
| `manrope-latin-500-normal.woff2` | `19874318747181a650eda439c37955220b849d9c4797c9e0718ee67d4bf929bc` |
| `manrope-latin-700-normal.woff2` | `d2a12c85a831e4b5db341767d0347fa3d1361d22a1fcb3e361a16b6c90080f71` |
| `manrope-latin-800-normal.woff2` | `74c161dbcbce7c3590803cc72dc1f63313c360e13367aba5075a7b7b3818ea49` |
| `jetbrains-mono-latin-400-normal.woff2` | `14425ba9c695763c1547f48a206b7aa60350a33ae23de09f0407877f3fcd89eb` |
| `jetbrains-mono-latin-600-normal.woff2` | `400c6bfda18d5d14acad1c15d6dcb9f8e13c015e7286317e0b9a482539bef147` |
| `OFL-anton.txt` | `9267baca92b7a7ce9db6dd9e6cc32c9fe3ddf1ac96e421d5f87c5746b9089d6a` |
| `OFL-manrope.txt` | `d826ab6583b12c26807d8716a545bdbbb672df04f48608a364ba9efdbe501c30` |
| `OFL-jetbrains-mono.txt` | `403581b69dac5cff4079205e01c6b467e56af449ecbd7247693ddb1baafa005b` |
