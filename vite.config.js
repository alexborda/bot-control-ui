import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: "./", // Evita problemas de rutas en producción
  server: {
    host: true,
  },
});