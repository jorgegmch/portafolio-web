import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CV_VERSIONS, cvFiles, cvFilesFor, cvUrl, type CvFile } from '@/data/cv'
import { LANGS } from '@/i18n/types'

// Los PDFs se leen de disco, desde la raíz del repo: lo que se comprueba es
// el archivo que se publica.
const DIR = 'public/cv'
const path = (file: string) => `${DIR}/${file}`

const KEBAB_CASE_PDF = /^[a-z0-9]+(-[a-z0-9]+)*\.pdf$/
/** Primeros bytes de todo PDF: «%PDF-». */
const PDF_SIGNATURE = [37, 80, 68, 70, 45]

const SAMPLE: readonly CvFile[] = [
  { lang: 'en', version: 'ats', file: 'sample-ats-en.pdf' },
  { lang: 'es', version: 'ats', file: 'sample-ats-es.pdf' },
  { lang: 'es', version: 'infographic', file: 'sample-infographic-es.pdf' },
]

describe('registro de CVs', () => {
  it('no repite ningún par de idioma y versión', () => {
    const pairs = cvFiles.map(({ lang, version }) => `${lang}/${version}`)
    expect(new Set(pairs).size).toBe(pairs.length)
  })

  it('no repite ningún archivo', () => {
    const files = cvFiles.map(({ file }) => file)
    expect(new Set(files).size).toBe(files.length)
  })

  it('solo usa idiomas del sitio y versiones conocidas', () => {
    for (const { lang, version } of cvFiles) {
      expect(LANGS).toContain(lang)
      expect(CV_VERSIONS).toContain(version)
    }
  })

  describe.each(cvFiles)('$file', ({ lang, version, file }) => {
    it('va en kebab-case y termina en su versión y su idioma', () => {
      expect(file).toMatch(KEBAB_CASE_PDF)
      expect(file.endsWith(`-${version}-${lang}.pdf`)).toBe(true)
    })

    it('existe en public/cv', () => {
      expect(existsSync(path(file))).toBe(true)
    })

    it('es un PDF: empieza por %PDF-', () => {
      const head = [...readFileSync(path(file)).slice(0, PDF_SIGNATURE.length)]
      expect(head).toEqual(PDF_SIGNATURE)
    })
  })
})

describe('cvFilesFor', () => {
  it('devuelve solo los archivos del idioma pedido', () => {
    expect(cvFilesFor('en', SAMPLE).map(({ file }) => file)).toEqual(['sample-ats-en.pdf'])
  })

  it('pone la versión infográfica antes que la ATS, sin importar el orden del registro', () => {
    expect(cvFilesFor('es', SAMPLE).map(({ version }) => version)).toEqual(['infographic', 'ats'])
  })

  it('devuelve una lista vacía si el idioma no tiene archivos', () => {
    expect(cvFilesFor('es', [])).toEqual([])
    expect(cvFilesFor('es', SAMPLE.filter(({ lang }) => lang === 'en'))).toEqual([])
  })

  it('sin lista, usa el registro', () => {
    for (const lang of LANGS) {
      expect(cvFilesFor(lang)).toEqual(cvFilesFor(lang, cvFiles))
      expect(cvFilesFor(lang).every((entry) => entry.lang === lang)).toBe(true)
    }
  })
})

describe('cvUrl', () => {
  it('apunta al archivo dentro de la carpeta pública cv', () => {
    const file = 'sample-ats-en.pdf'
    expect(cvUrl({ file })).toBe(`${import.meta.env.BASE_URL}cv/${file}`)
  })
})
