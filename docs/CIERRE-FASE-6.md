# Cierre de la Fase 6 — lista de pendientes (borrador)

Archivo temporal. Reúne lo anotado durante el Hero y existe solo hasta cerrar la Fase 6, o hasta que deje de ser necesario. Al ejecutar `/close-phase 6`, su contenido vigente se reparte entre `docs/PLAN.md` y `docs/MEMORY.md` y el archivo se borra en el mismo commit `docs` de cierre. Hasta entonces, de todo esto solo consta en esos dos archivos la decisión de contacto (commit `54a289c`).

Las medidas se tomaron en Chrome contra la compilación del commit `6b88721`, en español e inglés, con las pastillas en reposo y en lo más alto de su flotación (8 px arriba). No se comprobó Safari, Firefox ni un dispositivo físico. Los datos personales se nombran por su campo, nunca por su valor.

## Estado

- La Fase 6 sigue abierta: solo está hecho el Hero. Sus ajustes finales terminaron en el commit `6b88721`.
- **La rama `rebuild/vite-react` se sube con la foto provisional,** por decisión del autor. La foto viaja en el historial y se reemplazará con `/update-hero-photo`.
- **En el historial quedan** la foto provisional y la primera versión de los PDFs del CV.

## Encargos aprobados que aún no se ejecutan

- [x] **«Descargar CV»:** hecho, del commit `32ff261` al `9836e16`. Los cuatro PDFs están en `public/cv/` y su registro en `src/data/cv.ts`; el botón solo se renderiza si el registro tiene archivos del idioma activo. Lo que lleva el CV (teléfono, correo) queda descargable por cualquiera una vez publicado.
  - **Peso añadido al repo:** 914,2 kB en los cuatro PDFs actuales, más 914,4 kB de su primera versión, que queda en el historial.
- [ ] **Cuatro comandos manuales:** `/update-hero-intro`, `/update-hero-photo`, `/update-hero-cv` y `/update-hero-social`, con la convención de `.claude/skills/pre-push-check`. Primero la propuesta por escrito; después una prueba real de cada uno (el de la descripción con un texto de prueba que se revierte, el de la foto con la foto actual, el de los CV con PDFs de prueba sin datos reales y fuera del repo). El cierre debe documentarlos. Sus requisitos están en «Requisitos fijados para los comandos».
- [ ] **`/update-hero-photo`:** no versiona el script de exportación; describe los pasos y las herramientas, sin añadir código ni dependencias.
- [ ] **`pre-push-check` y los PDFs:** la skill ya revisa los PDFs versionados desde `54a289c`. Falta elegir la herramienta local con la que extrae el texto y los metadatos, sin añadir dependencias al repo; mientras no haya una, ese paso informa «no se pudo comprobar».
- [ ] **Foto real** en lugar de la provisional, con `/update-hero-photo`.
- [ ] **PDFs del CV con «Gómez»:** los cuatro PDFs actuales llevan el nombre sin tilde. Se regeneran y se sustituyen con `/update-hero-cv`.
- [ ] **Nombre sin tilde fuera del sitio:** `README.md` (líneas 1 y 50) y `docs/PLAN.md` (líneas 107, 165 y 195) conservan «Jorge Gomez». Se corrigen en `/close-phase 6`.
- [ ] **Meta description:** sigue diciendo «Backend con Java, Spring Boot y PostgreSQL», y es cierto. El párrafo del Hero ya no menciona PostgreSQL; revisar si las dos deben decir lo mismo.
- [ ] **Limpieza ofrecida y no aprobada:** retirar solo la clave `hero.availabilityShort` (ver «Estado de disponibilidad»). El corte de 380 px no se retira en ninguna limpieza: lo usa el botón de CV.
- [ ] **Tokens sin uso:** `--tracking-wider` (lo dejó el saludo) y `--font-size-lg` (lo dejó el párrafo). No se borran sin aprobación.
- [ ] **Pendiente menor, `color-mix`:** verificar en MDN desde qué versiones de cada navegador se admite. Lo usan el brillo del punto de estado y el del botón principal.
- [ ] **`docs/PLAN.md`:** dos líneas dicen «versión diseñada» o «diseñado» para el CV; la versión se llama infográfica desde `a43bf3b`. Se corrigen en `/close-phase 6`.
- [ ] **Pendiente del autor, PDFs infográficos:** revisar a ojo los dos, porque un texto convertido a contornos no sale al extraer el texto, y decidir si LinkedIn y GitHub deben ser clicables en el PDF; hoy no lo son.
- [ ] **Decisión del autor, «Gemini»:** lo quitó del CV a propósito, así que los PDFs actuales son correctos en eso. El portafolio lo sigue mencionando (n8n Daily News Agent) y es veraz. Decidir en `/close-phase 6`, y sin urgencia, si se deja o se quita del sitio; si se quita, se cambia primero la descripción en GitHub y luego en `es.ts` y `en.ts`.
- [ ] **Borrar este archivo** en el cierre de la Fase 6, tras repartir su contenido.

