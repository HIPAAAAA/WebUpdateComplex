import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // For local backend testing if needed
        changeOrigin: true,
        // In Vercel dev, this is handled automatically. 
        // This is primarily for robustness if you run a separate backend.
      }
    }
  },
  build: {
    outDir: 'dist',
  },
});