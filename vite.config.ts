import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { writeFileSync } from 'fs'
import { createHash } from 'crypto'

// Stable build version: short hash of the current timestamp.
// Written into the bundle AND into dist/version.json so the running app
// can poll /version.json to detect when a new deploy has landed.
const buildVersion = createHash('sha1')
  .update(Date.now().toString())
  .digest('hex')
  .slice(0, 8)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // Write dist/version.json after every build so nginx serves it at /version.json
      name: 'write-version-json',
      closeBundle() {
        writeFileSync('dist/version.json', JSON.stringify({ version: buildVersion }))
      },
    },
  ],
  define: {
    // Baked into the JS bundle — used by useVersionCheck to compare against /version.json
    __APP_VERSION__: JSON.stringify(buildVersion),
  },
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
