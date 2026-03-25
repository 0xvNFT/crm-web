import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // In dev, proxy /api requests to the backend so the cookie is set on localhost.
      // This avoids the cross-origin cookie restriction (localhost ↔ remote IP).
      // In production, VITE_API_BASE_URL points directly to the backend — no proxy needed.
      '/api': {
        target: 'https://crm-server.cdts.com.ph',
        changeOrigin: true,
      },
    },
  },
})
