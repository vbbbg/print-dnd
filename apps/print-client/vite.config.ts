import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'PrintClient',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@react-pdf/renderer'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@react-pdf/renderer': 'ReactPDF',
        },
      },
    },
  },
})
