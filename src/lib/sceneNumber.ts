/**
 * Número de escena a dos cifras, desde su posición (base 0) en la página:
 * 0 → «01». Es la numeración de la navegación y de los rótulos de escena.
 */
export const sceneNumber = (index: number): string => String(index + 1).padStart(2, '0')
