import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  base: "./",
  server: {
    port: 3000, // Usa 3000 por defecto si Railway no define un puerto
    host: true,
  },
})
