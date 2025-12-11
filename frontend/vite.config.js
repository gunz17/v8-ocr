import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // พอร์ต Frontend
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // ชี้ไปหา Backend ของเรา
        changeOrigin: true,
        secure: false,
      }
    }
  }
})