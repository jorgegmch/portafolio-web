# MEMORY.md — portafolio-web
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. El checklist de fases y los pendientes están en docs/PLAN.md.

## Estado actual
- Fases 1 a 5 en rebuild/vite-react. La Fase 6 se hizo con el rediseño v2 y v2.1 en redesign/v2; la Fase 7 (/certificaciones) se retiró. Qué está subido no se apunta aquí: se consulta con `git status -sb` y `git log origin/redesign/v2..HEAD`.
- Rediseño v2.1 cerrado el 2026-11-11: fuente de verdad, docs/design/redesign-v2/DESIGN-SPEC.md. Pendientes en PLAN.md, «Pendientes del rediseño v2.1».
- Después del cierre: correcciones del 2026-11-11 (Fase 6 de PLAN.md), foto final del Hero (2026-11-17) y favicon nuevo (2026-11-18), ambos en PLAN.md, «Material y decisiones del autor».
- Hosting y backend del formulario sin decidir (Vercel Hobby es solo para uso personal no comercial); el adaptador del formulario no envía nada.

## Decisiones (y por qué)
- npm (único gestor instalado), react-router y CSS Modules (decididos en la Fase 0).
- Un solo tema oscuro; no hay useTheme: evita código sin uso.
- El correo y el teléfono no se muestran como texto en la página: ContactButton los arma en el clic (copiar sin escribirlo, o abrir WhatsApp) y solo en Contacto; en claro, solo en los PDFs del CV. En el repo y el bundle van codificados: es ofuscación, no protección.
- La fecha de nacimiento y la edad se retiraron en el rediseño v2: ya no están en el repo.
- ?lang= no se guarda; solo la elección con el botón de idioma: un enlace compartido no cambia la preferencia de quien lo abre.
- 5 proyectos destacados y enlace a GitHub: 17 tarjetas diluyen los mejores.
- La tarjeta cuenta los 14 proyectos con `built: true`, portafolio-web incluido; no cuentan el fork (FastCat), learning-path-fundamentals ni los 3 repos de scripts de BD. La cifra sale de `builtProjects.length`.
- El CRM se presenta con la descripción de su repo (módulo de un MVP hecho en equipo); su README aclara que el CRM completo es privado y que corre solo con JSON Server.
- Certificaciones solo como texto (los PDFs originales llevan la cédula); hoy solo aparecen en la Formación de Perfil.
- Finales de línea en LF fijados por .gitattributes, no por la configuración de cada clon: los tests comparan logos oficiales byte a byte.
- Fuentes alojadas en el repo (public/fonts) y sin librerías de animación: ninguna petición a terceros.
- Diseño pensado primero para escritorio y adaptado a tablet y teléfono.
- Commits en inglés: el historial de un repo público lo lee quien lo revise.
- AGENTS.md se mantiene corto (tope práctico ~150 líneas); las reglas de .claude/rules/ se importan con @ y siempre están cargadas, para que sean vinculantes y se vean en /memory.
- No se hace merge a main hasta la Fase 10: GitHub Pages sirve main y un proyecto Vite sin compilar lo dejaría en blanco. Al fusionar: merge commit, no squash, para conservar los commits por causa.
- Dos memorias con reparto: docs/MEMORY.md (versionada) guarda estado y decisiones con su porqué; la memoria automática de Claude Code (local, no versionada) guarda aprendizajes de correcciones y preferencias. No duplicar entre ambas.
- permissions.deny frena solo al agente; mis comandos con ! no se bloquean (verificado solo con git push --dry-run).
- Tres nombres en config/site.ts: el logo muestra site.handle, el h1 del Hero site.shortName y la meta description site.legalName.
- Intro: el foco inicial va a la capa (un foco puesto por código al cargar muestra el anillo sin teclado); dura menos de 5 s, el límite de WCAG 2.2.2, y se cierra con Esc, clic, Enter o Espacio, sin botón.
- Aparición al hacer scroll: una vez por carga de página, con el registro en el módulo. Lo que aparece no es lo que escala (el <li> aparece, la caja de dentro escala), para que dos transform no choquen en un elemento.
- Atrás/Adelante: las entradas del historial con ancla las coloca useScrollToHash (con la cortina, el navegador acababa en otro sitio); las demás las restaura el navegador.
- El retrato del Hero se guarda en color: el blanco y negro lo pone el filtro CSS de `.photo` en Hero.module.css (grayscale y contraste), no el archivo. Un WebP ya en blanco y negro se ve igual en pantalla (medido el 2026-11-17).
- Logos de redes en el color del texto de su panel: negros oficiales sobre Signal y blancos sobre Graphite (Contacto a ≤ 900 px), con <picture>; un logo negro sobre fondo oscuro no se lee.
- Favicon: el PNG del autor, recortado sin su margen transparente para que llene el cuadro de 16 px de la pestaña como el anterior (con margen se veía pequeño). Se conserva el diseño completo aunque a 16 px el anillo y los < > no se lean: el autor descartó la variante de solo letras (2026-11-18). Sin SVG: el logo solo existe en mapa de bits. Script y hashes en docs/FAVICON.md.

## Aprendizajes y errores a evitar
- git mv no sirve con archivos sin commitear: usar mv y git add.
- Si existe cualquier CLAUDE.md, Claude Code ignora AGENTS.md salvo por la importación @AGENTS.md.
- Una comprobación de ausencia (grep sobre dist/, layout-shift a 0) necesita un control positivo, o pasa sin probar nada.
- Git no mira dentro de un directorio ignorado: .claude/ está en mi gitignore global y cada pieza nueva de .claude/ necesita su excepción en el .gitignore del repo.
- Al verificar commits con checkout: usar stash, nunca checkout --force.
- El push lo hago yo (con ! o en PowerShell), nunca con el botón de VS Code; el agente no se entera de lo que pasa fuera de la sesión: contrasta con git al empezar.
- No editar archivos con Get-Content/Set-Content de PowerShell 5.1: corrompe la codificación; usar la herramienta de edición.
- Con css: false, Vitest no entrega el texto de un CSS: los tests leen el archivo de disco, y no ven la cascada; lo que dependa de ella se comprueba en el navegador.
- user-event se cuelga con los temporizadores falsos de Vitest: esos tests usan el reloj real o fireEvent.
- Un test que ya pasa contra el esbozo puede estar pasando en vacío: verlo en rojo primero o comprobarlo con una mutación.
- Con la cortina, los paneles son sticky: scrollIntoView sobre un panel fijado acaba en otro sitio; se calcula su posición en el flujo.
- La pausa global congela toda animación: lo que entra una sola vez (la barra fija) necesita su excepción o se queda invisible.
- TaskStop cierra npx pero no el proceso de Vite: comprobar los puertos al terminar y cerrar solo los propios (el 5173 es del autor).
- En el servidor de desarrollo, un selector `[class*="_x_"]` coincide con la clase de igual nombre de otro módulo.
- Un clon nuevo con core.autocrlf=true salía en CRLF y rompía los tests byte a byte de los logos. Desde «chore: add .gitattributes to normalize line endings», .gitattributes (`* text=auto eol=lf`) fuerza LF en cualquier clon; un clon anterior se arregla pasando sus archivos a LF y refrescando el índice (git add de los idénticos, por ruta).
- Un <picture> con display: contents deja que su <source> cuente como elemento flexible y sume un hueco: el <picture> va como un solo elemento (display: flex).

## Próximos pasos
1. Los pendientes del autor y las comprobaciones de PLAN.md; después, las fases 8 a 10.
