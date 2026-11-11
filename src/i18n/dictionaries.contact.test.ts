import { describe, expect, it } from 'vitest'
import { dictionaries } from '@/i18n/index'
import { LANGS } from '@/i18n/types'

// Textos de Contacto de la spec v2.1 (§3.5), que fija también el inglés; el
// autor aprobó el 2026-11-11 «Or pick the channel you prefer» y el
// apóstrofo tipográfico (’) del inglés. Cambiarlos exige su visto bueno y
// actualizar también estas constantes.
const TITLE = {
  es: 'Las buenas ideas merecen construirse bien.',
  en: 'Good ideas deserve to be built well.',
} as const

const PITCH = {
  es: {
    lead: '¿Tienes un proyecto, un problema por resolver o buscas a alguien que aporte a tu equipo?',
    body: 'Hablemos de tus objetivos, lo que necesitas y cómo puedo aportar desde el desarrollo de software.',
  },
  en: {
    lead: 'Do you have a project, a problem to solve, or are you looking for someone to strengthen your team?',
    body: 'Let’s talk about your goals, what you need and how I can contribute through software development.',
  },
} as const

const CHANNELS = { es: 'O por el canal que prefieras', en: 'Or pick the channel you prefer' } as const

const FORM_TITLE = { es: 'Cuéntame tu idea', en: 'Tell me your idea' } as const

// Placeholders con ejemplo y «…» (auditoría de Vercel), aprobados por el
// autor el 2026-11-11. Los nombres y el dominio son de ejemplo.
const PLACEHOLDERS = {
  es: {
    name: 'Ana Pérez…',
    email: 'ana@empresa.com…',
    company: 'Dónde trabajas…',
    message: 'Qué quieres construir y para cuándo…',
  },
  en: {
    name: 'Jane Doe…',
    email: 'jane@company.com…',
    company: 'Where you work…',
    message: 'What you want to build and by when…',
  },
} as const

describe('textos de Contacto', () => {
  it.each(LANGS)('en %s, el título es el de la spec v2.1', (lang) => {
    expect(dictionaries[lang].contact.title).toBe(TITLE[lang])
  })

  it.each(LANGS)('en %s, los dos textos bajo el título son los de la spec v2.1', (lang) => {
    expect(dictionaries[lang].contact.pitch).toEqual(PITCH[lang])
  })

  it.each(LANGS)('en %s, el rótulo de los canales es el aprobado', (lang) => {
    expect(dictionaries[lang].contact.channelsLabel).toBe(CHANNELS[lang])
  })

  it.each(LANGS)('en %s, el título del formulario es el de la spec v2.1', (lang) => {
    expect(dictionaries[lang].contact.form.title).toBe(FORM_TITLE[lang])
  })

  it.each(LANGS)('en %s, los placeholders son los aprobados', (lang) => {
    const { form } = dictionaries[lang].contact

    expect({
      name: form.name.placeholder,
      email: form.email.placeholder,
      company: form.company.placeholder,
      message: form.message.placeholder,
    }).toEqual(PLACEHOLDERS[lang])
  })

  it('en inglés, sin apóstrofos rectos', () => {
    const { pitch } = dictionaries.en.contact
    expect(`${pitch.lead} ${pitch.body}`).not.toContain("'")
  })

  // Las mayúsculas sostenidas del título las pone el CSS.
  it.each(LANGS)('en %s, el título no se guarda en mayúsculas sostenidas', (lang) => {
    const { title } = dictionaries[lang].contact

    expect(title).not.toBe(title.toUpperCase())
  })
})
