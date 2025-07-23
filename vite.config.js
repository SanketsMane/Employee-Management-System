import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(
      mode === 'production' 
        ? 'https://your-vercel-app.vercel.app/api'
        : 'http://localhost:3002/api'
    )
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['framer-motion', 'lottie-react'],
          charts: ['chart.js'],
          utils: ['date-fns', '@headlessui/react', '@heroicons/react']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  }
}))
