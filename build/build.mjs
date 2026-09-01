import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { transform } from 'lightningcss'

const require = createRequire(import.meta.url)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const distDir = path.join(root, 'dist')
const generatedDir = path.join(root, '.build')
const cssModuleDir = path.join(generatedDir, 'css')
const typesOutDir = path.join(distDir, 'types')

function walk(dir, base = dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const absolute = path.join(dir, entry)
    if (statSync(absolute).isDirectory()) out.push(...walk(absolute, base))
    else out.push(path.relative(base, absolute))
  }
  return out
}

function emitCssModule(relativePath) {
  const absolute = path.join(srcDir, relativePath)
  const { code, exports: cssExports } = transform({
    filename: absolute,
    code: readFileSync(absolute),
    cssModules: { pattern: '[hash]_[local]' },
    minify: true,
  })
  const classMap = {}
  for (const [local, value] of Object.entries(cssExports ?? {})) classMap[local] = value.name
  const id = `dsh-ui-kit/${relativePath}`
  const moduleText = [
    `const id=${JSON.stringify(id)};`,
    `if(typeof document!=="undefined"&&!document.querySelector('style[data-dsh-ui-kit="'+id+'"]')){`,
    'const element=document.createElement("style");',
    'element.setAttribute("data-dsh-ui-kit",id);',
    `element.textContent=${JSON.stringify(code.toString())};`,
    'document.head.appendChild(element);',
    '}',
    `export default ${JSON.stringify(classMap)};`,
  ].join('\n')
  const output = path.join(cssModuleDir, relativePath.replace(/\.css$/, '.mjs'))
  mkdirSync(path.dirname(output), { recursive: true })
  writeFileSync(output, moduleText)
}

function emitTokens() {
  const order = ['base.css', 'design-platform.css', 'gradient-shadow-text.css', 'scrollbar.css', 'shiki.css']
  const css = order.map((file) => readFileSync(path.join(srcDir, 'styles', file), 'utf8')).join('\n')
  writeFileSync(path.join(distDir, 'tokens.css'), css)
  writeFileSync(path.join(distDir, 'tokens.css.d.ts'), 'declare const css: string\nexport default css\n')
}

function emitKatex() {
  const source = require.resolve('katex/dist/katex.min.css')
  const sourceFonts = path.join(path.dirname(source), 'fonts')
  let css = readFileSync(source, 'utf8')
  css = css
    .replace(/,url\(fonts\/[^)]+\.(?:woff|ttf)\) format\("(?:woff|truetype)"\)/g, '')
    .replace(/url\(fonts\/([^)]+\.woff2)\)/g, 'url("./katex/fonts/$1")')
  const fonts = [...css.matchAll(/url\("\.\/katex\/fonts\/([^"/]+\.woff2)"\)/g)].map(match => match[1])
  if (fonts.length === 0 || /\.(?:woff|ttf)\)/.test(css)) throw new Error('KaTeX CSS was not reduced to woff2')
  const outputFonts = path.join(distDir, 'katex', 'fonts')
  mkdirSync(outputFonts, { recursive: true })
  for (const font of new Set(fonts)) copyFileSync(path.join(sourceFonts, font), path.join(outputFonts, font))
  writeFileSync(path.join(distDir, 'katex.css'), css)
  writeFileSync(path.join(distDir, 'katex.css.d.ts'), 'declare const css: string\nexport default css\n')
}

function assertLightweightRoot(metafile) {
  const rootOutput = 'dist/index.js'
  const visited = new Set()
  const inputs = new Set()
  const visit = (output) => {
    if (visited.has(output)) return
    visited.add(output)
    const details = metafile.outputs[output]
    if (details === undefined) throw new Error(`Missing metafile output: ${output}`)
    for (const input of Object.keys(details.inputs)) inputs.add(input)
    for (const dependency of details.imports) {
      if (dependency.external) continue
      const direct = path.posix.normalize(dependency.path)
      const relative = path.posix.normalize(path.posix.join(path.posix.dirname(output), dependency.path))
      visit(metafile.outputs[direct] === undefined ? relative : direct)
    }
  }
  visit(rootOutput)
  const forbidden = [
    /(^|\/)src\/markdown\//,
    /(^|\/)node_modules\/(?:katex|shiki|@shikijs|mdast-util-|micromark)/,
  ]
  const violations = [...inputs].filter(input => forbidden.some(pattern => pattern.test(input)))
  if (violations.length > 0) throw new Error(`Root entry reaches heavy Markdown inputs:\n${violations.join('\n')}`)
  writeFileSync(path.join(distDir, 'root-inputs.json'), `${JSON.stringify([...inputs].sort(), null, 2)}\n`)
}

rmSync(distDir, { recursive: true, force: true })
rmSync(generatedDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })
mkdirSync(cssModuleDir, { recursive: true })

try {
  for (const file of walk(srcDir).filter(file => file.endsWith('.module.css'))) emitCssModule(file)
  emitTokens()
  emitKatex()

  const result = await build({
    absWorkingDir: root,
    entryPoints: {
      index: 'src/index.ts',
      blocks: 'src/blocks.ts',
      markdown: 'src/markdown.ts',
      icons: 'src/icons.ts',
      theme: 'src/theme.ts',
      'theme-bootstrap': 'src/theme-bootstrap.ts',
    },
    bundle: true,
    splitting: true,
    format: 'esm',
    target: 'es2020',
    platform: 'browser',
    outdir: 'dist',
    entryNames: '[name]',
    chunkNames: 'chunks/[name]-[hash]',
    jsx: 'automatic',
    metafile: true,
    external: [
      'react', 'react/*', 'react-dom', 'react-dom/*', 'clsx', 'anser', 'katex',
      'shiki', 'shiki/*', '@shikijs/*', '@types/mdast', 'mdast-util-*',
      'micromark', 'micromark-*',
    ],
    plugins: [{
      name: 'dsh-ui-kit-css-modules',
      setup(esbuild) {
        esbuild.onResolve({ filter: /\.module\.css$/ }, (args) => {
          const absolute = path.resolve(args.resolveDir, args.path)
          const relative = path.relative(srcDir, absolute)
          return { path: path.join(cssModuleDir, relative.replace(/\.css$/, '.mjs')) }
        })
      },
    }],
  })
  assertLightweightRoot(result.metafile)
  writeFileSync(path.join(distDir, 'meta.json'), `${JSON.stringify(result.metafile, null, 2)}\n`)

  execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.build.json'], {
    cwd: root,
    stdio: 'inherit',
  })
  for (const relative of walk(typesOutDir).filter(file => file.endsWith('.d.ts'))) {
    const absolute = path.join(typesOutDir, relative)
    const source = readFileSync(absolute, 'utf8')
    const rewritten = source.replace(/(from ['"])([^'"]+)\.tsx?(['"])/g, '$1$2.js$3')
    if (rewritten !== source) writeFileSync(absolute, rewritten)
  }
  copyFileSync(path.join(srcDir, 'css-modules.d.ts'), path.join(typesOutDir, 'css-modules.d.ts'))
} finally {
  rmSync(generatedDir, { recursive: true, force: true })
}

console.log('[build] emitted multi-entry ESM, declarations, tokens, and KaTeX woff2 assets')
