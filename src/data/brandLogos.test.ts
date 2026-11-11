import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { technologies } from '@/data/technologies'

// Los logos se leen de disco, desde la raíz del repo: lo que se comprueba es
// el archivo que se publica.
const DIR = 'public/tech'
const EXPECTED = [
  'python.svg',
  'javascript.svg',
  'typescript.svg',
  'git.svg',
  'html.svg',
  'mysql.svg',
  'react.svg',
  'n8n.svg',
  'css.svg',
  'spring-boot.svg',
  'spring-security.svg',
  'postgresql.svg',
  'docker.svg',
]

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
  // Simple Icons 16.35.0 -> icons/<slug>.svg (CC0 1.0)
  'mysql.svg': '67c144cc3e44ad14062a3f20ebe29c5e7eeb2c2c9c0f43cf48d87fe6291a8b2d',
  'react.svg': 'ab9136a1a4a8be72ac6743e1bdd1912d878bd68d57787ea7a6c6838e3b23c01c',
  'n8n.svg': 'f5a606188c78bf134fe7d85ae3d1310f6f4b7beafcd1d2fbdef2af02c92240a8',
  'css.svg': '9a97b95e3207aa4a6545dbb862e22450a01f37201c00e6b7d9c2958b59ca9ff9',
  // https://spring.io/img/projects/spring-boot.svg
  'spring-boot.svg': '8f9ccd66abde74dd74fde03541f4295bf5e55242b502167b38deeb6bee69c145',
  // https://spring.io/img/projects/spring-security.svg
  'spring-security.svg': '96afd13b56af0eac6a96fcedcac63d4274fa15655e2b713428041e7cfae9d91b',
  // https://wiki.postgresql.org/images/a/a4/PostgreSQL_logo.3colors.svg, con
  // LF: el oficial trae CRLF (ver POSTGRESQL_CRLF_SHA256)
  'postgresql.svg': 'fe85bc84bce23d01bfe7e8c21715a21b5c011f6e2e1b7b431a8079ce6e4765cc',
  // https://www.docker.com/static/Docker-Logos-1.zip -> SVG/docker-mark-ocean-blue.svg
  'docker.svg': '0fd7f9164de13672bb1708ac7cc401ed439eb938ffa7358d5cb278e107904687',
}

/**
 * Logos oficiales que traen su propio <style>. Se admite solo en estos
 * archivos, solo con este contenido exacto (sin contar los espacios) y solo
 * mientras el archivo sea el oficial (su test de hash sigue igual).
 */
const ALLOWED_STYLE: Record<string, string> = {
  'spring-boot.svg': '.st0{fill:#6DB33F;}',
  'spring-security.svg': '.cls-1{fill:#6bb344;}',
  'docker.svg': '.st0 { fill: none; } .st1 { fill: #2560ff; } .st2 { clip-path: url(#clippath); }',
}

/** DOCTYPE admitido solo en postgresql.svg: el público de SVG 1.1, sin subconjunto interno. */
const ALLOWED_DOCTYPE: Record<string, string> = {
  'postgresql.svg':
    '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">',
}

/** SHA-256 del oficial de PostgreSQL tal como se descarga, con CRLF en todas sus líneas. */
const POSTGRESQL_CRLF_SHA256 = '51f93e19516081fc7d6fe6ab9bbab07abe5f7819e28016eefacea6dea691bc54'

const withoutSpaces = (css: string) => css.replace(/\s+/g, '')

/**
 * Glifos de Simple Icons: se publican sin color y aquí llevan añadido el fill
 * de su color de marca, el de los datos de Simple Icons 16.35.0. Es la única
 * modificación que admite docs/LOGOS.md.
 */
const SIMPLE_ICONS_FILL: Record<string, string> = {
  'mysql.svg': '#4479A1',
  'react.svg': '#61DAFB',
  'n8n.svg': '#EA4B71',
  'css.svg': '#663399',
}

/** Logos a los que se añade el comentario de atribución; el resto va intacto. */
const WITH_ADDED_COMMENT = ['git.svg', 'html.svg', ...Object.keys(SIMPLE_ICONS_FILL)]

