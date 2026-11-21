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
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          labelComponents: ['Label'],
          controlComponents: ['Input', 'Textarea', 'Checkbox'],
          assert: 'either',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Content-layer boundary: patterns are filled in T04.6 (see ARCHITECTURE §4).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@sanity/icons',
              message:
                "Import each icon from its subpath (`import { CaseIcon } from '@sanity/icons/Case'`). The v5 root entry types icons as `never`, so the root import typechecks but is undefined at runtime.",
            },
          ],
          patterns: [],
        },
      ],
    },
  },
  {
    files: ['src/components/**/*.tsx'],
    // Styleguide: internal, env-gated, noindex demo page with sample copy, not user-facing UI.
    ignores: ['**/*.test.tsx', 'src/components/styleguide/**'],
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
    'sanity.types.ts',
  ]),
])

export default eslintConfig
