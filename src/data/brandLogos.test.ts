import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { technologies } from '@/data/technologies'

// Los logos se leen de disco, desde la raíz del repo: lo que se comprueba es
// el archivo que se publica.
const DIR = 'public/tech'
const EXPECTED = ['python.svg', 'javascript.svg', 'typescript.svg', 'git.svg', 'html.svg']

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const CC_BY_3 = 'Creative Commons Attribution 3.0 Unported License'
const CC_BY_3_URL = 'https://creativecommons.org/licenses/by/3.0/'

/** Comentario de atribución que este repo añade al principio de un logo. */
const ADDED_COMMENT = /^<!--[\s\S]*?-->\n/

/**
 * SHA-256 del archivo oficial de cada logo, calculado sobre la descarga de su
 * fuente. Python, JavaScript y TypeScript van idénticos byte a byte. A Git y a
 * HTML5 se les añade el comentario de atribución, y el oficial de HTML5 trae
 * finales de línea CRLF que aquí van en LF: su hash es el del oficial con LF.
 */
const OFFICIAL_SHA256: Record<string, string> = {
  // https://www.python.org/community/logos/ -> python-logo-only.svg
  'python.svg': 'baec8662a1461c2cacc326b54d2727cb2f1ce07ba02d00f5b826d035104f649f',
  // https://github.com/voodootikigod/logo.js -> js.svg
  'javascript.svg': 'a70a3d8d36ea6b0e614a04ec30d5a4fb2bf36d515492cb84050ded2b84d14393',
  // https://www.typescriptlang.org/branding/ -> ts-logo-512.svg
  'typescript.svg': '139ae451b37a00251fe24358191699efa665f63f1c8369cb9dad833159e159e2',
  // https://git-scm.com/community/logos -> Git-Icon-1788C.svg
  'git.svg': '1080a5430edb6278dc03e4b04efc16c8bed5b943408d648ad721a28836814220',
  // https://www.w3.org/html/logo/ -> HTML5_Badge.svg, con LF
  'html.svg': '6e3fc58300e722bcb19bd2909d84ab4166e0034e55c75034e6b72d58d62b752e',
}

/** Logos a los que se añade el comentario de atribución; el resto va intacto. */
const WITH_ADDED_COMMENT = ['git.svg', 'html.svg']

const path = (file: string) => `${DIR}/${file}`
const text = (file: string) => readFileSync(path(file), 'utf8')

const sha256 = async (content: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

const parse = (file: string) => new DOMParser().parseFromString(text(file), 'image/svg+xml')

/** Todos los elementos del documento, con sus atributos como pares [nombre, valor]. */
const elements = (file: string) =>
  [...parse(file).querySelectorAll('*')].map((element) => ({
    name: element.localName,
    attributes: [...element.attributes].map(({ name, value }) => [name, value] as const),
  }))

describe('logos de marca con archivo oficial', () => {
  describe('lista', () => {
    it('no se repite ninguno', () => {
      expect(new Set(EXPECTED).size).toBe(EXPECTED.length)
    })

    // Una sola fuente: no se publica un logo que el catálogo no asigne.
    it.each(EXPECTED)('%s pertenece a una tecnología del catálogo', (file) => {
      expect(technologies.flatMap((technology) => technology.logos)).toContain(file)
    })

    it('todos tienen su hash oficial registrado', () => {
      expect(Object.keys(OFFICIAL_SHA256).sort()).toEqual([...EXPECTED].sort())
    })
  })

  describe.each(EXPECTED)('%s', (file) => {
    it('existe en public/tech', () => {
      expect(existsSync(path(file))).toBe(true)
    })

    describe('carga', () => {
      it('es XML bien formado', () => {
        expect(parse(file).querySelector('parsererror')).toBeNull()
      })

      it('su raíz es un svg con tamaño propio', () => {
        const root = parse(file).documentElement

        expect(root.localName).toBe('svg')
        expect(root.namespaceURI).toBe(SVG_NAMESPACE)
        expect(root.hasAttribute('viewBox') || root.hasAttribute('width')).toBe(true)
      })
    })

    describe('no carga ni ejecuta nada de fuera', () => {
      it('no lleva scripts, imágenes incrustadas, HTML ni enlaces', () => {
        const forbidden = ['script', 'image', 'foreignObject', 'iframe', 'a', 'style']
        const names = elements(file).map(({ name }) => name)

        expect(names.length).toBeGreaterThan(0)
        forbidden.forEach((name) => expect(names).not.toContain(name))
      })

      it('no lleva manejadores de eventos', () => {
        const attributes = elements(file).flatMap(({ attributes }) => attributes)

        attributes.forEach(([name]) => expect(name).not.toMatch(/^on/i))
      })

      // Las URL de espacios de nombres (xmlns) son identificadores: el
      // navegador no las descarga. Lo que se vigila es lo que sí cargaría.
      it('sus referencias apuntan solo a elementos del propio archivo', () => {
        const attributes = elements(file).flatMap(({ attributes }) => attributes)
        const references = attributes.filter(([name]) => /(^|:)(href|src)$/.test(name))
        const urls = attributes.flatMap(([, value]) => [...value.matchAll(/url\(([^)]*)\)/g)])

        references.forEach(([, value]) => expect(value).toMatch(/^#/))
        urls.forEach(([, target = '']) => expect(target).toMatch(/^['"]?#/))
      })

      it('no declara DOCTYPE ni entidades', () => {
        expect(text(file)).not.toMatch(/<!DOCTYPE|<!ENTITY/i)
      })
    })

    it('no tiene finales de línea CR', () => {
      expect(text(file)).not.toContain('\r')
    })

    // Sin alterar: el dibujo es el del archivo oficial.
    it('coincide con el archivo oficial', async () => {
      const content = WITH_ADDED_COMMENT.includes(file)
        ? text(file).replace(ADDED_COMMENT, '')
        : text(file)

      expect(await sha256(content)).toBe(OFFICIAL_SHA256[file])
    })
  })

  describe('atribución', () => {
    it.each(WITH_ADDED_COMMENT)('%s empieza por el comentario añadido', (file) => {
      expect(text(file)).toMatch(ADDED_COMMENT)
    })

    it.each(EXPECTED.filter((file) => !WITH_ADDED_COMMENT.includes(file)))(
      '%s no lleva nada añadido',
      (file) => {
        expect(text(file)).not.toMatch(ADDED_COMMENT)
      },
    )

    it('Git: Jason Long y la licencia CC BY 3.0, con su URL', () => {
      const comment = ADDED_COMMENT.exec(text('git.svg'))?.[0] ?? ''

      expect(comment).toContain(`Git Logo by Jason Long is licensed under the ${CC_BY_3}`)
      expect(comment).toContain(CC_BY_3_URL)
    })

    it('HTML5: el W3C y la licencia CC BY 3.0, con su URL', () => {
      const comment = ADDED_COMMENT.exec(text('html.svg'))?.[0] ?? ''

      expect(comment).toContain('This work is attributed to the W3C')
      expect(comment).toContain(CC_BY_3)
      expect(comment).toContain(CC_BY_3_URL)
    })

    // El aviso viene dentro del archivo oficial; aquí no se añade nada.
    it('JavaScript: conserva el aviso de la licencia MIT del archivo oficial', () => {
      expect(text('javascript.svg')).toContain('The MIT License (MIT)')
      expect(text('javascript.svg')).toContain('Copyright (c) 2011 Christopher Williams')
    })
  })
})
