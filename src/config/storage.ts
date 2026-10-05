/** Claves de Web Storage. localStorage persiste; sessionStorage dura la sesión. */
export const storageKeys = {
  local: {
    lang: 'portafolio:lang',
  },
  session: {
    introSeen: 'portafolio:intro-seen',
  },
} as const
