import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/transactions': 'http://localhost:3000',
      '/card-payments': 'http://localhost:3000',
      '/accounts': 'http://localhost:3000',
    },
  },
})
