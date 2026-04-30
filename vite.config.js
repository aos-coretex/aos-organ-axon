import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Vite dev must not collide with an organ port. Receptor owns 4050 (relay a7u-8),
    // so the dev server has moved off 4050. 5173 is Vite's own default.
    port: parseInt(process.env.VITE_PORT || '5173', 10),
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
