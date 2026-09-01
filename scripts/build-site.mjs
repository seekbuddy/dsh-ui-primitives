#!/usr/bin/env node
/**
 * Build the static GitHub Pages site for dsh-ui-kit.
 *
 * Outputs to ./site:
 *   index.html            landing page
 *   docs/index.html       documentation generated from README.md
 *   404.html              friendly not-found page
 *   assets/*              shared css/js
 */
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'site-src')
const outDir = path.join(root, 'site')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const readme = readFileSync(path.join(root, 'README.md'), 'utf8')
const NL = String.fromCharCode(10)

const repoUrl = (() => {
  const repo = pkg.repository
  const url = typeof repo === 'string' ? repo : (repo && repo.url) || ''
  return url.replace('git+', '').replace('.git', '')
})()
const npmUrl = 'https://www.npmjs.com/package/' + pkg.name
const version = pkg.version
const generatedAt = new Date().toISOString()

// ------------------------------------------------------------------ utils

function escapeHtml(text) {
  return String(text)
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&#39;')
}

function stripTags(html) {
  let out = ''
  let inside = false
  for (const ch of String(html)) {
    if (ch === '<') inside = true
    else if (ch === '>') inside = false
    else if (!inside) out += ch
  }
  return out
}

function slugify(text) {
  let out = ''
  let prevDash = false
  for (const ch of String(text).toLowerCase()) {
    const cp = ch.codePointAt(0)
    const keep = (cp >= 97 && cp <= 122) || (cp >= 48 && cp <= 57) || (cp >= 0x4e00 && cp <= 0x9fff)
    if (keep) {
      out += ch
      prevDash = false
    } else if (!prevDash && out.length > 0) {
      out += '-'
      prevDash = true
    }
  }
  while (out.startsWith('-')) out = out.slice(1)
  while (out.endsWith('-')) out = out.slice(0, -1)
  return out || 'section'
}

function copyDir(from, to) {
  mkdirSync(to, { recursive: true })
  for (const entry of readdirSync(from)) {
    const fromPath = path.join(from, entry)
    const toPath = path.join(to, entry)
    if (statSync(fromPath).isDirectory()) copyDir(fromPath, toPath)
    else copyFileSync(fromPath, toPath)
  }
}

function fillTemplate(file, vars) {
  let text = readFileSync(path.join(srcDir, file), 'utf8')
  for (const key of Object.keys(vars)) {
    text = text.split('{{' + key + '}}').join(String(vars[key]))
  }
  return text
}

// ------------------------------------------------------------ markdown

const tocItems = []
const headingCounters = new Map()
let headingIndex = 0

const renderer = new marked.Renderer()
renderer.heading = function (token) {
  const inline = this.parser.parseInline(token.tokens || [])
  const text = stripTags(inline)
  const base = slugify(text)
  headingIndex += 1
  const seen = headingCounters.get(base) || 0
  const id = seen > 0 ? base + '-' + seen : base
  headingCounters.set(base, seen + 1)
  if (token.depth === 2 || token.depth === 3) {
    tocItems.push({ level: token.depth, id: id, text: text })
  }
  return '<h' + token.depth + ' id="' + escapeHtml(id) + '">' + inline + '</h' + token.depth + '>' + NL
}

marked.use({ renderer: renderer })

// ---------------------------------------------------------------- build

const readmeHtml = marked.parse(readme)
const tocHtml = tocItems.length > 0
  ? '<div class="toc-title">本页目录</div>' +
    tocItems.map((item) => '<a class="toc-item toc-l' + item.level + '" href="#' + item.id + '">' + item.text + '</a>').join('')
  : ''

const common = {
  version: version,
  package: pkg.name,
  repoUrl: repoUrl,
  npmUrl: npmUrl,
  generatedAt: generatedAt,
}

mkdirSync(path.join(outDir, 'docs'), { recursive: true })
mkdirSync(path.join(outDir, 'assets'), { recursive: true })

copyDir(path.join(srcDir, 'assets'), path.join(outDir, 'assets'))

writeFileSync(path.join(outDir, 'index.html'), fillTemplate('index.html', common))
writeFileSync(
  path.join(outDir, 'docs', 'index.html'),
  fillTemplate('docs.html', Object.assign({}, common, { readmeHtml: readmeHtml, tocHtml: tocHtml })),
)
writeFileSync(path.join(outDir, '404.html'), fillTemplate('404.html', common))

console.log('[site] built ' + path.relative(root, outDir) + ' (v' + version + ')')
