---
name: update-hero-intro
description: Cambia el párrafo de presentación del Hero de portafolio-web en español e inglés, tras revisarlo y medirlo. No hace commit ni push.
disable-model-invocation: true
---

# Actualizar el párrafo del Hero

Recibe el texto nuevo en español, propone su versión en inglés, revisa los
dos y, con la aprobación del autor, los escribe en los diccionarios y en el
test que los fija. Prepara el cambio y se detiene: el commit lo decide el
autor.

El párrafo es texto aprobado palabra por palabra (`AGENTS.md`). Invocar
este comando con un texto aprueba ese español. El inglés lo aprueba el
autor aparte, dentro del comando.

## Nunca

- No hagas `git add`, commit ni push.
- No escribas nada en el repo antes de que el autor apruebe el inglés de
  forma explícita y haya respondido a todas las preguntas.
- No escribas una versión inglesa por tu cuenta si el autor no la aprueba,
  y no retoques el español que te dieron: ni una coma.
- No corrijas el contenido. Si el texto afirma algo sin respaldo, señálalo
  y pregunta.
- No toques nada más que `hero.intro` en los dos diccionarios y la
  constante `INTRO` del test: ni la descripción del documento, ni el rol,
  ni los tokens de tamaño, ni ningún otro test.
- No toques `hero.tagline`: es otra clave, sigue en los diccionarios sin
  mostrarse y su destino lo decide el autor.
- No edites con `Get-Content` ni `Set-Content` de PowerShell: corrompen la
  codificación. Usa la herramienta de edición.
- No escribas datos personales en ningún sitio, tampoco en tu respuesta ni
  en una pregunta: nombra el tipo de dato, no su valor.
- No decidas si un límite que empeora es aceptable: da las cifras y ofrece
  opciones.
- Las capturas no se commitean.
- Para volver atrás se usa la copia de seguridad, no `git checkout`.

## Pasos

1. **Entrada.** El texto en español llega como argumento; si no llega,
   pídelo. Es un solo párrafo de texto plano. Guárdalo tal cual, con sus
   tildes, su «ñ» y sus comillas.
2. **Estado.** `git status -sb`: si `src/i18n/` tiene cambios sin
   commitear, detente. Comprueba si Playwright MCP responde.
3. **Quién usa la clave.** `git grep -n "hero\.intro" -- src`. Di qué
   archivos la usan hoy. Lo esperado es que `Hero.tsx` la muestre, que
   varios tests la lean del diccionario y que solo
   `src/i18n/dictionaries.hero.test.ts` fije su valor. Si alguien más la
   usa o fija el texto, no cambies ese uso sin preguntar.
4. **Datos personales.** Busca en el texto un correo, un teléfono o
   cualquier número de siete o más dígitos, una fecha completa, una cédula
   o una dirección. Si hay alguno, detente sin escribir nada y di el tipo
   de dato, nunca su valor.
5. **Contenido veraz.** Aplica `.claude/rules/contenido-veraz.md`:
   - nada de años de experiencia, clientes, métricas de impacto ni uso en
     producción real;
   - cada tecnología que el texto nombre debe estar en el catálogo de
     `src/data/technologies.ts` o en la descripción o las etiquetas de un
     repo (`src/data/projects.ts` y los diccionarios). Compáralo con lo que
     hay, sin inventar.
   La revisión de tecnologías no se limita a las palabras con mayúscula.
   Revisa todo sustantivo que pueda ser una tecnología, una herramienta,
   una librería, un servicio o una marca, también en minúscula o con
   números (por ejemplo «docker» o «n8n»), y compáralo sin distinguir
   mayúsculas. No hay lista cerrada: todo lo que no esté en
   `src/data/technologies.ts`, en `src/data/projects.ts` ni en los
   diccionarios se señala y se pregunta.
   Lo que no tenga respaldo no se corrige: se señala, y se pregunta con
   AskUserQuestion de dónde sale o si se detiene.
