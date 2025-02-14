import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: true
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
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
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
    },
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  }
})