import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
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
 * Static copies of index.html so GitHub Pages returns 200 for known routes
 * (e.g. /login) instead of serving 404.html with HTTP 404. Deep links such as
 * /cars/aureon-x1 still use 404.html. `.nojekyll` keeps asset folders intact.
 */
const SPA_ROUTES = [
  'login',
  'signup',
  'forgot-password',
  'demo-login',
  'showroom',
  'cars',
  'used-cars',
  'upcoming',
  'vintage',
  'brochures',
  'locations',
  'sell',
  'categories',
  'configurator',
  'compare',
  'favorites',
  'saved-builds',
  'profile',
  'settings',
  'notifications',
  'privacy',
  'terms',
]

function writeSpaCopy(index: string, dest: string) {
  mkdirSync(dirname(dest), { recursive: true })
  copyFileSync(index, dest)
}

function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-for-github-pages',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    writeBundle() {
      const index = resolve(outDir, 'index.html')
      if (!existsSync(index)) return
      copyFileSync(index, resolve(outDir, '404.html'))
      writeFileSync(resolve(outDir, '.nojekyll'), '')
      for (const route of SPA_ROUTES) {
        writeSpaCopy(index, resolve(outDir, route, 'index.html'))
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
