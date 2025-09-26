import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://generativelanguage.googleapis.com https://*.googleapis.com https://apis.google.com https://www.gstatic.com; connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; object-src 'none';",
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['@google/generative-ai']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'google-ai': ['@google/generative-ai']
        }
      }
    }
  }
})
