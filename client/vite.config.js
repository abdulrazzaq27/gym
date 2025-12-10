import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  ],
  server: {
    host: true, // Expose on local network
    proxy: {
      '/api': {
        target: 'http://192.168.10.110:3000',
        changeOrigin: true
      }
    }
  }
})
