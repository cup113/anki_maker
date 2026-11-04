import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 4133,
    proxy: {
      '/api': {
        target: 'http://localhost:4134',
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://localhost:4134',
        changeOrigin: true,
      },
    },
  },
})