### Requisitos fijados para los comandos

- **`/update-hero-intro`:**
  - actualiza también los dos tests que fijan el texto palabra por palabra (constante `INTRO` de `src/i18n/dictionaries.hero.test.ts`);
  - vuelve a medir, en español e inglés, las líneas que ocupa el párrafo, su tamaño por idioma y el equilibrado, porque los tres están ajustados al texto actual.
- **`/update-hero-photo`:**
  - vuelve a medir la silueta y actualiza la constante `SILHOUETTE` y el hash del test de Java en `src/components/sections/Hero.badges.test.tsx`; ese test falla a propósito en cuanto cambia `portrait-576.webp`;
  - quita los metadatos EXIF de los archivos.
- **`/update-hero-cv`:**
  - recibe una sola ruta de carpeta y localiza los cuatro PDFs por patrón de nombre (ATS e Infograph\*, en español e inglés), ignorando los `.docx`;
  - los PDFs deben venir regenerados con «Gómez».

## Sección de contacto de la Fase 6: cambio de decisión

- **Qué cambia:** la sección de contacto mostrará el correo y el teléfono visibles, con un llamado a la acción («si tienes un proyecto en mente, hablemos»), la ubicación a nivel de ciudad y el tiempo de respuesta.
- **Ya no choca con las reglas:** `AGENTS.md`, `.claude/rules/contacto.md` y la decisión de `docs/MEMORY.md` ya recogen el cambio. Lo que falta es construir la sección, con su test de literales en `src/`.
- **También en los PDFs del CV:** el correo y el teléfono irán además dentro de los PDFs que descarga el botón «Descargar CV».
- **A qué afectó el cambio:** a `AGENTS.md` (la línea «Nunca» de datos personales y la comprobación previa al push), a `.claude/rules/contacto.md`, a la decisión de contacto de `docs/MEMORY.md` y a la skill `pre-push-check`. Los cuatro se editaron en `54a289c`.
- **Reglas ya actualizadas:** la propuesta se aprobó y las reglas se editaron en su propio commit, `54a289c`.
- **Decisiones del autor para la sección:**
  - el correo y el teléfono se muestran los dos completos, como texto;
  - van sin `href` ni otros atributos, y las acciones de escribir un correo y abrir WhatsApp siguen en `ContactButton`;
  - la fila de redes del Hero y el pie no cambian: siguen ensamblando el contacto solo en el clic;
  - `pre-push-check` compara contra `src/config/contact.ts`: todo correo o teléfono hallado en los PDFs debe ser exactamente el de config.
- **Lo que se mantiene:** el dato codificado en `src/config/contact.ts` y el grep sobre `dist/` con su control positivo. No se añade ninguna protección nueva.
- **Tiempo de respuesta:** si se publica, va como interruptor en `src/config/`.
- **Formulario:** `PLAN.md` dice «sin formulario». El de la referencia del autor sería un cambio de decisión y una petición a terceros: se le pregunta en esa fase; no se propone por defecto.
- **Textos del llamado a la acción:** se muestran al autor antes de commitear.

## Hero: decisiones tomadas

