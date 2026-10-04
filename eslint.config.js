import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Capas, de la más baja a la más alta. Un módulo solo puede importar de su
// propia capa o de las que están por debajo:
//   config · data · i18n · lib  <-  hooks  <-  components/ui
//     <-  components/layout · components/sections  <-  pages  <-  App
const noParentImports = {
  group: ['../*'],
  message: 'Usa el alias @/ para importar fuera de la carpeta actual.',
}

const layer = (files, forbidden) => ({
  files,
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          noParentImports,
          {
            group: forbidden,
            message: 'Import prohibido: esta capa no puede depender de una capa superior.',
          },
        ],
      },
    ],
  },
})

const APP = ['@/App', '@/main']
const PAGES = ['@/pages', '@/pages/*']
const FEATURES = ['@/components/layout/*', '@/components/sections/*']
const UI = ['@/components/ui/*']
const HOOKS = ['@/hooks', '@/hooks/*']

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strict,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: [noParentImports] }],
    },
  },
  layer(
    ['src/config/**', 'src/data/**', 'src/i18n/**', 'src/lib/**'],
    [...HOOKS, ...UI, ...FEATURES, ...PAGES, ...APP],
  ),
  layer(['src/hooks/**'], [...UI, ...FEATURES, ...PAGES, ...APP]),
  layer(['src/components/ui/**'], [...FEATURES, ...PAGES, ...APP]),
  layer(['src/components/layout/**', 'src/components/sections/**'], [...PAGES, ...APP]),
  layer(['src/pages/**'], APP),
  {
    files: ['vite.config.ts', 'playwright.config.ts', 'e2e/**'],
    languageOptions: { globals: globals.node },
  },
)
