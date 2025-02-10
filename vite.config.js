import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact()],
  base: "./", // Asegura rutas correctas en producción
  server: {
    host: true,
  },
})
