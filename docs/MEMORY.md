# MEMORY.md — portafolio-web
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. El checklist de fases está en docs/PLAN.md.

## Estado actual
- Fases 1 a 3 cerradas en rebuild/vite-react (scaffold, config, data, i18n, lib, hooks, ContactButton). Sin push.
- Falta la Fase 4 (tokens, fuentes, Navbar, Footer, fondo de partículas); la paleta se aprueba antes de aplicarla.
- Las reglas de .claude/rules/ y los límites de AGENTS.md ya existen.
- Las descripciones de proyectos están sincronizadas con GitHub.

## Decisiones (y por qué)
- npm (único gestor instalado), react-router (ruta /certificaciones) y CSS Modules (decididos en la Fase 0).
- Un solo tema oscuro; no hay useTheme: evita código sin uso.
- El contacto se ensambla al interactuar y es un botón, no un enlace: un href inicial expondría el dato en el DOM antes del clic. Es ofuscación, no protección real.
- La fecha de nacimiento se codificará como el contacto: frena scrapers simples; el historial se reescribe antes del primer push.
- ?lang= no se guarda; solo la elección con el selector: un enlace compartido no cambia la preferencia de quien lo abre.
- 5 proyectos destacados y enlace a GitHub: 16 tarjetas diluyen los mejores.
- La tarjeta cuenta los 16 proyectos curados; el fork, el monorepo de práctica y portafolio-web no cuentan (reconsiderar portafolio-web en la Fase 10).
- El CRM se presenta con la descripción de su repo (módulo de un MVP hecho en equipo); su README aclara que el CRM completo es privado y que corre solo con JSON Server.
- Certificaciones solo como texto en /certificaciones: los PDFs originales llevan la cédula.
- Fuentes con @fontsource y animaciones con canvas propio: sin peticiones a terceros ni librerías extra.
- Diseño pensado primero para escritorio y adaptado a tablet y teléfono; en táctil el fondo pasa a modo reducido.
- Commits en inglés: el historial de un repo público lo lee quien lo revise.
- AGENTS.md se mantiene corto (tope práctico ~90 líneas), con seguridad y límites para que toda herramienta los vea: cada línea que carga siempre compite por atención; el detalle por área va a .claude/rules/ (carga por rutas).

## Aprendizajes y errores a evitar
- git mv no sirve con archivos sin commitear: usar mv y git add.
- Si existe cualquier CLAUDE.md, Claude Code ignora AGENTS.md salvo por la importación @AGENTS.md.
- Una comprobación de ausencia (grep sobre dist/) necesita un control positivo, o pasa sin probar nada.
- Git no mira dentro de un directorio ignorado: .claude/ está en mi gitignore global y cada pieza nueva de .claude/ necesita su excepción en el .gitignore del repo.
- Al verificar commits con checkout: usar stash, nunca checkout --force.
- Las reglas de .claude/rules/ se descubren al iniciar la sesión (reiniciar tras crearlas) y las de rutas cargan al leer un archivo coincidente; verificado en Windows nativo con una marca de prueba.

## Próximos pasos
1. Codificar la fecha de nacimiento y reescribir el historial (commits en inglés) antes del primer push.
2. Fase 4: plan por commits y paleta para aprobar.
3. Bucle agéntico (skills, hooks, subagente, MCP): ver PLAN.md.
