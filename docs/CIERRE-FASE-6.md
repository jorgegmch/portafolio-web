# Cierre de la Fase 6 — lista de pendientes (borrador)

Archivo temporal. Reúne lo anotado durante el Hero y existe solo hasta cerrar la Fase 6, o hasta que deje de ser necesario. Al ejecutar `/close-phase 6`, su contenido vigente se reparte entre `docs/PLAN.md` y `docs/MEMORY.md` y el archivo se borra en el mismo commit `docs` de cierre. Hasta entonces nada de esto consta en esos dos archivos.

Las medidas se tomaron en Chrome contra el build, en español e inglés. No se comprobó Safari, Firefox ni un dispositivo físico. Los datos personales se nombran por su campo, nunca por su valor.

## Estado

- La Fase 6 sigue abierta: solo está hecho el Hero, y sin el botón «Descargar CV».
- La rama `rebuild/vite-react` no se sube mientras contenga la foto provisional.

## Encargos aprobados que aún no se ejecutan

- [ ] **«Descargar CV»:** commit propio de la Fase 6, cuando existan los 4 PDFs. El botón solo se renderiza si el registro de CVs tiene los archivos; ningún enlace roto. Lo que lleve el CV (teléfono, correo) queda descargable por cualquiera una vez publicado.
- [ ] **Cuatro comandos manuales:** `/update-hero-intro`, `/update-hero-photo`, `/update-hero-cv` y `/update-hero-social`, con la convención de `.claude/skills/pre-push-check`. Primero la propuesta por escrito; después una prueba real de cada uno (el de la descripción con un texto de prueba que se revierte, el de la foto con la foto actual, el de los CV con PDFs de prueba sin datos reales y fuera del repo). El cierre debe documentarlos.
- [ ] **`/update-hero-photo`:** no versiona el script de exportación; describe los pasos y las herramientas, sin añadir código ni dependencias.
- [ ] **Ampliar `pre-push-check` a los PDFs:** solo la propuesta; sus búsquedas de texto no ven dentro de binarios.
- [ ] **Foto real** en lugar de la provisional, con `/update-hero-photo`, antes del push final.
- [ ] **Limpieza ofrecida y no aprobada:** retirar el texto corto del estado y el corte de 380 px (ver «Estado de disponibilidad»).
- [ ] **Borrar este archivo** en el cierre de la Fase 6, tras repartir su contenido.

## Sección de contacto de la Fase 6: cambio de decisión

- **Qué cambia:** la sección de contacto mostrará el correo y el teléfono visibles, con un llamado a la acción («si tienes un proyecto en mente, hablemos»), la ubicación a nivel de ciudad y el tiempo de respuesta.
- **Con qué choca:** con la regla «nunca al renderizar» de `AGENTS.md` y de `.claude/rules/contacto.md`, y con la decisión de `docs/MEMORY.md` de que el contacto es un botón que se ensambla al interactuar.
- **También en los PDFs del CV:** el correo y el teléfono irán además dentro de los PDFs que descarga el botón «Descargar CV».
- **A qué afecta el cambio:** a `AGENTS.md` (la línea «Nunca» de datos personales y la comprobación previa al push), a `.claude/rules/contacto.md`, a la decisión de contacto de `docs/MEMORY.md` y a la skill `pre-push-check`.
- **Antes de empezar esa sección:** se propone por escrito qué reglas y qué tests cambian y se espera la aprobación del autor. La edición de reglas va en su propio commit. Hasta entonces no se edita ninguna regla.
- **Lo que se mantiene:** el dato codificado en `src/config/contact.ts` y el grep sobre `dist/` con su control positivo. No se añade ninguna protección nueva.
- **Tiempo de respuesta:** si se publica, va como interruptor en `src/config/`.
- **Formulario:** `PLAN.md` dice «sin formulario». El de la referencia del autor sería un cambio de decisión y una petición a terceros: se le pregunta en esa fase; no se propone por defecto.
- **Textos del llamado a la acción:** se muestran al autor antes de commitear.

## Hero: decisiones tomadas

### Botón y textos

- **«Ver proyectos»** enlaza al ancla de proyectos, que está vacía hasta que exista esa sección.
- **`hero.tagline`** («Where code meets storytelling.», igual en los dos idiomas) sigue en el diccionario sin mostrarse. Falta decidir su destino; no se borra sin aprobación.
- **Línea de rol:** va bajo el nombre y sale de `site.role`; `site.status` se retiró.

### Estado de disponibilidad

