import { defineConfig, globalIgnores } from 'eslint/config'
import neostandard from 'neostandard'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...neostandard({ ts: true }),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // next/font/google exports use underscores (e.g. Geist_Mono)
      camelcase: ['error', { allow: ['^Geist_'] }],
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
