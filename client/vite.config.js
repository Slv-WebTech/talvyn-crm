import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ports can be overridden (e.g. when 5000/5173 are taken): CLIENT_PORT, API_PORT.
const clientPort = Number(process.env.CLIENT_PORT ?? 5173)
const apiPort = Number(process.env.API_PORT ?? 5000)

export default defineConfig({
  plugins: [react()],
  server: {
    port: clientPort,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
})
