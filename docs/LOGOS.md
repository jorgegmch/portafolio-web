# Logos e iconos: política, procedencia y créditos

Registro de los logos de marca y los iconos que usa el sitio: qué permite cada marca, de dónde salió cada archivo y qué créditos faltan por escribir.

**Es un registro, no una autorización.** Las políticas de marca cambian. Antes de añadir o cambiar un logo se lee la política vigente en la fuente oficial de la marca, y después se actualiza esta nota con la fecha de lectura.

## Reglas de uso

- **Rediseño v2.1 (spec §3.1 y §3.2):** los logos de tecnología van **solo** en «Mi stack» (Perfil) y en las fichas «// stack principal» del Hero, cada uno en una ficha Tile. La cinta del Hero y los chips de Proyectos van sin logos, solo con texto. Los logos de GitHub, LinkedIn y WhatsApp no son de tecnología y van en sus botones.
- **Rediseño v2.1 (2026-11-11):** los archivos de `public/tech/` y el chip blanco de AI Agents vuelven del historial (`f52f2c3^`), idénticos byte a byte a los que se retiraron con la rejilla del stack; sus hashes son los de la tabla.
- **Rediseño v2, limpieza (2026-11-10):** se retiraron los iconos de la fila de redes y de las pastillas del Hero (el sobre, la base de datos y el chip negro de AI Agents). De `public/social/` solo se usaba `github.svg`; `linkedin.png` y `whatsapp.svg` vuelven a usarse en el rediseño v2.1 (Contacto y pie).
- **Decisión del autor (2026-10-15):** todas las tecnologías del catálogo llevan su logo oficial, aunque la política de su marca no lo permita. El autor asume el riesgo. La política de cada marca se sigue leyendo y anotando aquí, pero ya no decide si va el logo.
- **De dónde sale cada logo,** en este orden:
  1. el archivo oficial de la marca, con fondo transparente;
  2. si no lo hay, el glifo de Simple Icons 16.35.0 (CC0 1.0, verificada en su `LICENSE.md`), en el color de marca de sus datos;
  3. un icono genérico solo para lo que no es una marca (AI Agents): propio, o de un conjunto de licencia permisiva (CC0, MIT o ISC) verificada en su repositorio oficial.
- Un logo de marca se carga con `<img>`, sin modificar el archivo y sin filtros, opacidad, sombras ni mezclas.
  - **Única excepción a «sin modificar»:** los glifos de Simple Icons se publican sin color, y aquí llevan añadido el `fill` de su color de marca. De cada uno se anotan el SHA-256 del original y el del archivo modificado, y un test compara el dibujo con el original.
- **Cómo se ven:** a su color original, sin fondo ni placa detrás; la ficha que los contiene sí lleva su fondo oscuro (Tile). Sin siluetas blancas, salvo GitHub, que en negro no se ve: usa el Invertocat blanco de `public/social/`. Si un logo no se lee sobre el fondo oscuro, se avisa al autor con su color de marca; no se cambia por cuenta propia.
- **CSS sobre la ficha Tile (decisión del autor, 2026-11-11):** el glifo de CSS (`#663399`) da 1,9:1 sobre Tile (`#222024`), por debajo del 3:1 de los gráficos. Se deja así: el nombre va al lado de la ficha y lleva la información; el logo es apoyo. Los demás medidos sobre Tile: MySQL 3,5:1 y Docker 3,2:1; el resto, por encima.
- **Java:** Duke por ahora. La taza no tiene descarga oficial; si el autor la consigue, se cambia.
- **Git y GitHub** van en una sola ficha, con el logo de Git (decisión del autor, 2026-10-15).
- **Redes sobre el panel Signal de Contacto (decisión del autor, 2026-11-11):** el autor pasará las variantes negras oficiales de GitHub, LinkedIn y WhatsApp. Mientras tanto, los botones llevan las blancas de `public/social/` (3,1:1 sobre Signal). Si una marca no tiene variante negra oficial, se queda la blanca.
- Cada archivo nuevo se anota aquí con su origen, su licencia y su SHA-256.
- **Interpretación del autor, no una cita:** rodear los logos de WhatsApp y LinkedIn con un círculo es la lectura que el autor hace de sus políticas de marca. Ninguna de las tres marcas de la fila de redes publica por escrito un espacio libre ni un tamaño mínimo; GitHub solo distribuye una variante con espacio libre.

## Política por marca

Leídas por el autor el 7 y el 8 de octubre de 2026.

### Marcas cuya política no permite el logo

Se usa igualmente, por la decisión del autor del 2026-10-15 (ver «Reglas de uso»).

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
- **Pendiente, Python y TypeScript:** sus políticas de marca no constan aquí; se leen en su fuente oficial y se anotan.

## Procedencia y SHA-256

El SHA-256 es el del archivo tal como está en el repo.

### Redes (`public/social/`)

Logos oficiales sin modificar, descargados por el autor de los paquetes oficiales tras aceptar él sus términos.

