import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: "./",  // Asegura rutas correctas en producción
  server: {
    port: 3000,
    host: true
  }
});