- **Interruptor:** `AVAILABLE_FOR_FREELANCE` en `src/config/availability.ts`. Con `false` el estado no se renderiza ni deja hueco. Los textos viven en `hero.availability` de los diccionarios.
- **Oculto en teléfono:** hasta 480 px lleva `display: none`, así que tampoco entra en el árbol de accesibilidad. El autor aceptó que no se vea ahí.
- **Texto corto sin uso:** «Freelance disponible» solo se mostraba hasta 380 px, y en ese tramo el estado ya está oculto. La clave `hero.availabilityShort`, el corte de 380 px de `tokens.css` y sus tests siguen en el repo sin efecto. El corte se midió en 374 px y se dejó en 380 por margen.
- **Brillo del punto:** usa `color-mix`. Su soporte en navegadores no se verificó.

### Fila de redes y contacto

- **Orden y contenido:** GitHub, LinkedIn, correo y WhatsApp, con tope de 5. El registro está en `src/data/social.ts`. LinkedIn y GitHub reutilizan los enlaces de `site.social`, los mismos del pie.
- **Textos aprobados:** grupo «Redes y contacto» / «Social and contact»; «GitHub»; «LinkedIn»; «Enviar un correo» / «Send an email»; «Escribir por WhatsApp» / «Message on WhatsApp». Los enlaces y WhatsApp añaden el aviso de que abren en una pestaña nueva.
- **Correo y WhatsApp** van por `ContactButton` y se ensamblan en el clic, sin mostrar texto.
- **Contenedor:** círculo de 44 px con borde de 1 px en `--color-text-subtle` y logo de 24 px. El borde usa un token de texto por decisión del autor; al pasar el puntero o recibir el foco cambia a `--color-accent-alt`.
- **Interpretación del autor, no una cita:** rodear los logos de WhatsApp y LinkedIn con un círculo es la lectura que el autor hace de sus políticas de marca. Ninguna de las tres marcas publica por escrito un espacio libre ni un tamaño mínimo; GitHub solo distribuye una variante con espacio libre.
- **Sobre es un icono propio,** genérico, en `public/icons/envelope.svg`, trazado en `--color-text`. No es un logo de marca.
- **Logos oficiales sin modificar,** cargados con `<img>` y sin filtros ni opacidad, descargados por el autor de los paquetes oficiales tras aceptar él sus términos:

| Archivo | Origen | SHA-256 |
|---|---|---|
| `public/social/github.svg` | Invertocat blanco del paquete de GitHub | `ccd84c89b1056345608fc3489357f8acc7397e49a3cdc2d418b6c8016911d47b` |
| `public/social/linkedin.png` | `InBug-White.png`, 840×779 px | `ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791` |
| `public/social/whatsapp.svg` | `Digital_Glyph_White_RGB_2026.svg` | `7fb054c0f4bea644b4a4a014d6d8581aad7e6dcb639049d17a578dc44f8e6fd4` |

- **Excepción del comprobador de SVG:** el de WhatsApp trae un elemento `style`. Se admite solo en ese archivo y solo mientras su hash sea el oficial; el comprobador no se relaja para ningún otro.

### Comportamiento esperado en la verificación del contacto

- **`wa.me` y `mailto:` aparecen una vez en el JS de `dist/`.** Es lo que exige el control positivo de `.claude/rules/contacto.md`; no es una fuga. Buscar esos prefijos esperando cero da un falso fallo.
- **`public/tech/javascript.svg` contiene correos de terceros** dentro de su aviso de licencia MIT. `pre-push-check` los admite por nombre de archivo; no son datos del autor.
- **El correo de contacto cambió** en `src/config/contact.ts` (commit `c35c60b`), con el mismo codificado. Ningún test fijaba el valor.

### Pastillas, logos y atribuciones

- **Pastillas del Hero:** Python, Java (Duke), TypeScript, PostgreSQL y «AI Agents»; las dos últimas con icono genérico propio.
- **«AI Agents»** se sostiene en dos proyectos: «n8n Daily News Agent» y «LogiTrack IQ». Cuando se construya la sección de proyectos, la tarjeta de LogiTrack IQ debe nombrar el agente de IA en su descripción visible.
- **Icono de robot:** puede revisarse.
- **Logos que solo pueden ir como texto,** según las políticas leídas el 7 y el 8 de octubre de 2026: la taza de Java (exige licencia comercial escrita), MySQL (exige que el logo sea un enlace), n8n (sin permiso expreso publicado), React (permiso escrito de Meta), Docker (exige autorización), Spring Boot (el autor no ha leído sus condiciones) y PostgreSQL.
- **Sin decidir:** logos de CSS, GitHub en el catálogo y Spring Security.
- **Sección de servicios:** listará todas las tecnologías del catálogo, con logo donde la marca lo permita y solo texto donde no. Ahí van Duke y n8n.
- **Archivo de créditos en `docs/`, por escribir:** Git (Jason Long, CC BY 3.0), JavaScript (aviso MIT), HTML5 (W3C, CC BY 3.0) y Duke. Para Duke, citar las dos páginas de Oracle (dev.java/duke y el PDF de marca de Java) y dejar claro que su repositorio no incluye texto de licencia.
- **Deuda de Duke:** reintentar la wiki del proyecto y el repositorio Mercurial antiguo para fijar el texto BSD exacto.
- **Sin decidir:** si la atribución va también visible en el sitio.

