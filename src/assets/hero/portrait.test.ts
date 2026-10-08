import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { portrait } from '@/assets/hero/portrait'
import { readWebp, WEBP_IMAGE_CHUNKS, WEBP_METADATA_CHUNKS } from '@/test/webp'

// Los archivos se leen de disco, desde la raíz del repo: lo que se comprueba
// es lo que se publica, no lo que Vite hace con el import.
const DIR = 'src/assets/hero'
const fileName = (width: number) => `portrait-${width}.webp`
const path = (width: number) => `${DIR}/${fileName(width)}`
const read = (width: number) => readWebp(readFileSync(path(width)))

/** Marcas de metadatos buscadas en los bytes, por si vinieran fuera de su chunk. */
const METADATA_MARKERS = ['Exif', '<x:xmpmeta', '<?xpacket', 'ICC_PROFILE', 'c2pa', 'tEXt']

const sources = portrait.sources.map((source) => ({ ...source, file: fileName(source.width) }))
const [small, large] = portrait.sources

describe('retrato del Hero', () => {
  describe('declaración', () => {
    it('hay dos tamaños, el menor primero', () => {
      expect(portrait.sources).toHaveLength(2)
      expect(small.width).toBeLessThan(large.width)
    })

    // Para pantallas de alta densidad: el grande dobla exactamente al pequeño.
    it('el grande mide el doble que el pequeño', () => {
      expect(large.width).toBe(small.width * 2)
      expect(large.height).toBe(small.height * 2)
    })

    it('la proporción reservada es 4:5', () => {
      expect(portrait.aspectRatio).toEqual({ width: 4, height: 5 })
    })

    it.each(sources)('$file se importa desde su archivo', ({ src, file }) => {
      expect(src).toContain(file.replace('.webp', ''))
      expect(src).toMatch(/\.webp$/)
    })
  })

  describe.each(sources)('$file', ({ width, height }) => {
    it('existe', () => {
      expect(existsSync(path(width))).toBe(true)
    })

    it('mide lo que se declara', () => {
      expect(read(width)).toMatchObject({ width, height })
    })

    // Enteros, sin dividir: 4:5 exacto, no aproximado.
    it('su proporción es 4:5 exacta', () => {
      const image = read(width)
      const { aspectRatio } = portrait

      expect(image.width * aspectRatio.height).toBe(image.height * aspectRatio.width)
    })

    it('lleva transparencia', () => {
      expect(read(width).hasAlpha).toBe(true)
    })

    describe('sin metadatos', () => {
      it('no trae chunks de EXIF, XMP ni perfil de color', () => {
        const { chunks } = read(width)

        expect(chunks.length).toBeGreaterThan(0)
        WEBP_METADATA_CHUNKS.forEach((chunk) => expect(chunks).not.toContain(chunk))
      })

      it('solo trae chunks de imagen', () => {
        read(width).chunks.forEach((chunk) => expect(WEBP_IMAGE_CHUNKS).toContain(chunk))
      })

      it('la cabecera no anuncia metadatos', () => {
        expect(read(width).announcesMetadata).toBe(false)
      })

      it('no sobran bytes después de la imagen', () => {
        expect(read(width).trailingBytes).toBe(0)
      })

      it('no hay marcas de metadatos en ninguna parte del archivo', () => {
        const text = new TextDecoder('latin1').decode(readFileSync(path(width)))

        METADATA_MARKERS.forEach((marker) => expect(text).not.toContain(marker))
      })
    })
  })
})
