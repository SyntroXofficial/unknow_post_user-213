import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 100
    }
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['react-icons/fa'],
          'motion': ['framer-motion']
        }
      }
    },
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  }
})