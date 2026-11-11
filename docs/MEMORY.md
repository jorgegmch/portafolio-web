# MEMORY.md — portafolio-web
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. El checklist de fases y los pendientes están en docs/PLAN.md.

## Estado actual
- Fases 1 a 5 en rebuild/vite-react (al día con origin). La Fase 6 se hizo con el rediseño v2 y v2.1 en redesign/v2, ya en origin hasta f7fb1a1; la Fase 7 (/certificaciones) se retiró.
- Rediseño v2.1 cerrado el 2026-11-11 (hasta b4b681c): fuente de verdad, docs/design/redesign-v2/DESIGN-SPEC.md. Pendientes en PLAN.md, «Pendientes del rediseño v2.1».
- Correcciones del 2026-11-11 (7b58543 a db7adbe, solo en local hasta que el autor haga push): spec nueva, logos negros oficiales en Contacto, «Ver código» sin logo, hover del Hero con realce Signal y texto nuevo de «Comunicación estratégica».
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
- Logos de redes en el color del texto de su panel: negros oficiales sobre Signal y blancos sobre Graphite (Contacto a ≤ 900 px), con <picture>; un logo negro sobre fondo oscuro no se lee.

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
- Un clon nuevo con core.autocrlf=true sale en CRLF y rompe los tests byte a byte de los logos: en este clon, core.autocrlf=input y pasar los archivos a LF; después, git status los marca hasta refrescar el índice (git add de los idénticos, por ruta).
- Un <picture> con display: contents deja que su <source> cuente como elemento flexible y sume un hueco: el <picture> va como un solo elemento (display: flex).

## Próximos pasos
1. Los pendientes del autor y las comprobaciones de PLAN.md; después, las fases 8 a 10.
