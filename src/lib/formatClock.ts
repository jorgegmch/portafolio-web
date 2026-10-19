/**
 * Hora y minutos en formato de 24 horas (HH:MM) en una zona horaria IANA,
 * sea cual sea la del visitante. Sin la zona, o si el entorno no la conoce,
 * devuelve «--:--» en vez de una hora equivocada.
 */
export const formatClock = (date: Date, timeZone: string): string => {
  try {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone,
    }).format(date)
  } catch {
    return '--:--'
  }
}
