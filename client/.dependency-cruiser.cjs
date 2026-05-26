/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-core-to-upper',
      comment: 'Module Map: shared/api (core) must not depend on product layers',
      severity: 'error',
      from: { path: '^src/shared/api/' },
      to: {
        path: '^src/(app|pages|features|model)/',
      },
    },
    {
      name: 'no-model-to-pages',
      comment: 'FSD: model/catalog must not import pages',
      severity: 'error',
      from: { path: '^src/model/' },
      to: { path: '^src/pages/' },
    },
    {
      name: 'no-model-to-features',
      severity: 'error',
      from: { path: '^src/model/' },
      to: { path: '^src/features/' },
    },
    {
      name: 'no-model-to-app',
      severity: 'error',
      from: { path: '^src/model/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'no-shared-components-to-model',
      comment: 'shared/components is domain-agnostic',
      severity: 'error',
      from: { path: '^src/shared/components/' },
      to: { path: '^src/model/' },
    },
    {
      name: 'no-circular',
      comment: 'No circular dependencies under src/',
      severity: 'error',
      from: { path: '^src/' },
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules|dist|\\.test\\.(ts|tsx)$',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['types', 'main', 'module'],
    },
  },
}
