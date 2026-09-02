import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const temporary = mkdtempSync(path.join(tmpdir(), 'dsh-ui-primitives-pack-'))

function exportedPaths(value) {
  if (typeof value === 'string') return value.startsWith('./') ? [value.slice(2)] : []
  if (value === null || typeof value !== 'object') return []
  return Object.values(value).flatMap(exportedPaths)
}

try {
  const packed = JSON.parse(execFileSync('npm', [
    'pack', '--json', '--ignore-scripts', '--pack-destination', temporary,
  ], { cwd: root, encoding: 'utf8' }))
  assert.equal(packed.length, 1)
  const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
  const files = new Set(packed[0].files.map(file => file.path))
  for (const exported of exportedPaths(manifest.exports)) {
    assert.ok(files.has(exported), `package export is missing: ${exported}`)
  }
  for (const required of [
    'dist/index.js', 'dist/blocks.js', 'dist/markdown.js', 'dist/icons.js',
    'dist/theme.js', 'dist/theme-bootstrap.js', 'dist/types/index.d.ts',
    'dist/types/blocks.d.ts', 'dist/types/markdown.d.ts', 'dist/types/icons.d.ts',
    'dist/types/theme.d.ts', 'dist/tokens.css', 'dist/katex.css',
  ]) assert.ok(files.has(required), `package content is missing: ${required}`)
  assert.equal([...files].some(file => file.startsWith('demo/dist/') || file.startsWith('site/')), false)

  const archive = path.join(temporary, packed[0].filename)
  execFileSync('tar', ['-xzf', archive, '-C', temporary])

  const tokensCss = readFileSync(path.join(temporary, 'package', 'dist', 'tokens.css'), 'utf8')
  for (const token of [
    '--dsw-corner-shape',
    '--dsw-elevation-stroke',
    '--dsw-elevation-panel',
    '--dsw-elevation-prominent',
    '--dsw-elevation-soft',
  ]) assert.ok(tokensCss.includes(token), `tokens CSS is missing alpha.4 token: ${token}`)
  assert.ok(
    tokensCss.indexOf('--dsw-corner-shape') < tokensCss.indexOf('--dsw-static-amber-100'),
    'corner-shape.css must precede design-platform.css',
  )
  assert.ok(
    tokensCss.indexOf('--dsh-scrollbar-width') < tokensCss.indexOf('--dsw-elevation-stroke-color'),
    'scrollbar.css must precede gradient-shadow-text.css',
  )

  const css = readFileSync(path.join(temporary, 'package', 'dist', 'katex.css'), 'utf8')
  const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(match => match[1])
  assert.ok(urls.length > 0, 'KaTeX CSS has no font URLs')
  for (const url of urls) {
    assert.equal(url.startsWith('data:'), false, `KaTeX font must not be a data URI: ${url}`)
    const target = path.resolve(path.join(temporary, 'package', 'dist'), url)
    assert.ok(target.startsWith(path.join(temporary, 'package', 'dist')), `unsafe KaTeX URL: ${url}`)
    assert.ok(files.has(path.relative(path.join(temporary, 'package'), target)), `missing KaTeX font: ${url}`)
  }
  console.log(`[package] verified ${files.size} files, ${urls.length} KaTeX font URLs`)
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
