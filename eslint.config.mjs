import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The jsx-a11y plugin is registered by eslint-config-next; only raise its rules to "strict".
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      // Content-layer boundary: patterns are filled in T04.6 (see ARCHITECTURE §4).
      'no-restricted-imports': ['error', { patterns: [] }],
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          ignoreProps: true,
          allowedStrings: [
            '·',
            '•',
            '—',
            '–',
            '|',
            '/',
            '×',
            ':',
            ',',
            '.',
            '(',
            ')',
            '+',
            '*',
            '&nbsp;',
          ],
        },
      ],
    },
  },
  prettier,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    '.open-next/**',
    '.wrangler/**',
    'cloudflare-env.d.ts',
    'playwright-report/**',
    'test-results/**',
    '.screenshots/**',
    'sanity.types.ts',
  ]),
])

export default eslintConfig
