/** Elementos que cargan o ejecutan algo, o que convierten un icono en otra cosa. */
const FORBIDDEN_ELEMENTS = ['script', 'image', 'foreignObject', 'iframe', 'a', 'style']

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

/** Lee un SVG como documento XML. */
export const parseSvg = (text: string) => new DOMParser().parseFromString(text, 'image/svg+xml')

/**
 * Motivos por los que un SVG no es seguro como icono estático; vacío si lo es.
 * Las URL de espacios de nombres (xmlns) no cuentan: son identificadores y el
 * navegador no las descarga. Lo que se vigila es lo que sí cargaría o ejecutaría.
 */
export function svgIssues(text: string): string[] {
  const issues: string[] = []
  const document = parseSvg(text)

  if (document.querySelector('parsererror')) return ['no es XML bien formado']

  const root = document.documentElement
  if (root.localName !== 'svg' || root.namespaceURI !== SVG_NAMESPACE) {
    issues.push('la raíz no es un svg')
  }
  if (!root.hasAttribute('viewBox') && !root.hasAttribute('width')) {
    issues.push('la raíz no declara tamaño')
  }
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) issues.push('declara DOCTYPE o entidades')
  if (text.includes('\r')) issues.push('tiene finales de línea CR')

  for (const element of [root, ...root.querySelectorAll('*')]) {
    if (FORBIDDEN_ELEMENTS.includes(element.localName)) {
      issues.push(`lleva un elemento ${element.localName}`)
    }
    for (const { name, value } of element.attributes) {
      if (/^on/i.test(name)) issues.push(`lleva el manejador ${name}`)
      if (/(^|:)(href|src)$/.test(name) && !value.startsWith('#')) {
        issues.push(`referencia fuera del archivo en ${name}`)
      }
      for (const [, target = ''] of value.matchAll(/url\(([^)]*)\)/g)) {
        if (!/^['"]?#/.test(target)) issues.push(`url() fuera del archivo en ${name}`)
      }
    }
  }

  return issues
}