6. **Inglés.** Propón una versión en inglés nativa y natural, no literal, y
   di en una o dos líneas qué libertades te tomaste. Pásale las mismas
   comprobaciones de los pasos 4 y 5. Pregunta con AskUserQuestion si el
   autor la aprueba. Si no la aprueba, o pide cambios, no escribas nada:
   propón otra o detente.
7. **Medir el «antes».** Con el repo tal como está, aplica el protocolo de
   medición de `docs/COMANDOS-HERO.md`, en español e inglés. Sin
   Playwright, informa «no se pudo comprobar» y no des nada por bueno.
8. **Copia de seguridad.** Copia `src/i18n/es.ts`, `src/i18n/en.ts` y
   `src/i18n/dictionaries.hero.test.ts` a una carpeta nueva fuera del repo,
   con la fecha y la hora en el nombre, y anota el SHA-256 de cada uno.
9. **Escribir.** Antes de tocar el test, lista qué cambia y por qué: los
   dos textos de la constante `INTRO`, porque fija el párrafo palabra por
   palabra. Después, con la herramienta de edición:
   - `hero.intro` en `src/i18n/es.ts`;
   - `hero.intro` en `src/i18n/en.ts`;
   - `es` y `en` de `INTRO` en `src/i18n/dictionaries.hero.test.ts`.
   Si el texto lleva comillas, escápalas o cambia las del literal; el
   valor debe quedar idéntico al aprobado.
10. **Codificación.** Lee los tres archivos desde disco y comprueba que no
    hay «Ã», ni CR, ni caracteres de control, y que las tildes, la «ñ» y
    las comillas del texto están intactas. Comprueba que el diff solo toca
    esas líneas.
11. **Medir el «después».** Compila y aplica otra vez el protocolo, en
    español e inglés. Además de lo que el protocolo pide:
    - las líneas del párrafo en cada ancho, con un barrido de 1024 a 1152
      píxel a píxel donde cambie el número de líneas;
    - el tamaño de letra por idioma. El máximo, `--hero-intro-size-max`,
      está calibrado para el texto anterior; léelo en
      `src/styles/tokens.css` y di si sigue sirviendo;
    - el equilibrado de las líneas en dos columnas;
    - el alto del Hero, el pelo a la barra, figura–párrafo, Python al
      texto, las distancias de Java y la cara cortada en la primera
      pantalla.
    Avisa con cifras si el párrafo pasa de cuatro líneas en algún ancho, o
    si algo empeora, y ofrece opciones sin decidir: acortar el texto,
    cambiar el ancho del párrafo o cambiar su tamaño.
12. **Descripción del documento.** Compara el párrafo nuevo con la
    descripción del documento (`description`, al principio de cada
    diccionario). Si dejaron de decir lo mismo, dilo. No la toques.
13. **Cierre.** `npm run lint`, `npm run typecheck`, `npm test` y
    `npm run build`. `git status -sb` y `git diff --stat`.

## Informe

- Los dos textos, tal como quedaron, y las libertades del inglés.
- Lo que se señaló en las comprobaciones de contenido y lo que el autor
  respondió.
- Qué archivos usan la clave y cuáles cambiaron; el resultado de la
  comprobación de codificación.
- Las medidas, en las tres listas del protocolo (empeora, mejora, no
  cambia), con la ventana, el idioma y las dos cifras de cada caso.
- Si la descripción del documento dejó de coincidir con el párrafo.
- Lo que no se pudo comprobar.
- Si te detuviste: en qué paso, por qué, y que no se escribió nada.
- Dónde quedó la copia de seguridad, con los SHA-256 anteriores, y cómo
  volver atrás: copiar esos tres archivos de vuelta a `src/i18n/`.
- El resultado de lint, typecheck, tests y build, y el `git diff --stat`.
- Un recordatorio: el texto sale en el sitio publicado.
