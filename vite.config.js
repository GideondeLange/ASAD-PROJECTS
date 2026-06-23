import { defineConfig } from 'vite'
import { resolve } from 'path'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

export default defineConfig({
  publicDir: 'public',
  plugins: [
    ViteImageOptimizer({
      includePublic: true,
      jpg:  { quality: 82 },
      jpeg: { quality: 82 },
      png:  { quality: 82 },
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        services: resolve(__dirname, 'services.html'),
        bidwell:  resolve(__dirname, 'bidwell.html'),
        gallery:  resolve(__dirname, 'gallery.html'),
        contact:  resolve(__dirname, 'contact.html'),
        projects: resolve(__dirname, 'projects.html'),
      }
    }
  }
})