| Archivo | Origen | SHA-256 |
|---|---|---|
| `github.svg` | Invertocat blanco del paquete de GitHub | `ccd84c89b1056345608fc3489357f8acc7397e49a3cdc2d418b6c8016911d47b` |
| `linkedin.png` | `InBug-White.png`, 840×779 px | `ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791` |
| `whatsapp.svg` | `Digital_Glyph_White_RGB_2026.svg` | `7fb054c0f4bea644b4a4a014d6d8581aad7e6dcb639049d17a578dc44f8e6fd4` |

- **Dónde se usan:** siempre con `<img>` decorativo (`alt=""`), sin filtros, delante del texto que nombra la red. Los tamaños naturales están en `src/data/socialMarks.ts`.
  - `github.svg`: «Ver todos en GitHub» y «Ver código» de cada tarjeta, en Proyectos; la píldora de GitHub de los canales de Contacto. Hash comprobado el 2026-10-24: coincide con el de la tabla.
  - `linkedin.png`: la píldora de LinkedIn de los canales de Contacto.
  - `whatsapp.svg`: la píldora de WhatsApp de los canales de Contacto.
- **Sobre de «Copiar correo»:** no es un logo: va dibujado en línea en `src/components/sections/Contact.tsx`, con la forma del tablero.
- **Excepción del comprobador de SVG:** el de WhatsApp trae un elemento `style`. Se admite solo en ese archivo y solo mientras su hash sea el oficial; el comprobador no se relaja para ningún otro.

### Tecnologías (`public/tech/`)

| Archivo | Origen y licencia, según consta en el archivo | SHA-256 |
|---|---|---|
| `duke.svg` | `vector/Wave.svg` de `github.com/openjdk/duke`. El repositorio no publica texto de licencia; Oracle afirma en dev.java/duke que Duke se abrió bajo licencia BSD. | `1f6f7cf2e7695c679ff573f7af605cbac526a9f148dc1ae4360330aa686ddb59` |
| `git.svg` | Git Logo, de Jason Long, CC BY 3.0. Fuente: git-scm.com/community/logos. | `61b00a713efa52e230f7c139f792e2f0b57947e56af9c7e6e38cc49d1da9a4df` |
| `html.svg` | HTML5 Logo, del W3C, CC BY 3.0. Fuente: w3.org/html/logo. | `15fee19d76890dfc5deac7e3180e45ab51efa94e5908b235af4a27165fe46815` |
| `javascript.svg` | Lleva dentro su aviso de licencia MIT, con los correos de sus autores. | `a70a3d8d36ea6b0e614a04ec30d5a4fb2bf36d515492cb84050ded2b84d14393` |
| `python.svg` | `python-logo-only.svg`, de python.org/community/logos. Idéntico byte a byte al oficial, según `src/data/brandLogos.test.ts`; el archivo no lleva comentario de procedencia. Licencia: no consta. | `baec8662a1461c2cacc326b54d2727cb2f1ce07ba02d00f5b826d035104f649f` |
| `typescript.svg` | `ts-logo-512.svg`, de typescriptlang.org/branding. Idéntico byte a byte al oficial, según `src/data/brandLogos.test.ts`; el archivo no lleva comentario de procedencia. Licencia: no consta. | `139ae451b37a00251fe24358191699efa665f63f1c8369cb9dad833159e159e2` |
| `mysql.svg` | Simple Icons 16.35.0, `icons/mysql.svg`, CC0 1.0. Lleva añadidos el comentario de procedencia y `fill="#4479A1"`, su color de marca en los datos de Simple Icons. SHA-256 del original: `67c144cc3e44ad14062a3f20ebe29c5e7eeb2c2c9c0f43cf48d87fe6291a8b2d`. | `bbbc657d92a187a219ce5aa016a4b8c115774c52bac7e6510f695da0b7226f7a` |
| `react.svg` | Simple Icons 16.35.0, `icons/react.svg`, CC0 1.0. Lleva añadidos el comentario de procedencia y `fill="#61DAFB"`, su color de marca en los datos de Simple Icons. SHA-256 del original: `ab9136a1a4a8be72ac6743e1bdd1912d878bd68d57787ea7a6c6838e3b23c01c`. | `060d2776249190bc235c9b97fabffb2922c341a1c58b08df713633b6f6ffb60c` |
| `n8n.svg` | Simple Icons 16.35.0, `icons/n8n.svg` (solo el símbolo), CC0 1.0. Lleva añadidos el comentario de procedencia y `fill="#EA4B71"`, su color de marca en los datos de Simple Icons. SHA-256 del original: `f5a606188c78bf134fe7d85ae3d1310f6f4b7beafcd1d2fbdef2af02c92240a8`. | `2e6bba9f08c65aca92e9e59d57341b4171faea5bf375da6d47f180b7402c430f` |
| `spring-boot.svg` | `https://spring.io/img/projects/spring-boot.svg`, descargado el 2026-10-15. Idéntico byte a byte al oficial. Licencia: no consta. Trae un `<style>` propio, admitido solo en este archivo (`ALLOWED_STYLE` de `src/data/brandLogos.test.ts`). | `8f9ccd66abde74dd74fde03541f4295bf5e55242b502167b38deeb6bee69c145` |
| `spring-security.svg` | `https://spring.io/img/projects/spring-security.svg`, descargado el 2026-10-15. Idéntico byte a byte al oficial. Licencia: no consta. Trae un `<style>` propio, admitido solo en este archivo (`ALLOWED_STYLE`). | `96afd13b56af0eac6a96fcedcac63d4274fa15655e2b713428041e7cfae9d91b` |
| `postgresql.svg` | `PostgreSQL_logo.3colors.svg`, de `wiki.postgresql.org` (`/images/a/a4/`), descargado el 2026-10-15. Licencia: no consta (la página del archivo la deja en «?»). El oficial trae CRLF en sus 21 líneas, y el repo no admite CR: aquí va con LF, como HTML5, y nada más cambia. SHA-256 del oficial con CRLF: `51f93e19516081fc7d6fe6ab9bbab07abe5f7819e28016eefacea6dea691bc54`; un test le devuelve el CRLF y obtiene ese hash. Trae un DOCTYPE público de SVG 1.1, sin subconjunto interno, admitido solo en este archivo (`ALLOWED_DOCTYPE`). | `fe85bc84bce23d01bfe7e8c21715a21b5c011f6e2e1b7b431a8079ce6e4765cc` |
| `docker.svg` | `SVG/docker-mark-ocean-blue.svg` del kit oficial `https://www.docker.com/static/Docker-Logos-1.zip`, descargado el 2026-10-15: solo el símbolo, que la guía de Docker admite como logo secundario. Idéntico byte a byte al oficial. Licencia: no consta. Trae un `<style>` propio, admitido solo en este archivo (`ALLOWED_STYLE`). | `0fd7f9164de13672bb1708ac7cc401ed439eb938ffa7358d5cb278e107904687` |
| `css.svg` | Simple Icons 16.35.0, `icons/css.svg`, CC0 1.0. Lleva añadidos el comentario de procedencia y `fill="#663399"`, su color de marca en los datos de Simple Icons. No se confirmó que el logo de CSS-Next sea oficial: por la regla de uso, va el de Simple Icons. SHA-256 del original: `9a97b95e3207aa4a6545dbb862e22450a01f37201c00e6b7d9c2958b59ca9ff9`. | `880bbeabbc51125c09d6dd25445f6546ded9f7b334c914bea32bf3af6cfd9084` |

