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
        main:      resolve(__dirname, 'index.html'),
        services:  resolve(__dirname, 'services.html'),
        asadPods:  resolve(__dirname, 'asad-pods.html'),
        gallery:   resolve(__dirname, 'gallery.html'),
        contact:   resolve(__dirname, 'contact.html'),
        projects:  resolve(__dirname, 'projects.html'),
        blog:      resolve(__dirname, 'blog/index.html'),
        blogPost1: resolve(__dirname, 'blog/best-uses-for-accommodation-pods.html'),
        blogPost2: resolve(__dirname, 'blog/why-invest-in-a-tiny-home.html'),
        blogPost3: resolve(__dirname, 'blog/building-an-outdoor-entertainment-area.html'),
        blogPost4: resolve(__dirname, 'blog/tiny-home-on-stilts-tamboti-river-reserve.html'),
        pod1:      resolve(__dirname, 'asad-pods/pod-1.html'),
        pod3:      resolve(__dirname, 'asad-pods/pod-3.html'),
        podEntertainment: resolve(__dirname, 'asad-pods/entertainment-pod.html'),
      }
    }
  }
})
