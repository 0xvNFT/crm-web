import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'docs/**']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // ─── TypeScript ───────────────────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['error', {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],

      // ─── React Hooks ─────────────────────────────────────────────────────────
      'react-hooks/no-nested-hooks': 'off',

      // ─── No console.log in production code ───────────────────────────────────
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // ─── Accessibility (jsx-a11y) ─────────────────────────────────────────────
      'jsx-a11y/no-autofocus': 'off',

      // ─── Import hygiene ───────────────────────────────────────────────────────
      'no-restricted-imports': ['error', {
        paths: [
          {
            name: '@/api/types',
            message: 'Import from @/api/app-types instead. src/api/types.ts is auto-generated and unstable.',
          },
        ],
        patterns: [
          {
            regex: '^\\.\\./.*api/types$',
            message: 'Import from @/api/app-types instead. src/api/types.ts is auto-generated and unstable.',
          },
        ],
      }],

      // ─── Anti-pattern guards ─────────────────────────────────────────────────
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='history'][callee.property.name='back']",
          message: "Use navigate(-1) from React Router instead of history.back().",
        },
        {
          selector: "AssignmentExpression[left.object.object.name='window'][left.object.property.name='location'][left.property.name='href']",
          message: "Use navigate() from React Router instead of window.location.href.",
        },
        {
          selector: "TSAsExpression > TSAsExpression[typeAnnotation.typeName.name='unknown']",
          message: "Do not use 'as unknown as T' — fix the root type in app-types.ts instead.",
        },
        {
          selector: "CallExpression[callee.property.name='includes'][callee.object.property.name='roles']",
          message: "Use useRole() hook instead of user?.roles.includes().",
        },
      ],
    },
  },

  // ─── Shared components: named exports only ───────────────────────────────────
  // IMPORTANT: This OVERRIDES the global no-restricted-syntax, so we MUST include ALL rules
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/hooks/**/*.{ts,tsx}',
      'src/api/endpoints/**/*.{ts,tsx}',
      'src/schemas/**/*.{ts,tsx}'
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.object.name='history'][callee.property.name='back']",
          message: "Use navigate(-1) from React Router instead of history.back().",
        },
        {
          selector: "AssignmentExpression[left.object.object.name='window'][left.object.property.name='location'][left.property.name='href']",
          message: "Use navigate() from React Router instead of window.location.href.",
        },
        {
          selector: "TSAsExpression > TSAsExpression[typeAnnotation.typeName.name='unknown']",
          message: "Do not use 'as unknown as T' — fix the root type in app-types.ts instead.",
        },
        {
          selector: "CallExpression[callee.property.name='includes'][callee.object.property.name='roles']",
          message: "Use useRole() hook instead of user?.roles.includes().",
        },
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Shared components, hooks, endpoints, and schemas must use named exports. `export default` is only allowed for pages in src/features/*.',
        },
      ],
    },
  },
])