- **Dónde se usan:** en las fichas de «Mi stack» (las 15 tecnologías del catálogo) y en las seis fichas «// stack principal» del Hero (Java, Spring Boot, PostgreSQL, Docker, n8n y Python), con `<img>` decorativo (`alt=""`): el nombre va al lado en texto.
- **Excepción del dominio en `javascript.svg`:** su aviso MIT trae correos de terceros, y uno usa el mismo proveedor que el correo del autor. Está anotada en `.claude/rules/contacto.md`.

### Iconos genéricos (`public/icons/`)

Ninguno es un logo de marca.

| Archivo | Origen | Licencia | SHA-256 |
|---|---|---|---|
| `ai-agents-white.svg` | `raw-svg/microchip-ai.svg` de `github.com/primefaces/primeicons`, versión 7.0.0, en blanco para la ficha oscura. El relleno pasa de negro a blanco y se añade el comentario de procedencia y la licencia; el dibujo no cambia. | MIT, © 2018-2021 PrimeTek | `c4c696b5d431a690a1669bc52244b1f12d9e3d66c2526836c4c6012f098244f4` |

- **SHA-256 del original de PrimeIcons,** en negro y antes de añadirle el comentario: `6d1c4d3c14d6a55d8126f35daa3016e1d54da26a5bb3ece1a66688d9ebd88bf1`. `src/data/stackIcons.test.ts` le devuelve el relleno negro y compara el dibujo con ese original.
- **El repositorio de PrimeIcons está archivado.** Las versiones publicadas bajo MIT siguen siendo MIT.

### Iconos en línea

Van dibujados dentro del código, no como archivos de `public/`, así que no llevan SHA-256.

- `src/components/ui/ServiceIcon.tsx`: los dibujos de las filas de Servicios (spec §3.3). Obra propia, de trazo.

## Créditos pendientes

Falta escribir un archivo de créditos en `docs/` con:

- Git (Jason Long, CC BY 3.0);
- JavaScript (aviso MIT);
- HTML5 (W3C, CC BY 3.0);
- PrimeIcons (MIT, PrimeTek);
- Duke: citar las dos páginas de Oracle (dev.java/duke y el PDF de marca de Java) y dejar claro que su repositorio no incluye texto de licencia.

**Deuda de Duke:** reintentar la wiki del proyecto y el repositorio Mercurial antiguo para fijar el texto BSD exacto.
