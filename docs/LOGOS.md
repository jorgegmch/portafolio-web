# Logos e iconos: política, procedencia y créditos

Registro de los logos de marca y los iconos que usa el sitio: qué permite cada marca, de dónde salió cada archivo y qué créditos faltan por escribir.

**Es un registro, no una autorización.** Las políticas de marca cambian. Antes de añadir o cambiar un logo se lee la política vigente en la fuente oficial de la marca, y después se actualiza esta nota con la fecha de lectura.

## Reglas de uso

- **Rediseño v2 (spec §6):** se retiró la rejilla «Mi stack tecnológico», y con ella los logos de tecnologías de `public/tech/` y la copia blanca del chip de AI Agents. Las tecnologías se nombran solo en texto. Los únicos logos de marca que quedan son los de redes (`public/social/`).
- **Rediseño v2, limpieza (2026-11-10):** se retiraron los iconos genéricos de `public/icons/` (el sobre, la base de datos y el chip de AI Agents), que usaban la fila de redes y las pastillas del Hero, ya retiradas. De `public/social/` solo se usa `github.svg`; `linkedin.png` y `whatsapp.svg` siguen en el repo sin uso, pendientes de decisión del autor.
- **Decisión del autor (2026-10-15), sin efecto mientras no vuelvan los logos de tecnologías:** todas las tecnologías del catálogo llevaban su logo oficial, aunque la política de su marca no lo permitiera. El autor asumía el riesgo.
- **De dónde sale cada logo,** en este orden:
  1. el archivo oficial de la marca, con fondo transparente;
  2. si no lo hay, el glifo de Simple Icons 16.35.0 (CC0 1.0, verificada en su `LICENSE.md`), en el color de marca de sus datos;
  3. un icono genérico solo para lo que no es una marca (AI Agents): propio, o de un conjunto de licencia permisiva (CC0, MIT o ISC) verificada en su repositorio oficial.
- Un logo de marca se carga con `<img>`, sin modificar el archivo y sin filtros, opacidad, sombras ni mezclas.
  - **Única excepción a «sin modificar»:** los glifos de Simple Icons se publican sin color, y aquí llevan añadido el `fill` de su color de marca. De cada uno se anotan el SHA-256 del original y el del archivo modificado, y un test compara el dibujo con el original.
- **Cómo se ven:** a su color original, sin fondo ni placa detrás. Sin siluetas blancas, salvo GitHub, que en negro no se ve: usa el Invertocat blanco de `public/social/`. Si un logo no se lee sobre el fondo oscuro, se avisa al autor con su color de marca; no se cambia por cuenta propia.
- Cada archivo nuevo se anota aquí con su origen, su licencia y su SHA-256.
- **Interpretación del autor, no una cita:** rodear los logos de WhatsApp y LinkedIn con un círculo es la lectura que el autor hace de sus políticas de marca. Ninguna de las tres marcas de la fila de redes publica por escrito un espacio libre ni un tamaño mínimo; GitHub solo distribuye una variante con espacio libre.

## Política por marca

Leídas por el autor el 7 y el 8 de octubre de 2026.

### Marcas cuya política no permite el logo

Hoy no se publica ninguno de estos logos: se retiraron con la rejilla del stack (ver «Reglas de uso»). La lectura queda anotada por si vuelven.

| Marca | Motivo anotado |
|---|---|
| Java (la taza) | Exige licencia comercial escrita. |
| MySQL | Exige que el logo sea un enlace. |
| n8n | Sin permiso expreso publicado. |
| React | Exige permiso escrito de Meta. |
| Docker | Exige autorización. |
| Spring Boot | El autor no ha leído sus condiciones. |
| PostgreSQL | Sin motivo anotado. |

### Sin decidir

- Si la atribución va también visible en el sitio.

## Procedencia y SHA-256

El SHA-256 es el del archivo tal como está en el repo.

### Redes (`public/social/`)

Logos oficiales sin modificar, descargados por el autor de los paquetes oficiales tras aceptar él sus términos.

| Archivo | Origen | SHA-256 |
|---|---|---|
| `github.svg` | Invertocat blanco del paquete de GitHub | `ccd84c89b1056345608fc3489357f8acc7397e49a3cdc2d418b6c8016911d47b` |
| `linkedin.png` | `InBug-White.png`, 840×779 px | `ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791` |
| `whatsapp.svg` | `Digital_Glyph_White_RGB_2026.svg` | `7fb054c0f4bea644b4a4a014d6d8581aad7e6dcb639049d17a578dc44f8e6fd4` |

- **Dónde se usa `github.svg`:** delante de «Ver todos en GitHub», en Proyectos, con `<img>` decorativo (`alt=""`) y sin filtros. Hash comprobado el 2026-10-24: coincide con el de la tabla.
- **Excepción del comprobador de SVG:** el de WhatsApp trae un elemento `style`. Se admite solo en ese archivo y solo mientras su hash sea el oficial; el comprobador no se relaja para ningún otro.

### Iconos en línea

Van dibujados dentro del código, no como archivos de `public/`, así que no llevan SHA-256.

- `src/components/ui/ServiceIcon.tsx`: los dibujos de las filas de Servicios (spec §3.3). Obra propia, de trazo.

## Créditos pendientes

Ninguno. Los de Git, JavaScript, HTML5, Duke y PrimeIcons dejaron de hacer falta al retirarse sus logos e iconos.
