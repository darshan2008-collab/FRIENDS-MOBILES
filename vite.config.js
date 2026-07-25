import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://backend:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://backend:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
