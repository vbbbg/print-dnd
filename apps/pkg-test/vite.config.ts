import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', '@react-pdf/renderer'],
    alias: {
      react: resolve(__dirname, './node_modules/react'),
      'react-dom': resolve(__dirname, './node_modules/react-dom'),
    },
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
