import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: `http://localhost:5000`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-label'],
        },
      },
      treeshake: {
        propertyReadSideEffects: false,
      },
    },
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'recharts'],
  },
})
