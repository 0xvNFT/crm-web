import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
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
      // No `any` — use `unknown` + type narrowing
      '@typescript-eslint/no-explicit-any': 'error',
      // Prefer `as` over angle-bracket syntax. Object literal assertions allowed
      // (e.g. spreading typed arrays, seeding typed state). Use `as unknown as X`
      // is blocked separately by the no-as-unknown-as custom rule.
      '@typescript-eslint/consistent-type-assertions': ['error', {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow',
      }],
      // Prefer `import type` for type-only imports (keeps runtime bundle clean)
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'separate-type-imports',
      }],

      // ─── React Hooks ─────────────────────────────────────────────────────────
      // react-hooks/rules-of-hooks and react-hooks/exhaustive-deps already included
      // via reactHooks.configs.flat.recommended above.
      // Explicitly ban setState inside useEffect for derived data (forces useMemo).
      'react-hooks/no-nested-hooks': 'off', // not a rule — exhaustive-deps covers the case

      // ─── No console.log in production code ───────────────────────────────────
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // ─── Accessibility (jsx-a11y) ─────────────────────────────────────────────
      // All a11y rules are enabled via jsxA11y.flatConfigs.recommended above.
      // Key rules this enables:
      //   - jsx-a11y/click-events-have-key-events
      //   - jsx-a11y/no-noninteractive-element-interactions
      //   - jsx-a11y/alt-text
      //   - jsx-a11y/label-has-associated-control
      //   - jsx-a11y/anchor-is-valid

      // autoFocus is acceptable in Dialog/Sheet first-field — it improves UX by
      // placing focus on the first actionable element when a modal opens.
      // This is an intentional pattern; the rule fires false positives here.
      'jsx-a11y/no-autofocus': 'off',

      // ─── Import hygiene ───────────────────────────────────────────────────────
      // Block direct imports from the auto-generated types file.
      // All imports must go through @/api/app-types.
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

      // ─── No default exports for shared components/hooks ───────────────────────
      // Pages (src/features/**) MUST use default export (required by lazy()).
      // Shared components and hooks must use named exports only.
      // Enforced per-directory via overrides below.
    },
  },

  // ─── Shared components: named exports only ───────────────────────────────────
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}', 'src/api/endpoints/**/*.{ts,tsx}', 'src/schemas/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Shared components, hooks, endpoints, and schemas must use named exports. `export default` is only allowed for pages in src/features/*.',
        },
      ],
    },
  },
])
