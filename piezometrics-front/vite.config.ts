import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:61591',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:61591',
        changeOrigin: true,
      },
      '/grafana-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/grafana-api/, '/api'),
      },
    },
  },
})
