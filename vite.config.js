import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  base: "./",  // Asegura rutas correctas en producción
  server: {
    host: "0.0.0.0",
    port: parseInt(process.env.PORT) || 8080
  }
});
