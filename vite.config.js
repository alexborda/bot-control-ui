import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: "./", // Evita problemas de rutas en producción
  server: {
    port: process.env.PORT || 3000, // Usa Railway si está disponible
    host: true,
  },
});