### Nombre y saludo

- **Nombre con tilde:** «Jorge Gómez» y «Jorge Alberto Gómez Chaparro», definidos en `src/config/site.ts` (commit `8090358`; la regla se cambió en `c0f4504`). Los nombres de archivo siguen en ASCII (`jorge-gomez-cv-…`).
- **Saludo:** el texto va entre dos líneas finas verdes, en mayúsculas puestas por CSS, con su propio espaciado de letras (`--hero-greeting-tracking`, 0,12em). Commit `15d81f0`.

### Rol rotativo

- **Qué es:** la línea bajo el nombre rota entre los tres textos de `hero.roles` de cada diccionario. `site.role` sigue siendo la fuente del título del documento y de la meta description.
- **«Full-Stack»** va con guion, por decisión del autor.
- **Tiempos:** cada texto se ve 4 s y el cambio dura 500 ms (`src/config/heroRoles.ts`).
- **Cuándo no rota:** con movimiento reducido del sistema el texto queda fijo; tampoco rota con la pestaña oculta ni mientras se ve la animación de carga. A un lector de pantalla se le ofrece una sola frase estable, sin `aria-live`.
- **Sin mecanismo de pausa, decisión del autor:** «El tag rotativo y el fondo de partículas no tienen mecanismo de pausa. Según W3C, WCAG 2.2.2 (nivel A) pide uno para contenido que se mueve solo más de 5 s, así que no lo cumplen. Se evaluaron un botón en el Hero y un control global de reducir movimiento, y se descartaron por decisión del autor. Lo que sí hacen: texto fijo y dibujo estático con movimiento reducido del sistema; el tag no rota con la pestaña oculta ni bajo la intro y ofrece una sola frase estable a lectores de pantalla, sin aria-live. Decisión revisable.»
- **Límites aceptados:**
  - a mitad del cambio, el texto que sale y el que entra se solapan 10 px;
  - la pausa con la pestaña oculta solo la cubren los tests, no se comprobó a mano;
  - en teléfono el rol reserva dos líneas donde el texto más largo no cabe en una (español de 320 a 369 px, inglés de 320 a 382 px).
- **Deudas:**
  - el test de fuente única de `en.ts` depende de que la línea empiece por `roles: [site.role,`;
  - los 500 ms están escritos dos veces, en `heroRoles.ts` y en `tokens.css` (`--duration-role-swap`); un test compara los dos valores.

### Botón y textos

- **«Ver proyectos»** enlaza al ancla de proyectos, que está vacía hasta que exista esa sección.
- **`hero.tagline`** («Where code meets storytelling.», igual en los dos idiomas) sigue en el diccionario sin mostrarse. Falta decidir su destino; no se borra sin aprobación.
- **`site.status`** se retiró.

### Párrafo

- **Texto, aprobado por el autor palabra por palabra** (commit `111c911`):
  - español: «Construyo APIs con Java y Spring Boot, integro agentes de IA en automatizaciones y soy un puente comunicativo entre el negocio y el equipo. Vengo de la comunicación social: escucho, planifico, documento y comunico, activamente.»
  - inglés: «I build APIs with Java and Spring Boot, integrate AI agents into automations, and act as a communication bridge between the business and the team. I come from a communications background: I actively listen, plan, document and communicate.»
- **Ya no menciona** PostgreSQL ni «full stack».
- **Tamaño por idioma** (commit `8e9ea02`): 16 px hasta 1088 px de ventana, y de ahí crece hasta su máximo a 1152 px. El máximo es de 18 px en español y de 17 px en inglés, porque el texto inglés es más largo y a 18 px pasa a cinco líneas desde 1126 px. Apilado y en teléfono mide 16 px en los dos idiomas.
  - Sale de `--hero-intro-size`, que toma su tope de `--hero-intro-size-max` (1.125, y 1.0625 bajo `:root:lang(en)`).
  - El rol (de 20 a 24 px) es mayor que el párrafo en todas las pantallas.
