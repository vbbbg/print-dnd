import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isApp = process.env.BUILD_MODE === 'app'

  return {
    plugins: [
      react(),
      tailwindcss(),
      dts({
        insertTypesEntry: true,
        enabled: !isApp, // Disable dts generation for app build
      }),
    ],
    resolve: {
      dedupe: ['react', 'react-dom', '@react-pdf/renderer'],
      alias: {
        react: path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        '@': path.resolve(__dirname, './src'),
        'pdf-generator': path.resolve(
          __dirname,
          '../pdf-generator/src/index.tsx'
        ),
        '@react-pdf/renderer': path.resolve(
          __dirname,
          '../pdf-generator/node_modules/@react-pdf/renderer'
        ),
      },
    },
    optimizeDeps: {
      include: ['@react-pdf/renderer'],
    },
    build: isApp
      ? {
          outDir: 'dist-app',
        }
      : {
          lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'PrintEditor',
            formats: ['es', 'umd'],
            fileName: (format) => `index.${format}.js`,
          },
          rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM',
              },
              assetFileNames: (assetInfo) => {
                if (assetInfo.name === 'style.css') return 'style.css'
                return assetInfo.name
              },
            },
          },
        },
  }
})
