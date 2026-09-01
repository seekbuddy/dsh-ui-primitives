import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// The demo consumes the BUILT artifact through the published subpaths, exactly
// like a third-party consumer would (aliases stand in for the npm package).
export default defineConfig({
  root: path.resolve(__dirname, '..', 'demo'),
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^dsh-ui-primitives\/tokens\.css$/, replacement: path.resolve(__dirname, '..', 'dist/tokens.css') },
      { find: /^dsh-ui-primitives\/katex\.css$/, replacement: path.resolve(__dirname, '..', 'dist/katex.css') },
      { find: /^dsh-ui-primitives\/blocks$/, replacement: path.resolve(__dirname, '..', 'dist/blocks.js') },
      { find: /^dsh-ui-primitives\/markdown$/, replacement: path.resolve(__dirname, '..', 'dist/markdown.js') },
      { find: /^dsh-ui-primitives\/icons$/, replacement: path.resolve(__dirname, '..', 'dist/icons.js') },
      { find: /^dsh-ui-primitives\/theme$/, replacement: path.resolve(__dirname, '..', 'dist/theme.js') },
      { find: /^dsh-ui-primitives$/, replacement: path.resolve(__dirname, '..', 'dist/index.js') },
    ],
  },
  build: {
    outDir: 'dist',
  },
})
