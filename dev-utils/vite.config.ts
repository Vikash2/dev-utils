import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    // Ensure proper handling of assets
    assetsDir: 'assets',
  },
  // Base URL for the app (use '/' for root deployment)
  base: '/',
})