### Foto

- **Provisional:** el retrato actual es una foto personal provisional del autor (commit `f7c0c79`), que sustituyó al avatar ilustrado del principio. Por eso la rama no se sube todavía.
- **Pendiente:** reemplazarla por la foto real con `/update-hero-photo`, antes del push final.
- **Peso:** 431,6 kB en cuatro archivos WebP de `src/assets/hero/`. A revisar con Lighthouse en la Fase 8.

| Archivo | Peso |
|---|---|
| `portrait-576.webp` | 48,9 kB (48 896 bytes) |
| `portrait-800.webp` | 76,4 kB (76 372 bytes) |
| `portrait-1152.webp` | 127,5 kB (127 464 bytes) |
| `portrait-1472.webp` | 178,8 kB (178 836 bytes) |

## Límites aceptados

Son límites del diseño aprobado, no tareas.

### Dos columnas (desde 1024 px)

- **Pelo a la barra:** 57 px a 1024, 52 a 1040, 47 a 1056, 42 a 1072, 37 a 1088 y 32 px de 1104 a 1920, a 768 y 900 px de alto. Sin salto entre 1280 y 1281.
- **Ventanas de 600 px de alto:** el pelo queda a 57 px a 1024, entre 32 y 56 hasta 1280 y a 120 px desde 1312, con un salto de 56 a 89 entre 1280 y 1281. No se toca el escritorio aprobado.
- **Figura–párrafo** (español / inglés): 70 / 52 px a 1024, 65 / 62 a 1152, 131 / 129 a 1280, 127 / 125 a 1281.
- **Saludo a la barra:** 43 px como mínimo.

### Apilado y teléfono

- **Cara cortada en la primera pantalla:** 123 px a 320×640 y 13 px a 360×740; 0 a 390×844 y a 480×800.
- **Justo por encima de 480 px:** 79 px a 481×800, porque vuelven el estado y los márgenes de tablet.
- **1023×768:** 182 px. El límite anterior era 114; la diferencia viene de la fila de redes.
- **Teléfono en horizontal:** una pastilla tapa la cara entre 7 y 11 px a 740×360, 844×390, 667×375 y 568×320. Alternativa si se quiere resolver: quitar el tope por alto del retrato.
- **Viewport fraccionario:** no se pudo reproducir con zoom. Un ancho de 1023,6 px recibiría dos columnas, que a 1023 funcionan.
- **Densidad 3:** a 768 y 820 px el retrato se amplía ×1,17 con el archivo mayor, de 1472 px.

## Fuera del Hero

- **Barra de navegación, 320 px:** el botón de idioma salta a una segunda fila y queda a 1 px del saludo. Es del componente de navegación.
- **Barra de navegación, de unos 780 a 912 px:** se parte en dos filas. También es del componente de navegación.
- **Fondo de partículas:** tras redimensionar varias veces la ventana, las partículas se alinearon en una columna vertical. Con recarga limpia no pasa. Sin investigar.
- **Pie a 1440×900:** quedaba 23 px bajo la primera pantalla. No se volvió a medir después de los cambios del Hero.

## Proceso y herramientas

- **Sin Prettier:** el repo se formatea a mano (comillas simples, sin punto y coma). No se formatean archivos enteros; solo se aplican las líneas del commit.
- **Regla por llevar a `docs/`:** en cada commit se muestra `git diff --stat` contra el commit anterior. Hoy no consta en ningún archivo del repo.
- **Criterio de medida:** la curva completa, ±1 px en cada breakpoint o tope de tamaño; no puntos sueltos.
- **Playwright MCP:** añadido en local con `cmd /c` y `@latest`, sin versionar. `.mcp.json` y `.playwright-mcp/` están en `.git/info/exclude`. Si se versiona, con versión fijada y en un commit propio.
- **`src/test/cssRules.ts`:** avance parcial de la deuda del helper común para los tests que leen archivos del disco.
- **`PLAN.md`:** la línea de la Fase 2 dice «13 tecnologías»; el catálogo tiene 14 desde que JavaScript y TypeScript se separaron.
- **Breakpoints:** se añadieron 1023 px (hasta ahí el Hero va apilado) y 380 px.
