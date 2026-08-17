import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/panel/",
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'https://www.ecospherewm.com',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_DEV_API_TARGET || 'https://www.ecospherewm.com',
        changeOrigin: true,
      }
    }
  }
})