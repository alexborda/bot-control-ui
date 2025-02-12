import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: "./", // Evita problemas de rutas en producción
  build: {
    outDir: "dist", // Asegura que la build se guarde en "dist"
  },
  server: {
    port: process.env.PORT || 3000, // Usa Railway si está disponible
    host: true,
  },
});