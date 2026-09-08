import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

/**
 * Base path strategy for GitHub Pages.
 * - Locally the app is served from "/".
 * - Inside GitHub Actions `GITHUB_REPOSITORY` is "owner/repo"; project pages are
 *   served from "/repo/". A user/organization page (repo named "owner.github.io")
 *   is served from "/".
 * - `VITE_BASE_PATH` can override both when deploying to a custom host.
 */
function resolveBase(): string {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH
  const repository = process.env.GITHUB_REPOSITORY
  if (process.env.GITHUB_ACTIONS && repository) {
    const [owner, name] = repository.split('/')
    if (name && name.toLowerCase() !== `${owner.toLowerCase()}.github.io`) {
      return `/${name}/`
    }
  }
  return '/'
}

/**
 * GitHub Pages serves `404.html` for unknown paths. Copying the SPA entry file
 * there lets deep links such as `/cars/aureon-x1` resolve on refresh. `.nojekyll`
 * prevents Jekyll from ignoring underscore-prefixed asset folders.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-for-github-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const index = resolve(outDir, 'index.html')
      if (existsSync(index)) {
        copyFileSync(index, resolve(outDir, '404.html'))
        writeFileSync(resolve(outDir, '.nojekyll'), '')
      }
    },
  }
}

export default defineConfig({
  base: resolveBase(),
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/mixins" as *;\n`,
        loadPaths: [fileURLToPath(new URL('./src', import.meta.url))],
      },
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 3 },
            { name: 'r3f', test: /node_modules[\\/](@react-three|three-stdlib|three-mesh-bvh|maath|camera-controls|zustand|suspend-react|its-fine)[\\/]/, priority: 2 },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/, priority: 2 },
            { name: 'router', test: /node_modules[\\/]react-router/, priority: 2 },
          ],
        },
      },
    },
  },
})
