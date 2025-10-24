import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config with dev proxy so /api requests hit the Flask server on 4000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
