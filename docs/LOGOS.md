# Logos e iconos: política, procedencia y créditos

Registro de los logos de marca y los iconos que usa el sitio: qué permite cada marca, de dónde salió cada archivo y qué créditos faltan por escribir.

**Es un registro, no una autorización.** Las políticas de marca cambian. Antes de añadir o cambiar un logo se lee la política vigente en la fuente oficial de la marca, y después se actualiza esta nota con la fecha de lectura.

## Reglas de uso

- Un logo de marca se carga con `<img>`, sin modificar el archivo y sin filtros, opacidad, sombras ni mezclas.
- Si la marca no permite usar su logo, la tecnología va solo con su nombre o con un icono genérico: propio, o de un conjunto de licencia permisiva (CC0, MIT o ISC) verificada en su repositorio oficial.
- Cada archivo nuevo se anota aquí con su origen, su licencia y su SHA-256.
- **Interpretación del autor, no una cita:** rodear los logos de WhatsApp y LinkedIn con un círculo es la lectura que el autor hace de sus políticas de marca. Ninguna de las tres marcas de la fila de redes publica por escrito un espacio libre ni un tamaño mínimo; GitHub solo distribuye una variante con espacio libre.

## Política por marca

Leídas por el autor el 7 y el 8 de octubre de 2026.

### Logos que solo pueden ir como texto

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

- Logos de CSS, GitHub en el catálogo de tecnologías y Spring Security.
- Si la atribución va también visible en el sitio.

### Dónde irán los que hoy no se muestran

La sección de servicios listará todas las tecnologías del catálogo, con logo donde la marca lo permita y solo texto donde no. Ahí van Duke y n8n.

## Procedencia y SHA-256

El SHA-256 es el del archivo tal como está en el repo.

### Redes (`public/social/`)

Logos oficiales sin modificar, descargados por el autor de los paquetes oficiales tras aceptar él sus términos.

| Archivo | Origen | SHA-256 |
|---|---|---|
| `github.svg` | Invertocat blanco del paquete de GitHub | `ccd84c89b1056345608fc3489357f8acc7397e49a3cdc2d418b6c8016911d47b` |
| `linkedin.png` | `InBug-White.png`, 840×779 px | `ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791` |
| `whatsapp.svg` | `Digital_Glyph_White_RGB_2026.svg` | `7fb054c0f4bea644b4a4a014d6d8581aad7e6dcb639049d17a578dc44f8e6fd4` |

- **Excepción del comprobador de SVG:** el de WhatsApp trae un elemento `style`. Se admite solo en ese archivo y solo mientras su hash sea el oficial; el comprobador no se relaja para ningún otro.

### Tecnologías (`public/tech/`)

| Archivo | Origen y licencia, según consta en el archivo | SHA-256 |
|---|---|---|
| `duke.svg` | `vector/Wave.svg` de `github.com/openjdk/duke`. El repositorio no publica texto de licencia; Oracle afirma en dev.java/duke que Duke se abrió bajo licencia BSD. | `1f6f7cf2e7695c679ff573f7af605cbac526a9f148dc1ae4360330aa686ddb59` |
| `git.svg` | Git Logo, de Jason Long, CC BY 3.0. Fuente: git-scm.com/community/logos. | `61b00a713efa52e230f7c139f792e2f0b57947e56af9c7e6e38cc49d1da9a4df` |
| `html.svg` | HTML5 Logo, del W3C, CC BY 3.0. Fuente: w3.org/html/logo. | `15fee19d76890dfc5deac7e3180e45ab51efa94e5908b235af4a27165fe46815` |
| `javascript.svg` | Lleva dentro su aviso de licencia MIT, con los correos de sus autores. | `a70a3d8d36ea6b0e614a04ec30d5a4fb2bf36d515492cb84050ded2b84d14393` |
| `python.svg` | Sin comentario de procedencia en el archivo; su nombre interno es `python-logo-only.svg`. **Procedencia por anotar.** | `baec8662a1461c2cacc326b54d2727cb2f1ce07ba02d00f5b826d035104f649f` |
| `typescript.svg` | Sin comentario de procedencia en el archivo. **Procedencia por anotar.** | `139ae451b37a00251fe24358191699efa665f63f1c8369cb9dad833159e159e2` |

### Iconos genéricos (`public/icons/`)

Ninguno es un logo de marca.

| Archivo | Origen | Licencia | SHA-256 |
|---|---|---|---|
| `envelope.svg` | Dibujado para este sitio: un sobre cerrado, de trazo. | Obra propia | `e51bfb2484da7fb0290c815c7dcaf867104ffc5c6927480253f125e357391a98` |
| `database.svg` | Dibujado para este sitio: un cilindro apilado, de trazo. | Obra propia | `3e4712703731686d594ac307eb8bb275061b14be3e2dee1d55c7c4041af2bdf1` |
| `ai-agents.svg` | `raw-svg/microchip-ai.svg` de `github.com/primefaces/primeicons`, versión 7.0.0. El dibujo no se modificó; solo se le añadió el comentario de procedencia y la licencia. | MIT, © 2018-2021 PrimeTek | `3fc8ee8a861362387f6530aafffee1282bbde09aa145c496c6ec0927cfd6393b` |

- **SHA-256 del original de PrimeIcons,** antes de añadirle el comentario: `6d1c4d3c14d6a55d8126f35daa3016e1d54da26a5bb3ece1a66688d9ebd88bf1`. Un test compara el dibujo con ese original.
- **El repositorio de PrimeIcons está archivado.** Las versiones publicadas bajo MIT siguen siendo MIT.

## Créditos pendientes

Falta escribir un archivo de créditos en `docs/` con:

- Git (Jason Long, CC BY 3.0);
- JavaScript (aviso MIT);
- HTML5 (W3C, CC BY 3.0);
- PrimeIcons (MIT, PrimeTek);
- Duke: citar las dos páginas de Oracle (dev.java/duke y el PDF de marca de Java) y dejar claro que su repositorio no incluye texto de licencia.

**Deuda de Duke:** reintentar la wiki del proyecto y el repositorio Mercurial antiguo para fijar el texto BSD exacto.
