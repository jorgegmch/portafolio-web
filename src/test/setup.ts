import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// jsdom no implementa window.scrollTo y avisa por consola cada vez que se
// llama. Los tests que necesitan observarlo lo sustituyen por un espía.
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})
