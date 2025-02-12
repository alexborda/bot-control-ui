import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  base: "./", // Evita problemas de rutas en producción
  build: {
    outDir: "dist", // Se asegura de que el build se guarde correctamente
  },
  server: {
    port: 3000, // Usa un puerto estándar
    host: true,
  },
})
