/**
 * Consultas de medios que también necesita el JavaScript. Los anchos deben
 * coincidir con los breakpoints anotados en styles/tokens.css.
 */
export const mediaQueries = {
  /** Ancho al que la navegación pliega sus enlaces y controles en un menú. */
  compactNav: '(max-width: 900px)',
  /** Dispositivos sin puntero que se pose, como los táctiles. */
  noHover: '(hover: none)',
} as const