- **Líneas equilibradas** (`text-wrap: balance`), solo en dos columnas: así ninguna línea se alarga hacia el hombro de la figura. Apilado y en teléfono el párrafo parte las líneas como siempre.
  - **Soporte,** según caniuse el 11 de octubre de 2026: Chrome parcial de la 114 a la 129 y completo desde la 130, Firefox desde la 121, Safari desde la 17.5.
  - **Sin soporte,** el párrafo queda a 43 px de la figura a 1024 px en español (28 px con 600 de alto), medido con 16 px.
- **Líneas que ocupa:** cuatro en dos columnas, salvo en inglés de 1024 a 1033 px, donde son cinco. Los límites están en «Límites aceptados».

### Idioma del documento

- **Destello resuelto** (commit `6b88721`): `index.html` arranca con `lang="es"` y el idioma se ponía después del primer pintado. Al cargar en inglés, una de cada tres cargas mostraba un fotograma con el párrafo a 18 px y cinco líneas. Ahora `LangProvider` pone `<html lang>` antes de que el navegador pinte.
- **Comprobado** en 80 recargas, fotograma a fotograma, a 1440×900 y 1152×768 con cada idioma guardado: ningún fotograma con otro idioma, tamaño o número de líneas.

### Estado de disponibilidad

- **Interruptor:** `AVAILABLE_FOR_FREELANCE` en `src/config/availability.ts`. Con `false` el estado no se renderiza ni deja hueco. Los textos viven en `hero.availability` de los diccionarios.
- **Oculto en teléfono:** hasta 480 px lleva `display: none`, así que tampoco entra en el árbol de accesibilidad. El autor aceptó que no se vea ahí.
- **Texto corto sin uso:** «Freelance disponible» solo se mostraba hasta 380 px, y en ese tramo el estado ya está oculto. La clave `hero.availabilityShort` y sus tests siguen en el repo sin efecto. El corte de 380 px sí tiene uso: hasta ahí el botón de CV muestra su texto corto. El corte se midió en 374 px y se dejó en 380 por margen.
- **Punto verde:** de 10 px, con un brillo fijo de 8 px al 30 % (commit `f679530`). El brillo usa `color-mix`; donde no se admite, la sombra no se aplica y queda el punto.

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

- **Pastillas del Hero:** Python, Java (Duke), TypeScript, PostgreSQL y «AI Agents». PostgreSQL lleva un icono genérico propio (`database.svg`); «AI Agents», un icono genérico de terceros.
- **Icono de «AI Agents»** (commit `1c8c1af`): el chip `microchip-ai` de PrimeIcons, sin modificar; solo se le añadió el comentario de procedencia y la licencia. No es un logo de marca.

| Archivo | Origen | Licencia | SHA-256 del original |
|---|---|---|---|
| `public/icons/ai-agents.svg` | `raw-svg/microchip-ai.svg` de `github.com/primefaces/primeicons`, versión 7.0.0 | MIT, © 2018-2021 PrimeTek | `6d1c4d3c14d6a55d8126f35daa3016e1d54da26a5bb3ece1a66688d9ebd88bf1` |

  - El chip va relleno, en negro puro; ya no hace juego con el sobre y la base de datos, que son de trazo. El test que vigilaba ese parecido se retiró.
  - El repositorio de PrimeIcons está archivado. Las versiones publicadas bajo MIT siguen siendo MIT.
- **«AI Agents»** se sostiene en dos proyectos: «n8n Daily News Agent» y «LogiTrack IQ». Cuando se construya la sección de proyectos, la tarjeta de LogiTrack IQ debe nombrar el agente de IA en su descripción visible.
- **Tamaño:** las cinco llevan la misma letra en cada tramo (16 px en dos columnas, 14 apilado, 13 en teléfono), así que solo cambia el ancho (commit `4b6a6a8`).
- **Compensación del icono** (commit `b5a40b2`): la caja del icono de PostgreSQL crece ×1,16 y la de «AI Agents» ×1,25, porque su dibujo no llena el cuadro. El tope es ×1,27: más, y se sale de la placa.
  - La tinta de «AI Agents» queda en 24,1 px frente a 26,4 de TypeScript; es el icono que peor se lee a 360 px.
  - Su caja queda a 0,3 px del borde de la placa.
