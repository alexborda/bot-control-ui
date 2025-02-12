import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: "./", // Evita problemas de rutas en producción
  server: {
    port: 8080,
    host: true,
  },
});