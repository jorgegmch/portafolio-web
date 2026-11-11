/**
 * Consultas de medios que también necesita el JavaScript. Los anchos deben
 * coincidir con los breakpoints anotados en styles/tokens.css.
 */
export const mediaQueries = {
  /** Ancho al que la navegación pliega sus enlaces y controles en un menú. */
  compactNav: '(max-width: 900px)',
  /** Dispositivos sin puntero que se pose, como los táctiles. */
  noHover: '(hover: none)',
  /** Un puntero preciso que se pose encima: ratón o lápiz, no un dedo. */
  finePointer: '(hover: hover) and (pointer: fine)',
  /** Ancho al que Contacto apila sus paneles y los canales pasan de Signal a Graphite. */
  stackedContact: '(max-width: 900px)',
} as const
