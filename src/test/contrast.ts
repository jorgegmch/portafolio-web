/** Luminancia relativa de un color #rrggbb, según WCAG 2. */
const luminance = (hex: string) => {
  const channels = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!channels) throw new Error(`Color no hexadecimal: «${hex}»`)
  const [red = 0, green = 0, blue = 0] = channels.slice(1).map((channel) => {
    const value = Number.parseInt(channel, 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

/**
 * Contraste WCAG entre dos colores #rrggbb, de 1 a 21; da igual cuál va
 * delante. Cada test lee sus tokens de tokens.css y le pasa los valores. Un
 * color translúcido o abreviado no se puede medir: lanza un error.
 */
export const contrastRatio = (foreground: string, background: string) => {
  const [lighter = 0, darker = 0] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a,
  )
  return (lighter + 0.05) / (darker + 0.05)
}
