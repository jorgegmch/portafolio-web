/** Una cantidad a dos cifras como mínimo: 5 → «05», 12 → «12». */
export const twoDigits = (value: number): string => String(value).padStart(2, '0')
