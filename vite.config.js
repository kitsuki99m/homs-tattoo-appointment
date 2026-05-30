import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/homs-tattoo/',
  publicDir: 'public',
  plugins: [
    tailwindcss(),
  ],
  server: {
    open: '/homs-tattoo/main.html',
    watch: {
      ignored: ['**/homs-server-deployment/src/**'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'main.html'),
      }
    }
  }
})