/** El archivo oficial: sin el comentario añadido y, en un glifo, sin su fill. */
const official = (file: string) => {
  const content = WITH_ADDED_COMMENT.includes(file)
    ? text(file).replace(ADDED_COMMENT, '')
    : text(file)
  const fill = SIMPLE_ICONS_FILL[file]
  return fill ? content.replace(`<svg fill="${fill}" `, '<svg ') : content
}

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
      expect(technologies.map((technology) => technology.logo)).toContain(`tech/${file}`)
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
      // El <style> solo se admite en los archivos de ALLOWED_STYLE.
      it('no lleva scripts, imágenes incrustadas, HTML ni enlaces', () => {
        const forbidden = ['script', 'image', 'foreignObject', 'iframe', 'a', 'style'].filter(
          (name) => !(name === 'style' && file in ALLOWED_STYLE),
        )
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

      // Entidades y subconjuntos internos, en ninguno. DOCTYPE, solo el
      // admitido en ALLOWED_DOCTYPE, y exactamente ese.
      it('no declara entidades, y DOCTYPE solo el admitido', () => {
        const doctypes = text(file).match(/<!DOCTYPE[^>]*>/gi) ?? []
        const allowed = ALLOWED_DOCTYPE[file]

        expect(text(file)).not.toMatch(/<!ENTITY/i)
        doctypes.forEach((doctype) => expect(doctype).not.toContain('['))
        expect(doctypes.map(withoutSpaces)).toEqual(allowed ? [withoutSpaces(allowed)] : [])
      })
    })

    it('no tiene finales de línea CR', () => {
      expect(text(file)).not.toContain('\r')
    })

    // Sin alterar: el dibujo es el del archivo oficial.
    it('coincide con el archivo oficial', async () => {
      expect(await sha256(official(file))).toBe(OFFICIAL_SHA256[file])
    })
  })

  describe.each(Object.keys(ALLOWED_STYLE))('<style> admitido en %s', (file) => {
    const styles = () => [...parse(file).querySelectorAll('style')].map((style) => style.textContent)

    it('lleva un solo <style>, con exactamente el contenido del archivo oficial', () => {
      expect(styles().map((css) => withoutSpaces(css ?? ''))).toEqual([
        withoutSpaces(ALLOWED_STYLE[file] ?? ''),
      ])
    })

    // El test de referencias mira los atributos; este, el texto del <style>.
    it('todo url() de su <style> apunta a un elemento del propio archivo', () => {
      const urls = styles().flatMap((css) => [...(css ?? '').matchAll(/url\(([^)]*)\)/g)])

      urls.forEach(([, target = '']) => expect(target).toMatch(/^['"]?#/))
    })
  })

  // Aquí va con LF; devolverle el CRLF de todas sus líneas da el archivo oficial.
  it('postgresql.svg, con sus finales de línea en CRLF, es el archivo oficial', async () => {
    expect(await sha256(text('postgresql.svg').replace(/\n/g, '\r\n'))).toBe(POSTGRESQL_CRLF_SHA256)
  })

  it('ningún otro logo lleva <style>', () => {
    EXPECTED.filter((file) => !(file in ALLOWED_STYLE)).forEach((file) => {
      expect(parse(file).querySelector('style'), file).toBeNull()
    })
  })

  describe.each(Object.keys(SIMPLE_ICONS_FILL))('glifo de Simple Icons %s', (file) => {
    const root = () => parse(file).documentElement

    it('su único cambio es el fill de su color de marca, en la raíz', () => {
      expect(root().getAttribute('fill')).toBe(SIMPLE_ICONS_FILL[file])
      expect(text(file).replace(ADDED_COMMENT, '').match(/\bfill=/g)).toHaveLength(1)
    })

    it('el comentario dice de dónde sale, su versión, su licencia y el cambio', () => {
      const comment = ADDED_COMMENT.exec(text(file))?.[0] ?? ''
      const slug = file.replace('.svg', '')

      expect(comment).toContain(
        `https://github.com/simple-icons/simple-icons/blob/16.35.0/icons/${slug}.svg`,
      )
      expect(comment).toContain('License: CC0 1.0 Universal')
      expect(comment).toContain(`fill="${SIMPLE_ICONS_FILL[file] ?? ''}"`)
    })

    // docs/LOGOS.md registra el original y el modificado, como pide su regla.
    it('docs/LOGOS.md registra el SHA-256 del original y el del archivo modificado', async () => {
      const record = readFileSync('docs/LOGOS.md', 'utf8')
      const fileHash = await sha256(text(file))
      const row = record.split('\n').find((line) => line.startsWith(`| \`${file}\``)) ?? ''

      expect(row).toContain(fileHash)
      expect(row).toContain(OFFICIAL_SHA256[file])
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
