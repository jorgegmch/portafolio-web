import type { ProjectId } from '@/data/projects'

/**
 * Tramo de una línea de código del Traductor. `keyword` va en el acento y
 * `comment` en el gris de los comentarios; el resto, en el color del texto.
 */
export interface CodeSegment {
  text: string
  kind?: 'keyword' | 'comment'
}

export interface TranslatorExample<Id extends string = string> {
  id: Id
  /** Repo del que sale el fragmento; el enlace «Ver el repo» va a él. */
  project: ProjectId
  /** Archivo del repo, como se muestra junto al proyecto. */
  file: string
  /**
   * Código real del repo, línea a línea y sin retocar salvo la sangría común.
   * Un comentario «// …» marca las líneas que se saltan.
   */
  code: readonly (readonly CodeSegment[])[]
}

/**
 * Ejemplos del Traductor de la escena Perfil, en orden: lo que pide el
 * negocio (en i18n, por id) y el código que lo resuelve, copiado de los
 * repos públicos (regla de contenido veraz). Ruta, líneas y commit de cada
 * fragmento, para comprobarlo:
 *
 * - inventory: jorgegmch/logitrack-iq@3a53005,
 *   src/main/java/com/jorgegmch/logitrack/service/KpiService.java, líneas
 *   122-124 y 130-132 (se saltan las 125-129).
 * - permissions: jorgegmch/logitrack-api@d34a5ae,
 *   src/main/java/com/jorgegmch/logitrack/config/SecurityConfig.java,
 *   líneas 57-59.
 * - news: jorgegmch/n8n-daily-news-agent@4a8d7f2, agente-noticias-ia.json,
 *   líneas 9, 174 y 263 (una de cada nodo: programación, modelo y correo).
 */
const translatorList = [
  {
    id: 'inventory',
    project: 'logitrack-iq',
    file: 'KpiService.java',
    code: [
      [{ text: 'BigDecimal puntoReorden = consumoDiarioPromedio' }],
      [{ text: '        .multiply(BigDecimal.valueOf(diasEntrega))' }],
      [{ text: '        .multiply(FACTOR_SEGURIDAD);' }],
      [{ text: '// …', kind: 'comment' }],
      [{ text: 'if', kind: 'keyword' }, { text: ' (stockTotalDecimal.compareTo(puntoReorden) >= 0) {' }],
      [{ text: '    ' }, { text: 'return', kind: 'keyword' }, { text: ' null;' }],
      [{ text: '}' }],
    ],
  },
  {
    id: 'permissions',
    project: 'logitrack-api',
    file: 'SecurityConfig.java',
    code: [
      [
        { text: '.requestMatchers(HttpMethod.POST, "/productos/**").' },
        { text: 'authenticated', kind: 'keyword' },
        { text: '()' },
      ],
      [
        { text: '.requestMatchers(HttpMethod.PUT, "/productos/**").' },
        { text: 'authenticated', kind: 'keyword' },
        { text: '()' },
      ],
      [
        { text: '.requestMatchers(HttpMethod.DELETE, "/productos/**").' },
        { text: 'hasRole', kind: 'keyword' },
        { text: '("ADMIN")' },
      ],
    ],
  },
  {
    id: 'news',
    project: 'n8n-daily-news-agent',
    file: 'agente-noticias-ia.json',
    code: [
      [{ text: '"triggerAtHour"', kind: 'keyword' }, { text: ': 19' }],
      [{ text: '"modelName"', kind: 'keyword' }, { text: ': "models/gemini-3.5-flash-lite"' }],
      [{ text: '"subject"', kind: 'keyword' }, { text: ': "={{ $json.asunto_correo }}"' }],
    ],
  },
] as const satisfies readonly TranslatorExample[]

export type TranslatorExampleId = (typeof translatorList)[number]['id']

export const translatorExamples: readonly TranslatorExample<TranslatorExampleId>[] = translatorList
