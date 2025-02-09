import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom',
      'react-icons/fa': 'react-icons/fa'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-icons/fa', 'framer-motion'],
    exclude: [],
    esbuildOptions: {
      target: 'es2020'
    }
  },
  build: {
    target: 'es2020',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['react-icons/fa'],
          'motion': ['framer-motion']
        }
      }
    }
  }
})