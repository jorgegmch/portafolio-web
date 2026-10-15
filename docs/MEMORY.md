# MEMORY.md — portafolio-web
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. El checklist de fases está en docs/PLAN.md.

## Estado actual
- Fases 1 a 5 cerradas en rebuild/vite-react y subidas a origin, sin merge.
- Fase 6 abierta: Hero y «Sobre mí» hechos; faltan Tecnologías, Proyectos y Contacto. Pendientes y decisiones de la fase en docs/CIERRE-FASE-6.md. «Sobre mí» (desde a5ad05e) está sin subir: el push lo hace el autor.
- Siguen dos encargos aprobados: transición de idioma (Fase 7) y cursor glitch; están en PLAN.md y ninguno se ejecuta sin que el autor lo pida.
- Las descripciones de proyectos están sincronizadas con GitHub.

## Decisiones (y por qué)
- npm (único gestor instalado), react-router (ruta /certificaciones) y CSS Modules (decididos en la Fase 0).
- Un solo tema oscuro; no hay useTheme: evita código sin uso.
- El correo y el teléfono se muestran como texto en la sección de contacto y van en los PDFs del CV: un cliente debe poder leerlos y copiarlos sin pasos. En el Hero y el pie siguen siendo botones que ensamblan el dato en el clic. En el repo y en el bundle siguen codificados; es ofuscación del código fuente, no protección real.
- La fecha de nacimiento va codificada con su propio desplazamiento: frena scrapers simples; es ofuscación, no protección real.
- ?lang= no se guarda; solo la elección con el selector: un enlace compartido no cambia la preferencia de quien lo abre.
- 5 proyectos destacados y enlace a GitHub: 17 tarjetas diluyen los mejores.
- La tarjeta cuenta los 14 proyectos con `built: true`, portafolio-web incluido; no cuentan el fork (FastCat), learning-path-fundamentals ni los 3 repos de scripts de BD. La cifra sale de `builtProjects.length`.
- El CRM se presenta con la descripción de su repo (módulo de un MVP hecho en equipo); su README aclara que el CRM completo es privado y que corre solo con JSON Server.
- Certificaciones solo como texto en /certificaciones: los PDFs originales llevan la cédula.
- Fuentes con @fontsource y animaciones con canvas propio: sin peticiones a terceros ni librerías extra.
- Diseño pensado primero para escritorio y adaptado a tablet y teléfono; en táctil el fondo pasa a modo reducido.
- Commits en inglés: el historial de un repo público lo lee quien lo revise.
- AGENTS.md se mantiene corto (tope práctico ~150 líneas); las reglas de .claude/rules/ se importan con @ y siempre están cargadas, para que sean vinculantes y se vean en /memory.
- No se hace merge a main hasta la Fase 10: GitHub Pages sirve main y un proyecto Vite sin compilar lo dejaría en blanco. Al fusionar: merge commit, no squash, para conservar los commits por causa.
- Dos memorias con reparto: docs/MEMORY.md (versionada) guarda estado y decisiones con su porqué; la memoria automática de Claude Code (local, no versionada) guarda aprendizajes de correcciones y preferencias. No duplicar entre ambas.
- permissions.deny frena solo al agente; mis comandos con ! no se bloquean (verificado solo con git push --dry-run).
- Tres nombres en config/site.ts: el logo muestra site.handle, el h1 del hero site.shortName, y site.legalName queda para la terminal del hero.
- --nav-height (4,5 rem) es una estimación hecha sin navegador: es ajustable si la barra cambia.
- Intro: el foco inicial va a la capa (un foco puesto por código al cargar muestra el anillo sin teclado) y el margen de duración es por fotograma (el retraso crece con los temporizadores encadenados). El resto, en «Cierre de la Fase 5» de PLAN.md.
- Aparición al hacer scroll y escritura de la bio: una vez por carga de página, con el registro en el módulo; recargar lo repite. Guardarlo en sessionStorage cambiaría el contrato de Reveal y useWordReveal: queda como propuesta. Lo que aparece no es lo que escala (el <li> aparece, la caja de dentro escala), para que dos transform no choquen en un elemento.
- Sin control de pausa en la escritura de la bio ni en el parpadeo de su cursor, por decisión del autor; no se afirma que cumpla WCAG 2.2.2.

## Aprendizajes y errores a evitar
- git mv no sirve con archivos sin commitear: usar mv y git add.
- Si existe cualquier CLAUDE.md, Claude Code ignora AGENTS.md salvo por la importación @AGENTS.md.
- Una comprobación de ausencia (grep sobre dist/, layout-shift a 0) necesita un control positivo, o pasa sin probar nada. Un desplazamiento insertado fuera de pantalla no cuenta: el anclaje de scroll lo compensa.
- Git no mira dentro de un directorio ignorado: .claude/ está en mi gitignore global y cada pieza nueva de .claude/ necesita su excepción en el .gitignore del repo.
- Al verificar commits con checkout: usar stash, nunca checkout --force.
- Las reglas de .claude/rules/ se descubren al iniciar la sesión (reiniciar tras crearlas) y las de rutas cargan al leer un archivo coincidente; verificado en Windows nativo con una marca de prueba; y, importadas con @, quedan cargadas siempre (también al crear archivos nuevos).
- El push lo hago yo (con ! o en PowerShell), nunca con el botón de VS Code; el agente no se entera de lo que pasa fuera de la sesión: contrasta con git al empezar.
- No editar archivos con Get-Content/Set-Content de PowerShell 5.1: corrompe la codificación; usar la herramienta de edición.
- Con css: false, Vitest no entrega el texto de un CSS ni con ?raw; los tests que comprueban reglas leen el archivo de disco.
- Un test que lee el texto del CSS no ve la cascada: `.intro { outline: none }` pasaba y Chrome mostraba el anillo, porque el `:focus-visible` de global.css se carga después con la misma especificidad. Lo que dependa de la cascada se comprueba en el navegador.
- user-event se cuelga con los temporizadores falsos de Vitest: esos tests usan el reloj real o fireEvent. Y con temporizadores encadenados se avanza una pausa por `act`: React programa el siguiente al salir.
- Un test que ya pasa contra el esbozo puede estar pasando en vacío: darle un control positivo. Y antes de afirmar qué tests rompe un cambio, comprobarlo (en la Fase 5 la suite no se rompía donde se había previsto).
- Sin extensión de navegador se puede conducir el Chrome instalado en headless por DevTools con un script de Node sin dependencias, contra `vite preview`; en modo desarrollo los tiempos no valen.
- jsdom no tiene AnimationEvent: React escucha webkitAnimationEnd, así que fireEvent.animationEnd no le llega y un test de «no termina» pasa en vacío. En el navegador, animationend.
- En el servidor de desarrollo, un selector `[class*="_x_"]` coincide con la clase de igual nombre de otro módulo (`_intro_` del Hero y de LoadingIntro).

## Próximos pasos
1. Siguiente sección de la Fase 6 (Tecnologías), cuando el autor lo pida, con plan por commits aprobado antes. «Cómo retomar» de PLAN.md aún dice Hero: se corrige en /close-phase 6.
2. Extensiones de Claude Code pendientes (hooks, subagente, verify-contact): ver PLAN.md.
