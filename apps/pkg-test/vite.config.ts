import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@react-pdf/renderer'],
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
    exclude: ['print-client'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