- **Java, a la izquierda de la foto en todos los anchos** (commit `0b7ef1c`):
  - en dos columnas va junto a la cabeza, tras el nombre, al 31 % de alto. Su distancia al borde derecho del retrato es fluida (`--hero-java-right`): del 70,5 % a 1024 px al 75 % desde unos 1120 px. No hay cambio de lado al cruzar 1280/1281 px;
  - apilado va arriba a la izquierda, sobre el pelo (izquierda 0 %, altura 2 %); en teléfono, algo más baja (4 %);
  - un test comprueba que, a su altura, queda fuera de la silueta. El borde de la silueta (30,73 % del ancho, entre el 27 % y el 43 % del alto) se midió en el navegador sobre `portrait-576.webp`, y otro test fija el hash de ese archivo.
- **PostgreSQL apilado:** al 46 % de alto (48 % en teléfono).
- **Logos que solo pueden ir como texto,** según las políticas leídas el 7 y el 8 de octubre de 2026: la taza de Java (exige licencia comercial escrita), MySQL (exige que el logo sea un enlace), n8n (sin permiso expreso publicado), React (permiso escrito de Meta), Docker (exige autorización), Spring Boot (el autor no ha leído sus condiciones) y PostgreSQL.
- **Sin decidir:** logos de CSS, GitHub en el catálogo y Spring Security.
- **Sección de servicios:** listará todas las tecnologías del catálogo, con logo donde la marca lo permita y solo texto donde no. Ahí van Duke y n8n.
- **Archivo de créditos en `docs/`, por escribir:** Git (Jason Long, CC BY 3.0), JavaScript (aviso MIT), HTML5 (W3C, CC BY 3.0), PrimeIcons (MIT, PrimeTek) y Duke. Para Duke, citar las dos páginas de Oracle (dev.java/duke y el PDF de marca de Java) y dejar claro que su repositorio no incluye texto de licencia.
- **Deuda de Duke:** reintentar la wiki del proyecto y el repositorio Mercurial antiguo para fijar el texto BSD exacto.
- **Sin decidir:** si la atribución va también visible en el sitio.

### Posición del bloque de texto

- **Borde izquierdo** (commit `a437f82`): en dos columnas, la barra, el Hero, el pie y Certificaciones se acercan 2rem a la izquierda. El borde derecho no cambia.
  - El desplazamiento crece con la ventana, de cero a 1024 px al total a 1152 px, para que nada salte al dejar el apilado: el margen izquierdo baja de 82 a 60 px en ese tramo y luego sube (70 px a 1280, 83 a 1440, 281 a 1920).
  - No hay un mínimo de 3rem: el suelo real es de 60 px, a 1152 px.
  - Con barra de desplazamiento, Certificaciones solo se midió con la barra forzada.
- **Centrado vertical** (commits `4cbecc1` y `65854c7`): donde el retrato es más alto que el texto, el bloque baja y deja arriba el 40 % de lo que sobra (`--hero-text-top-share`); no queda centrado, sino algo por encima del centro. Nunca queda más cerca de la barra que antes.
  - Donde no sobra alto no se mueve: de 1024 a 1104 px y en ventanas de 600 px de alto.
  - La construcción (una columna flexible con un margen negativo que se anula con un mínimo) solo se probó en Chromium.

### Foto

- **Provisional:** el retrato actual es una foto personal provisional del autor (commit `f7c0c79`), que sustituyó al avatar ilustrado del principio.
- **Pendiente:** reemplazarla por la foto real con `/update-hero-photo`, que además debe volver a medir la silueta (ver «Requisitos fijados para los comandos»).
- **Peso:** 431,6 kB en cuatro archivos WebP de `src/assets/hero/`. A revisar con Lighthouse en la Fase 8.

