#!/usr/bin/env node
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'site')
const port = Number(process.env.PORT || 4173)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

function resolvePath(urlPath) {
  let pathname = decodeURIComponent(urlPath.split('?')[0])
  if (pathname.endsWith('/')) pathname += 'index.html'
  const file = path.normalize(path.join(root, pathname))
  if (file !== root && !file.startsWith(root + path.sep)) return null
  return file
}

const httpServer = createServer((req, res) => {
  let file = resolvePath(req.url || '/')
  if (!file || !existsSync(file) || !statSync(file).isFile()) {
    file = path.join(root, '404.html')
  }

  res.writeHead(200, {
    'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'cache-control': 'no-cache',
  })
  createReadStream(file).pipe(res)
})

httpServer.listen(port, () => {
  console.log('[site] preview http://localhost:' + port)
})
