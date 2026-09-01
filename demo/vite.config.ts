import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// The demo consumes the BUILT artifact through the published subpaths, exactly
// like a third-party consumer would (aliases stand in for the npm package).
export default defineConfig({
  root: path.resolve(__dirname, '..', 'demo'),
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^dsh-ui-kit\/tokens\.css$/, replacement: path.resolve(__dirname, '..', 'dist/tokens.css') },
      { find: /^dsh-ui-kit\/katex\.css$/, replacement: path.resolve(__dirname, '..', 'dist/katex.css') },
      { find: /^dsh-ui-kit\/blocks$/, replacement: path.resolve(__dirname, '..', 'dist/blocks.js') },
      { find: /^dsh-ui-kit\/markdown$/, replacement: path.resolve(__dirname, '..', 'dist/markdown.js') },
      { find: /^dsh-ui-kit\/icons$/, replacement: path.resolve(__dirname, '..', 'dist/icons.js') },
      { find: /^dsh-ui-kit\/theme$/, replacement: path.resolve(__dirname, '..', 'dist/theme.js') },
      { find: /^dsh-ui-kit$/, replacement: path.resolve(__dirname, '..', 'dist/index.js') },
    ],
  },
  build: {
    outDir: 'dist',
  },
})
