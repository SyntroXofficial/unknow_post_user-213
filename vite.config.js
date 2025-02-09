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
      'react-icons/fa': 'react-icons/fa/index.js'
    }
  },
  optimizeDeps: {
    include: ['react-icons/fa'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/react-icons/],
      transformMixedEsModules: true
    }
  }
})