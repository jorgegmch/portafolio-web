/**
 * Fragmentos de la cinta de código (spec §3.3): los del tablero eran
 * ilustrativos, y estos son recortes literales de los repos (regla de
 * contenido veraz). No se traducen. Origen de cada uno:
 *
 * - `@RestController`: jorgegmch/logitrack-api@d34a5ae,
 *   src/main/java/com/jorgegmch/logitrack/controller/AuthController.java:25
 * - `SELECT AVG(total_sin_iva)`: jorgegmch/gaseosas-del-valle-db@f065718,
 *   scripts/gdv_functions.sql:60
 * - `docker compose up --build`: jorgegmch/logitrack-iq@3a53005, README.md:158
 * - `new McpServer({`: jorgegmch/logitrack-iq@3a53005, mcp-server/src/index.js:116
 * - `Jwts.parser()`: jorgegmch/logitrack-api@d34a5ae,
 *   src/main/java/com/jorgegmch/logitrack/security/JwtService.java:62
 * - `npm test`: este repo, AGENTS.md (sección Comandos)
 * - `git log --oneline -3`: este repo, AGENTS.md (sección Memoria)
 * - `useEffect(() => {`: este repo, src/components/layout/LoadingIntro.tsx
 */
export const codeFragments = [
  '@RestController',
  'SELECT AVG(total_sin_iva)',
  'docker compose up --build',
  'new McpServer({',
  'Jwts.parser()',
  'npm test',
  'git log --oneline -3',
  'useEffect(() => {',
] as const
