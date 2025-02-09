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
      'react-icons/fa': 'react-icons/fa/index.js',
      'react': 'react'
    }
  },
  optimizeDeps: {
    include: ['react-icons/fa', 'framer-motion', 'react', 'react-dom'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/react-icons/, /framer-motion/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'framer-motion', 'react-icons'],
        }
      }
    }
  }
})
