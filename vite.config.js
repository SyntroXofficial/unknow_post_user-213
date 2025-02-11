import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      target: 'esnext'
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['react-icons/fa'],
          'motion': ['framer-motion']
        },
        inlineDynamicImports: false,
        sanitizeFileName: (name) => name.replace(/[<>:"/\\|?*]+/g, '-')
      }
    },
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },
  esbuild: {
    legalComments: 'none',
    target: 'esnext'
  }
})