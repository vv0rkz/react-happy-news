import boundaries from 'eslint-plugin-boundaries'

const SHARED = ['shared_ui', 'shared_hooks', 'shared_lib', 'shared_config']
const SHARED_AND_CORE = ['core', ...SHARED]

const allowTypes = (types) => types.map((type) => ({ to: { type } }))

/** @type {import('eslint').Linter.Config[]} */
export const architectureConfig = [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/app/mocks/**', 'src/tests/**'],
    plugins: {
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/dependency-nodes': ['import'],
      'boundaries/elements': [
        { type: 'core', pattern: 'src/shared/api/**', mode: 'full' },
        { type: 'shared_config', pattern: 'src/shared/config/**', mode: 'full' },
        { type: 'shared_lib', pattern: 'src/shared/lib/**', mode: 'full' },
        { type: 'shared_hooks', pattern: 'src/shared/hooks/**', mode: 'full' },
        { type: 'shared_ui', pattern: 'src/shared/ui/**', mode: 'full' },
        { type: 'catalog_ui', pattern: 'src/entities/news/ui/**', mode: 'full' },
        { type: 'pages_auth', pattern: 'src/pages/Auth/**', mode: 'full' },
        { type: 'catalog_pages', pattern: 'src/pages/Main/**', mode: 'full' },
        { type: 'catalog_pages', pattern: 'src/pages/NewsDetail/**', mode: 'full' },
        { type: 'entities', pattern: 'src/entities/**', mode: 'full' },
        { type: 'features', pattern: 'src/features/**', mode: 'full' },
        { type: 'pages', pattern: 'src/pages/**', mode: 'full' },
        { type: 'app', pattern: 'src/app/**', mode: 'full' },
      ],
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'core' },
              allow: allowTypes(['core']),
            },
            {
              from: { type: SHARED },
              allow: allowTypes(SHARED_AND_CORE),
            },
            {
              from: { type: ['catalog_ui', 'entities'] },
              allow: allowTypes(['catalog_ui', 'entities', ...SHARED_AND_CORE]),
              disallow: allowTypes(['pages_auth', 'app', 'pages', 'catalog_pages', 'features']),
            },
            {
              from: { type: 'features' },
              allow: allowTypes(['features', 'entities', 'catalog_ui', ...SHARED_AND_CORE]),
              disallow: allowTypes(['app', 'pages', 'catalog_pages', 'pages_auth']),
            },
            {
              from: { type: 'catalog_pages' },
              allow: allowTypes(['catalog_pages', 'pages', 'features', 'entities', 'catalog_ui', ...SHARED_AND_CORE]),
              disallow: allowTypes(['pages_auth']),
            },
            {
              from: { type: 'pages' },
              allow: allowTypes(['pages', 'catalog_pages', 'features', 'entities', 'catalog_ui', ...SHARED_AND_CORE]),
              disallow: allowTypes(['pages_auth']),
            },
            {
              from: { type: 'pages_auth' },
              allow: allowTypes(['pages_auth', 'pages', ...SHARED_AND_CORE, 'entities', 'catalog_ui']),
              disallow: allowTypes(['catalog_pages']),
            },
            {
              from: { type: 'app' },
              allow: allowTypes([
                'app',
                'pages',
                'catalog_pages',
                'features',
                'entities',
                'catalog_ui',
                ...SHARED_AND_CORE,
              ]),
            },
          ],
        },
      ],
      'boundaries/no-unknown': 'off',
      'boundaries/no-unknown-files': 'off',
    },
  },
]
