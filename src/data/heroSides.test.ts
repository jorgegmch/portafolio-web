import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { heroCodeWindow, heroStack } from '@/data/heroSides'
import { technologies } from '@/data/technologies'

// Paneles laterales del Hero (spec v2.1 §3.1): la ventana de código muestra
// un archivo real de logitrack-api, copiado sin retocar (regla de contenido
// veraz), y las fichas son seis tecnologías del catálogo.
const text = (line: (typeof heroCodeWindow.lines)[number]) =>
  line.map((segment) => segment.text).join('')

describe('ventana de código del Hero', () => {
  it('nombra el archivo real del controlador', () => {
    expect(heroCodeWindow.file).toBe('AuthController.java')
  })

  // Líneas 25, 26, 28 y 44 del archivo en jorgegmch/logitrack-api@d34a5ae;
  // «// …» marca las que se saltan, como en el Traductor.
  it('son las líneas del archivo, en su orden y con su sangría', () => {
    expect(heroCodeWindow.lines.map(text)).toEqual([
      '@RestController',
      '@RequestMapping("/auth")',
      'public class AuthController {',
      '    // …',
      '    @PostMapping("/login")',
    ])
  })

  it('cita junto a los datos el repo, el commit, la ruta y las líneas', () => {
    const source = readFileSync('src/data/heroSides.ts', 'utf8')

    expect(source).toContain('jorgegmch/logitrack-api@d34a5ae')
    expect(source).toContain('src/main/java/com/jorgegmch/logitrack/controller/AuthController.java')
    expect(source).toContain('25, 26, 28 y 44')
  })

  it('resalta con la voz de código: anotaciones y palabras clave, cadenas y comentarios', () => {
    const kinds = (index: number) =>
      (heroCodeWindow.lines[index] ?? []).map((segment) => [
        segment.text,
        'kind' in segment ? segment.kind : 'text',
      ])

    expect(kinds(0)).toEqual([['@RestController', 'keyword']])
    expect(kinds(1)).toEqual([
      ['@RequestMapping', 'keyword'],
      ['(', 'text'],
      ['"/auth"', 'string'],
      [')', 'text'],
    ])
    expect(kinds(2)).toEqual([
      ['public class', 'keyword'],
      [' AuthController {', 'text'],
    ])
    expect(kinds(3)).toEqual([['    // …', 'comment']])
  })
})

describe('fichas «// stack principal» del Hero', () => {
  it('son Java, Spring Boot, PostgreSQL, Docker, n8n y Python, en ese orden', () => {
    expect(heroStack).toEqual(['java', 'spring-boot', 'postgresql', 'docker', 'n8n', 'python'])
  })

  it('cada una es una tecnología del catálogo, con su logo', () => {
    const ids = technologies.map(({ id }) => id)

    heroStack.forEach((id) => expect(ids).toContain(id))
  })
})
