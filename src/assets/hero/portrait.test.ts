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
const [small, phone, medium, large] = portrait.sources

describe('retrato del Hero', () => {
  describe('declaración', () => {
    it('hay cuatro tamaños, de menor a mayor', () => {
      const widths = portrait.sources.map((source) => source.width)

      expect(widths).toHaveLength(4)
      expect(widths).toEqual([...widths].sort((a, b) => a - b))
      expect(new Set(widths).size).toBe(widths.length)
    })

    it('miden 576 x 720, 800 x 1000, 1152 x 1440 y 1472 x 1840', () => {
      expect(small).toMatchObject({ width: 576, height: 720 })
      expect(phone).toMatchObject({ width: 800, height: 1000 })
      expect(medium).toMatchObject({ width: 1152, height: 1440 })
      expect(large).toMatchObject({ width: 1472, height: 1840 })
    })

    // El retrato se muestra hasta a 46rem (736 px): el mayor lo cubre al doble
    // de densidad sin ampliarse.
    it('el mayor dobla el ancho máximo al que se muestra el retrato', () => {
      const MAX_DISPLAY_WIDTH = 736

      expect(large.width).toBe(MAX_DISPLAY_WIDTH * 2)
    })

    // Apilado en un teléfono, el retrato mide hasta 400 px: a densidad 2 lo
    // cubre el de 800 sin bajar el de 1152.
    it('el de 800 dobla el ancho del retrato en un teléfono', () => {
      const PHONE_DISPLAY_WIDTH = 400

      expect(phone.width).toBe(PHONE_DISPLAY_WIDTH * 2)
    })

    it('la proporción reservada es 4:5', () => {
      expect(portrait.aspectRatio).toEqual({ width: 4, height: 5 })
    })

    it.each(sources)('$file se importa desde su archivo', ({ src, file }) => {
      expect(src).toContain(file.replace('.webp', ''))
      expect(src).toMatch(/\.webp$/)
    })
  })

  // Ni la ilustración que hubo antes de la foto ni los tamaños anteriores se publican.
  it.each([420, 840, 520, 1040])('no queda el archivo anterior de %i px', (width) => {
    expect(existsSync(path(width))).toBe(false)
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

    // Una foto sin pérdida pesa varias veces más sin que se note la diferencia.
    it('va comprimido con pérdida', () => {
      const { chunks } = read(width)

      expect(chunks).toContain('VP8 ')
      expect(chunks).not.toContain('VP8L')
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
