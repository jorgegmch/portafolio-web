/**
 * Tiempos del rol que rota bajo el nombre del Hero. Los textos viven en los
 * diccionarios (hero.roles).
 *
 * `transitionMs` también está en tokens.css (--duration-role-swap), porque el
 * cambio lo anima el CSS y el temporizador lo cuenta aquí. Un test compara
 * los dos valores.
 */
export const ROLE_ROTATION = {
  /** Lo que se ve cada texto, ya quieto. */
  visibleMs: 4000,
  /** Lo que tarda en salir un texto y entrar el siguiente. */
  transitionMs: 500,
} as const
