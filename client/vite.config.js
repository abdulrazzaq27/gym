import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      host: true, // Expose on local network
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
