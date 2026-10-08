/** Chunks que solo llevan metadatos; ninguno debe llegar al repo. */
export const WEBP_METADATA_CHUNKS = ['EXIF', 'XMP ', 'ICCP']

/** Chunks que llevan la imagen: sin pérdida, con pérdida, alfa y cabecera extendida. */
export const WEBP_IMAGE_CHUNKS = ['VP8L', 'VP8 ', 'ALPH', 'VP8X']

/** Bits de la cabecera extendida (VP8X) que anuncian metadatos. */
const VP8X_METADATA_FLAGS = 0x20 | 0x08 | 0x04
const VP8X_ALPHA_FLAG = 0x10

export interface WebpInfo {
  /** Nombres de los chunks, en el orden del archivo. */
  chunks: string[]
  width: number
  height: number
  hasAlpha: boolean
  /** La cabecera extendida anuncia perfil de color, EXIF o XMP. */
  announcesMetadata: boolean
  /** Bytes del archivo que quedan fuera de lo que declara la cabecera RIFF. */
  trailingBytes: number
}

/**
 * Lee la estructura de un WebP a partir de sus bytes: los chunks, el tamaño y
 * si lleva transparencia. No decodifica los píxeles.
 */
export function readWebp(bytes: Uint8Array): WebpInfo {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const tag = (offset: number) =>
    String.fromCharCode(...bytes.subarray(offset, offset + 4))

  if (bytes.byteLength < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WEBP') {
    throw new Error('El archivo no es un WebP')
  }

  const end = Math.min(8 + view.getUint32(4, true), bytes.byteLength)
  const info: WebpInfo = {
    chunks: [],
    width: 0,
    height: 0,
    hasAlpha: false,
    announcesMetadata: false,
    trailingBytes: bytes.byteLength - (8 + view.getUint32(4, true)),
  }

  let offset = 12
  while (offset + 8 <= end) {
    const name = tag(offset)
    const size = view.getUint32(offset + 4, true)
    const data = offset + 8
    info.chunks.push(name)

    if (name === 'VP8X') {
      const flags = view.getUint8(data)
      info.announcesMetadata = (flags & VP8X_METADATA_FLAGS) !== 0
      info.hasAlpha = (flags & VP8X_ALPHA_FLAG) !== 0
      info.width = 1 + (view.getUint32(data + 4, true) & 0xffffff)
      info.height = 1 + (view.getUint32(data + 7, true) & 0xffffff)
    } else if (name === 'VP8L' && info.width === 0) {
      const bits = view.getUint32(data + 1, true)
      info.width = 1 + (bits & 0x3fff)
      info.height = 1 + ((bits >>> 14) & 0x3fff)
      info.hasAlpha = ((bits >>> 28) & 1) === 1
    } else if (name === 'VP8 ' && info.width === 0) {
      info.width = view.getUint16(data + 6, true) & 0x3fff
      info.height = view.getUint16(data + 8, true) & 0x3fff
    } else if (name === 'ALPH') {
      info.hasAlpha = true
    }

    // Los chunks se alinean a un número par de bytes.
    offset = data + size + (size % 2)
  }

  return info
}
