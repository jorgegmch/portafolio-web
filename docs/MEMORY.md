# MEMORY.md — portafolio-web
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. El checklist de fases está en docs/PLAN.md.

## Estado actual
- Fases 1 a 4 cerradas en rebuild/vite-react y subidas a origin, sin merge.
- Sigue la Fase 5 (animación de carga). Después, tres encargos ya aprobados: Hero, transición de idioma y cursor glitch; están en PLAN.md.
- Las reglas de .claude/rules/ y los límites de AGENTS.md ya existen.
- Las descripciones de proyectos están sincronizadas con GitHub.

## Decisiones (y por qué)
- npm (único gestor instalado), react-router (ruta /certificaciones) y CSS Modules (decididos en la Fase 0).
- Un solo tema oscuro; no hay useTheme: evita código sin uso.
- El contacto se ensambla al interactuar y es un botón, no un enlace: un href inicial expondría el dato en el DOM antes del clic. Es ofuscación, no protección real.
- La fecha de nacimiento va codificada con su propio desplazamiento: frena scrapers simples; es ofuscación, no protección real.
- ?lang= no se guarda; solo la elección con el selector: un enlace compartido no cambia la preferencia de quien lo abre.
- 5 proyectos destacados y enlace a GitHub: 16 tarjetas diluyen los mejores.
- La tarjeta cuenta los 16 proyectos curados; el fork, el monorepo de práctica y portafolio-web no cuentan (reconsiderar portafolio-web en la Fase 10).
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

## Aprendizajes y errores a evitar
- git mv no sirve con archivos sin commitear: usar mv y git add.
- Si existe cualquier CLAUDE.md, Claude Code ignora AGENTS.md salvo por la importación @AGENTS.md.
- Una comprobación de ausencia (grep sobre dist/) necesita un control positivo, o pasa sin probar nada.
- Git no mira dentro de un directorio ignorado: .claude/ está en mi gitignore global y cada pieza nueva de .claude/ necesita su excepción en el .gitignore del repo.
- Al verificar commits con checkout: usar stash, nunca checkout --force.
- Las reglas de .claude/rules/ se descubren al iniciar la sesión (reiniciar tras crearlas) y las de rutas cargan al leer un archivo coincidente; verificado en Windows nativo con una marca de prueba; y, importadas con @, quedan cargadas siempre (también al crear archivos nuevos).
- Vitest sale con código 1 si no hay ningún archivo de test: configura el runner junto al primer test; en los commits 5 a 8 pasa por eso, no por un test roto.
- El push lo hago yo (con ! o en PowerShell), nunca con el botón de VS Code; el agente no se entera de lo que pasa fuera de la sesión: contrasta con git al empezar.
- No editar archivos con Get-Content/Set-Content de PowerShell 5.1: corrompe la codificación; usar la herramienta de edición.
- El proyecto no tiene Prettier configurado: lanzarlo reformatea el archivo con su estilo por defecto.
- Con css: false, Vitest no entrega el texto de un CSS ni con ?raw; los tests que comprueban reglas leen el archivo de disco.

## Próximos pasos
1. Fase 5: seguir «Cómo retomar» de PLAN.md.
2. Extensiones de Claude Code pendientes (hooks, subagente, verify-contact): ver PLAN.md.
