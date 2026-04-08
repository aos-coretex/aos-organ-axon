import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT || '4050', 10),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT || '4051'}`,
        changeOrigin: true,
      },
      '/ws': {
        target: `ws://localhost:${process.env.API_PORT || '4051'}`,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
