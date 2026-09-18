import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // La scène 3D de l'enseigne (Three.js, ~590 Ko minifiés, 150 Ko compressés) est un morceau chargé à part
    chunkSizeWarningLimit: 650,
  },
})
