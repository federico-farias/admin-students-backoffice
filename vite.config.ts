import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081', // Cambia esto por la URL de tu backend
        //target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        // Opcional: reescribe el path si necesitas remover /api del request
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