| Archivo | Peso |
|---|---|
| `portrait-576.webp` | 48,9 kB (48 896 bytes) |
| `portrait-800.webp` | 76,4 kB (76 372 bytes) |
| `portrait-1152.webp` | 127,5 kB (127 464 bytes) |
| `portrait-1472.webp` | 178,8 kB (178 836 bytes) |

## Límites aceptados

Son límites del diseño aprobado, no tareas. Donde hay dos cifras separadas por una barra, la primera es en español y la segunda en inglés.

### Dos columnas (desde 1024 px)

- **Sin scroll horizontal** en ningún tamaño.
- **Pelo a la barra,** a 768 px de alto o más: 38 px a 1024, 33 a 1040 y 32 px de 1056 a 1920. En inglés, 63 px de 1024 a 1033.
- **Ventanas de 600 px de alto:** el pelo queda a 38 px a 1024, a 32 o 33 hasta 1152, a 49 px a 1280 y a 114 px desde 1312, con un salto de 49 a 82 entre 1280 y 1281. En inglés: 63, 43 y 107 px, con el salto de 43 a 76. No se toca el escritorio aprobado.
- **Saludo a la barra:** 43 px como mínimo.
- **Figura–párrafo:** 76 / 124 px a 1024, 86 / 35 a 1040, 98 / 46 a 1056, 109 / 58 a 1072, 121 / 70 a 1088, 115 / 87 a 1152, 176 / 147 a 1280, 177 / 149 a 1281, 124 / 97 a 1440×900 y 203 / 175 a 1920×1080.
- **Inglés de 1024 a 1072 px:**
  - el párrafo ocupa cinco líneas de 1024 a 1033 px (el Hero mide 522 px, 6 más que antes del texto nuevo);
  - entre 1033 y 1034 px vuelve a cuatro líneas y el Hero baja 26 px de golpe;
  - el mínimo de figura–párrafo es de 31 px a 1034×768 y de 16 px a 1034×600;
  - de 1040 a 1072 el párrafo queda entre 4 y 9 px más cerca de la figura que antes del texto nuevo;
  - con cinco líneas equilibradas, dos líneas acaban en una «I» suelta.
- **Python al texto:** 60 / 69 px como mínimo, a 1024×600; 116 / 99 px a 1440×900 (110 / 93 en lo alto de la flotación). En español a 18 px queda 4 px más cerca que antes del texto nuevo a 1440×900.
- **Java, de 1024 a 1280 px:** a 7 px de la figura a 1024, y a 7 px del nombre a 1024×600 (22 px con 768 de alto o más). Desde 1104 px: 33 px al nombre (18 con 600 de alto) y 27 a la figura.
- **Java, desde 1281 px:** 26 px al nombre en el peor caso (1440×900), 28 a la figura, 161 a otra pastilla y 146 a la barra. A 1440×900 queda en línea con el apellido.
- **PostgreSQL:** su hueco horizontal a la figura es de 35 px a 1024 (antes de igualar tamaños, 59), 95 a 1280 y 195 a 1920. Queda a 61 px del borde de la ventana a 1024.
- **«AI Agents»** va sobre el cuerpo de la figura: tapa del 54 % (a 1024) al 80 % de su caja, sin tocar la cara.
- **Ninguna pastilla tapa la cara** en dos columnas.

### Apilado y teléfono

- **Cara cortada en la primera pantalla:** 112 / 137 px a 320×640 y 6 px a 360×740; 0 a 390×844 y a 480×800.
- **Justo por encima de 480 px:** 55 px a 481×800, porque vuelven el estado y los márgenes de tablet.
- **1023×768:** 193 / 168 px. Antes del texto nuevo eran 182; antes de la fila de redes, 114.
- **Teléfono en horizontal:** la cara se corta 407 / 381 px a 740×360, 398 / 372 a 844×390, 393 a 667×375 y 417 a 568×320. En español son 11 o 12 px más que antes del texto nuevo, porque el párrafo pasa de tres a cuatro líneas. Alternativa si se quiere resolver: quitar el tope por alto del retrato.
- **Java, apilado:** a 34 px del texto como mínimo y a 58 de la figura (481 px).
- **Java, teléfono:** a 29 px del texto y a 8 de la figura a 320 px.
- **Java, teléfono en horizontal:** a 568×320 roza el pelo (0 px en reposo, 6 en lo alto de la flotación) y tapa un 0,1 % de la franja de la cara.
- **PostgreSQL, apilado:**
  - toca la silueta de 481 a 643 px de ancho, hasta un 10,6 % de su caja a 481 px; desde 768 px queda a 5 px;
  - en ventanas bajas el retrato encoge y vuelve a tocarla: un 5 % a 1023×600;
  - con 47 % en vez de 46 % no cabría el margen de 20 puntos con «AI Agents»;
  - en teléfono en horizontal, en lo alto de la flotación tapa un 0,4 % de la franja de la cara a 740×360, un 0,1 % a 667×375 y un 1,7 % a 568×320; en reposo, nada.
