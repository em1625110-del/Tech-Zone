import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

let outputDirectory

const githubPagesFallback = {
  name: 'github-pages-spa-fallback',
  apply: 'build',
  configResolved(config) {
    outputDirectory = resolve(config.root, config.build.outDir)
  },
  closeBundle() {
    copyFileSync(
      resolve(outputDirectory, 'index.html'),
      resolve(outputDirectory, '404.html'),
    )
  },
}

export default defineConfig({
  plugins: [react(), githubPagesFallback],
  base: '/Tech-Zone/',
})