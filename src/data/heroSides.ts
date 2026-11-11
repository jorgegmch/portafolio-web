import type { TechnologyId } from '@/data/technologies'
import type { CodeSegment } from '@/data/translator'

/**
 * Ventana de código del panel izquierdo del Hero (spec v2.1 §3.1): un
 * archivo real de logitrack-api, copiado sin retocar (regla de contenido
 * veraz). Es decorativa: el Hero la deja fuera del árbol accesible.
 *
 * Origen: jorgegmch/logitrack-api@d34a5ae,
 * src/main/java/com/jorgegmch/logitrack/controller/AuthController.java,
 * líneas 25, 26, 28 y 44; «// …» marca las que se saltan (27 y 29-43).
 */
export const heroCodeWindow = {
  file: 'AuthController.java',
  lines: [
    [{ text: '@RestController', kind: 'keyword' }],
    [
      { text: '@RequestMapping', kind: 'keyword' },
      { text: '(' },
      { text: '"/auth"', kind: 'string' },
      { text: ')' },
    ],
    [{ text: 'public class', kind: 'keyword' }, { text: ' AuthController {' }],
    [{ text: '    // …', kind: 'comment' }],
    [
      { text: '    ' },
      { text: '@PostMapping', kind: 'keyword' },
      { text: '(' },
      { text: '"/login"', kind: 'string' },
      { text: ')' },
    ],
  ],
} as const satisfies { file: string; lines: readonly (readonly CodeSegment[])[] }

/**
 * Fichas «// stack principal» del panel derecho del Hero (spec v2.1 §3.1),
 * en su orden. Cada una es una tecnología del catálogo, con su logo.
 */
export const heroStack = [
  'java',
  'spring-boot',
  'postgresql',
  'docker',
  'n8n',
  'python',
] as const satisfies readonly TechnologyId[]