- **Pastillas entre sí, teléfono en horizontal:** a 568×320 quedan a 16 px (Python y PostgreSQL) y a 10 px en lo alto de la flotación (TypeScript, «AI Agents» y PostgreSQL).
- **Teléfono, tres pastillas a la izquierda** (Java, Python y TypeScript) y dos a la derecha.
- **Viewport fraccionario:** no se pudo reproducir con zoom. Un ancho de 1023,6 px recibiría dos columnas, que a 1023 funcionan.
- **Densidad 3:** a 768 y 820 px el retrato se amplía ×1,17 con el archivo mayor, de 1472 px.
- **Lista del CV abierta:** a 1024×600 tapaba 4 px de la pastilla de Python, y a 320×600 abría 35 px bajo la primera pantalla. No se volvió a medir tras los ajustes finales.

## Fuera del Hero

- **Barra de navegación, 320 px:** el botón de idioma salta a una segunda fila y queda a 1 px del saludo. Unas veces la barra sale en una fila y otras en dos; sin investigar. Es del componente de navegación.
- **Barra de navegación, de unos 780 a 912 px:** se parte en dos filas. También es del componente de navegación.
- **Fondo de partículas:** tras redimensionar varias veces la ventana, las partículas se alinearon en una columna vertical. Con recarga limpia no pasa. Sin investigar.
- **Pie a 1440×900:** queda justo al borde de la primera pantalla (antes, 23 px por debajo).

## Proceso y herramientas

- **Sin Prettier:** el repo se formatea a mano (comillas simples, sin punto y coma). No se formatean archivos enteros; solo se aplican las líneas del commit.
- **Regla por llevar a `docs/`:** en cada commit se muestra `git diff --stat` contra el commit anterior. Hoy no consta en ningún archivo del repo.
- **Criterio de medida:** la curva completa, ±1 px en cada breakpoint o tope de tamaño; no puntos sueltos. Los barridos píxel a píxel encontraron límites que los puntos sueltos no mostraban.
- **Dos medidas de «a la figura»:** el hueco horizontal en las filas de la pastilla, y la distancia al píxel opaco más cercano en cualquier dirección. No son comparables entre sí; este archivo dice cuál usa donde importa.
- **Playwright MCP:** añadido en local con `cmd /c` y `@latest`, sin versionar. `.mcp.json` y `.playwright-mcp/` están en `.git/info/exclude`. Si se versiona, con versión fijada y en un commit propio.
- **`src/test/cssRules.ts`:** avance parcial de la deuda del helper común para los tests que leen archivos del disco.
- **Sin decodificador de WebP en los tests:** por eso la silueta de la foto va como constante medida a mano y vigilada por un hash.
- **`PLAN.md`:** la línea de la Fase 2 dice «13 tecnologías»; el catálogo tiene 14 desde que JavaScript y TypeScript se separaron.
- **Textos del CV sin test de valor:** «Versión infográfica (PDF)», «Infographic version (PDF)» y la clave `cvInfographic` no los comprueba ningún test con un valor escrito; solo el typecheck exige la clave.
- **Breakpoints:** se añadieron 1023 px (hasta ahí el Hero va apilado) y 380 px (hasta ahí el botón de CV muestra «CV»; no se retira).
