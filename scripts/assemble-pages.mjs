import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const demoDir = path.join(root, 'demo', 'dist')
const siteDir = path.join(root, 'site')
const previewDir = path.join(siteDir, 'demo')

rmSync(previewDir, { recursive: true, force: true })
mkdirSync(previewDir, { recursive: true })
cpSync(demoDir, previewDir, { recursive: true })
writeFileSync(path.join(siteDir, '.nojekyll'), '')

console.log('[pages] assembled landing, docs, and demo preview')
