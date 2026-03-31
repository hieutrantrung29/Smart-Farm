import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // ✅ PROXY: giải quyết CORS khi gọi Adafruit IO từ browser
  server: {
  proxy: {
    '/api/adafruit': {
      target: 'https://io.adafruit.com',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/adafruit/, '/api/v2/xamnhach'),
    },
  },
},
})
