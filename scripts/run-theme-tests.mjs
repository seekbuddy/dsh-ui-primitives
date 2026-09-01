import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = path.resolve(import.meta.dirname, '..')
const outputDir = path.join(root, '.test-dist')
const outputFile = path.join(outputDir, 'theme-core.mjs')

rmSync(outputDir, { recursive: true, force: true })
try {
  await build({
    entryPoints: [path.join(root, 'src/theme-core.ts')],
    outfile: outputFile,
    bundle: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2020',
  })
  execFileSync(process.execPath, ['--test', 'tests/theme.test.mjs'], {
    cwd: root,
    env: { ...process.env, THEME_CORE_URL: pathToFileURL(outputFile).href },
    stdio: 'inherit',
  })
} finally {
  rmSync(outputDir, { recursive: true, force: true })
}
