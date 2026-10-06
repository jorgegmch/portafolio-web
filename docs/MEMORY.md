# MEMORY.md — portafolio-web
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte. El checklist de fases está en docs/PLAN.md.

## Estado actual
- Fases 1 a 3 cerradas en rebuild/vite-react (scaffold, config, data, i18n, lib, hooks, ContactButton). Sin push.
- Falta la Fase 4 (tokens, fuentes, Navbar, Footer, fondo de partículas); la paleta se aprueba antes de aplicarla.
- AGENTS.md es la guía única para agentes; CLAUDE.md solo la importa.

## Decisiones (y por qué)
- Un solo tema oscuro; no hay useTheme: evita código sin uso.
- El contacto se ensambla al interactuar y es un botón, no un enlace: un href inicial expondría el dato en el DOM antes del clic. Es ofuscación, no protección real.
- La fecha de nacimiento se codificará como el contacto: frena scrapers simples; el historial se reescribe antes del primer push.
- ?lang= no se guarda; solo la elección con el selector: un enlace compartido no cambia la preferencia de quien lo abre.
- 5 proyectos destacados y enlace a GitHub: 16 tarjetas diluyen los mejores.
- crm-registro-campers se presenta como módulo frontend de un MVP en equipo: no sugerir más de lo que muestra el repo.
- Certificaciones solo como texto en /certificaciones: los PDFs originales llevan la cédula.
- Fuentes con @fontsource y animaciones con canvas propio: sin peticiones a terceros ni librerías extra.
- Diseño pensado primero para escritorio y adaptado a tablet y teléfono; en táctil el fondo pasa a modo reducido.
- Reglas detalladas en .claude/rules/ (carga por rutas); seguridad y límites en AGENTS.md para que toda herramienta las vea.
- AGENTS.md se mantiene corto: cada línea que carga siempre compite por atención; el detalle por área va a .claude/rules/.

## Aprendizajes y errores a evitar
- git mv no sirve con archivos sin commitear: usar mv y git add.
- Si existe cualquier CLAUDE.md, Claude Code ignora AGENTS.md salvo por la importación @AGENTS.md.
- Cada commit debe pasar lint, typecheck y tests por sí solo.
- Una comprobación de ausencia (grep sobre dist/) necesita un control positivo, o pasa sin probar nada.
- eslint-plugin-boundaries se descartó por vulnerabilidades; jsx-a11y funciona con ESLint 10 mediante overrides.
- Las descripciones de GitHub deben coincidir con las del sitio.

## Próximos pasos
1. Codificar la fecha de nacimiento y reescribir el historial antes del primer push (decidir también el idioma de los commits).
2. Crear .claude/rules/ y la sección de límites en AGENTS.md.
3. Fase 4: plan por commits y paleta para aprobar.
